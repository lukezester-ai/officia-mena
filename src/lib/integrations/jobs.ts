import { createHash } from 'node:crypto';
import { and, eq, inArray, lte } from 'drizzle-orm';
import { z } from 'zod';
import { db, withTenantContext } from '@/lib/db/db';
import { integrationEvents, integrationJobs } from '@/lib/db/schema/ai_orchestration';
import { auditLogs } from '@/lib/db/schema/audit_logs';
import { invoices } from '@/lib/db/schema/invoices';
import { tenants } from '@/lib/db/schema/tenants';
import { sendIntegrationEmail, submitZatcaDocument } from './connectors';

export const integrationJobTypeSchema = z.enum(['send_email', 'submit_zatca']);
const emailPayloadSchema = z.object({ to: z.string().email(), subject: z.string().min(1).max(200), text: z.string().min(1).max(20_000) });
const zatcaPayloadSchema = z.object({ invoiceId: z.string().uuid(), mode: z.enum(['clearance', 'reporting']) });
export const jobPayloadSchemas = { send_email: emailPayloadSchema, submit_zatca: zatcaPayloadSchema } as const;

export function retryDelayMs(attempt: number) { return Math.min(3_600_000, 30_000 * 2 ** Math.max(0, attempt - 1)); }

export async function enqueueIntegrationJob(input: { tenantId: string; jobType: z.infer<typeof integrationJobTypeSchema>; payload: unknown; approvedByUserId: string }) {
  const payload = jobPayloadSchemas[input.jobType].parse(input.payload);
  const idempotencyKey = createHash('sha256').update(JSON.stringify({ tenantId: input.tenantId, jobType: input.jobType, payload })).digest('hex');
  const [created] = await db.insert(integrationJobs).values({ tenantId: input.tenantId, jobType: input.jobType, payload,
    idempotencyKey, approvedByUserId: input.approvedByUserId }).onConflictDoNothing({ target: [integrationJobs.tenantId, integrationJobs.idempotencyKey] }).returning();
  if (created) return created;
  const [existing] = await db.select().from(integrationJobs).where(and(eq(integrationJobs.tenantId, input.tenantId), eq(integrationJobs.idempotencyKey, idempotencyKey))).limit(1);
  return existing;
}

async function executeJob(job: typeof integrationJobs.$inferSelect) {
  if (job.jobType === 'send_email') {
    const payload = emailPayloadSchema.parse(job.payload);
    const result = await sendIntegrationEmail({ ...payload, idempotencyKey: job.idempotencyKey });
    return { provider: 'email', externalId: result?.id || job.id, metadata: { recipient: payload.to } };
  }
  const payload = zatcaPayloadSchema.parse(job.payload);
  const [invoice] = await db.select().from(invoices).where(and(eq(invoices.id, payload.invoiceId), eq(invoices.tenantId, job.tenantId))).limit(1);
  if (!invoice) throw new Error('Invoice not found.');
  if (!['issued', 'paid'].includes(invoice.status || '')) throw new Error('Only issued invoices can be submitted to ZATCA.');
  if (!invoice.zatcaXml || !invoice.zatcaHash) throw new Error('Signed ZATCA XML and invoice hash are required.');
  const result = await submitZatcaDocument({ tenantId: job.tenantId, mode: payload.mode, invoiceHash: invoice.zatcaHash, uuid: invoice.id,
    invoiceBase64: Buffer.from(invoice.zatcaXml, 'utf8').toString('base64') });
  await db.update(invoices).set({ zatcaStatus: payload.mode === 'clearance' ? 'cleared' : 'reported', isZatcaReported: true, updatedAt: new Date() })
    .where(and(eq(invoices.id, invoice.id), eq(invoices.tenantId, job.tenantId)));
  const response = result && typeof result === 'object' ? result as Record<string, unknown> : {};
  return { provider: 'zatca', externalId: job.id, metadata: { invoiceId: invoice.id, mode: payload.mode,
    reportingStatus: response.reportingStatus, clearanceStatus: response.clearanceStatus, validationResults: response.validationResults } };
}

export async function processDueIntegrationJobs(limit = 20) {
  const results: Array<{ id: string; status: string }> = [];
  const tenantRows = await db.select({ id: tenants.id }).from(tenants);
  for (const tenant of tenantRows) {
    if (results.length >= limit) break;
    await withTenantContext(tenant.id, async () => {
      const due = await db.select().from(integrationJobs)
        .where(and(eq(integrationJobs.tenantId, tenant.id), inArray(integrationJobs.status, ['pending', 'retry']), lte(integrationJobs.nextAttemptAt, new Date())))
        .limit(limit - results.length);
      for (const candidate of due) {
        const [job] = await db.update(integrationJobs).set({ status: 'processing', startedAt: new Date(), attempts: candidate.attempts + 1, updatedAt: new Date() })
          .where(and(eq(integrationJobs.id, candidate.id), eq(integrationJobs.tenantId, tenant.id), inArray(integrationJobs.status, ['pending', 'retry']))).returning();
        if (!job) continue;
        try {
          const outcome = await executeJob(job);
          await db.insert(integrationEvents).values({ tenantId: job.tenantId, provider: outcome.provider, externalId: outcome.externalId,
            eventType: job.jobType, status: 'completed', metadata: outcome.metadata }).onConflictDoNothing();
          await db.update(integrationJobs).set({ status: 'completed', externalId: outcome.externalId, completedAt: new Date(), lastError: null, updatedAt: new Date() })
            .where(and(eq(integrationJobs.id, job.id), eq(integrationJobs.tenantId, tenant.id)));
          await db.insert(auditLogs).values({ tenantId: job.tenantId, userId: job.approvedByUserId, entityType: 'integration_job', entityId: job.id,
            action: 'INTEGRATION_DONE', newValues: { jobType: job.jobType, externalId: outcome.externalId } });
          results.push({ id: job.id, status: 'completed' });
        } catch (error) {
          const dead = job.attempts >= job.maxAttempts; const message = error instanceof Error ? error.message : String(error);
          await db.update(integrationJobs).set({ status: dead ? 'dead_letter' : 'retry', lastError: message.slice(0, 2000),
            nextAttemptAt: new Date(Date.now() + retryDelayMs(job.attempts)), updatedAt: new Date() })
            .where(and(eq(integrationJobs.id, job.id), eq(integrationJobs.tenantId, tenant.id)));
          results.push({ id: job.id, status: dead ? 'dead_letter' : 'retry' });
        }
      }
    });
  }
  return results;
}
