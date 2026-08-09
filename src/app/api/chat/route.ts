import { stepCountIs, streamText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { createMaestroTools } from '@/lib/ai/tools';
import { requireTenant } from '@/lib/auth/get-tenant';
import { requireRole } from '@/lib/auth/rbac';

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY || undefined });
export const maxDuration = 30;

const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1).max(20_000),
  })).min(1).max(50),
});

export async function POST(req: Request) {
  const tenant = await requireTenant();
  const user = await requireRole('admin', 'finance', 'manager', 'member');
  if (!process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant')) {
    return Response.json({ error: 'Maestro AI is not configured. Set ANTHROPIC_API_KEY.' }, { status: 503 });
  }

  const parsed = chatRequestSchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: 'Invalid chat request', details: parsed.error.flatten() }, { status: 400 });
  }

  const systemPrompt = `
You are "المايسترو" (Maestro), the read-only executive business assistant in Officia MENA.
Current company: ${tenant.name}; country: ${tenant.country || 'unknown'}; CRN: ${tenant.crn}; VAT/TRN: ${tenant.trn || 'not configured'}.
You have tenant-isolated read-only tools for accounting, invoices, expenses, HR, payroll, inventory, alerts and documents.

TRUTH AND EVIDENCE RULES:
1. Never invent records, totals, legal requirements, statuses or dates.
2. For every company-specific answer, call the relevant tool first.
3. Treat tool calculations as authoritative; never recompute financial totals yourself.
4. End factual answers with a "المصادر / Sources" section using returned source labels and links.
5. State the returned data timestamp.
6. If data is empty, say no records were found. Never substitute demo data.
7. If a tool returns ok=false, explain that the requested data could not be verified.
8. You may create a proposal only when the user explicitly asks to prepare a draft. A proposal never changes business records.
9. Before proposing, restate the exact payload and financial effect. The proposal requires an authorized human review in Maestro Approvals.
10. Never claim a proposal is executed, approved, submitted or sent. Only say it is waiting for approval and include the review URL.
11. For ZATCA or tax questions, search the regulations tool and distinguish sourced requirements from general guidance.
12. For internal documents, use document search and cite filenames.

Respond in the language used by the user. Be concise, concrete and professionally cautious.
`;

  const result = streamText({
    model: anthropic(process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest'),
    system: systemPrompt,
    messages: parsed.data.messages,
    tools: createMaestroTools(tenant, user.id),
    stopWhen: stepCountIs(6),
  });

  // The deployed AI SDK exposes one of these response adapters depending on its minor version.
  // @ts-expect-error Runtime compatibility with the installed AI SDK.
  return result.toDataStreamResponse ? result.toDataStreamResponse() : result.toTextStreamResponse();
}
