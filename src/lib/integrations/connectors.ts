import { Resend } from 'resend';
import { z } from 'zod';

export type ConnectorHealth = { provider: 'email' | 'banking' | 'zatca'; status: 'connected' | 'not_configured' | 'blocked' | 'error'; environment: 'sandbox' | 'production'; message: string };

export async function checkConnectors(tenantId?: string): Promise<ConnectorHealth[]> {
  const email: ConnectorHealth = process.env.RESEND_API_KEY && process.env.REPORT_FROM_EMAIL
    ? { provider: 'email', status: 'connected', environment: 'production', message: 'API key and verified sender configuration are present.' }
    : { provider: 'email', status: 'not_configured', environment: 'sandbox', message: 'RESEND_API_KEY and REPORT_FROM_EMAIL are required.' };

  let banking: ConnectorHealth = process.env.OPEN_BANKING_API_URL && process.env.OPEN_BANKING_ACCESS_TOKEN && (!tenantId || process.env.OPEN_BANKING_TENANT_ID === tenantId)
    ? { provider: 'banking', status: 'connected', environment: process.env.OPEN_BANKING_ENV === 'production' ? 'production' : 'sandbox', message: 'Provider endpoint and access token are configured.' }
    : { provider: 'banking', status: 'blocked', environment: 'sandbox', message: 'A certified Open Banking provider endpoint and access token are required.' };
  if (banking.status === 'connected' && process.env.OPEN_BANKING_HEALTH_URL) {
    try {
      const response = await fetch(process.env.OPEN_BANKING_HEALTH_URL, { headers: { Authorization: `Bearer ${process.env.OPEN_BANKING_ACCESS_TOKEN}` }, signal: AbortSignal.timeout(8000) });
      if (!response.ok) banking = { ...banking, status: 'error', message: `Provider health check returned HTTP ${response.status}.` };
    } catch { banking = { ...banking, status: 'error', message: 'Provider health check failed.' }; }
  }

  const zatca: ConnectorHealth = process.env.ZATCA_API_URL && process.env.ZATCA_CSID && process.env.ZATCA_CSID_SECRET && (!tenantId || process.env.ZATCA_TENANT_ID === tenantId)
    ? { provider: 'zatca', status: 'connected', environment: process.env.ZATCA_ENV === 'production' ? 'production' : 'sandbox', message: 'ZATCA CSID credentials and endpoint are configured; document validation is still required per submission.' }
    : { provider: 'zatca', status: 'blocked', environment: 'sandbox', message: 'ZATCA API URL, Production/Sandbox CSID and secret are required.' };
  return [email, banking, zatca];
}

export async function sendIntegrationEmail(input: { to: string; subject: string; text: string; idempotencyKey: string }) {
  if (!process.env.RESEND_API_KEY || !process.env.REPORT_FROM_EMAIL) throw new Error('Email connector is not configured.');
  const result = await new Resend(process.env.RESEND_API_KEY).emails.send({ from: process.env.REPORT_FROM_EMAIL,
    to: z.string().email().parse(input.to), subject: input.subject.slice(0, 200), text: input.text.slice(0, 20_000),
  }, { idempotencyKey: input.idempotencyKey });
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

const bankTransactionSchema = z.object({ id: z.string(), accountId: z.string().uuid(), bookedAt: z.string().datetime(),
  description: z.string(), amount: z.number(), currency: z.string().length(3), direction: z.enum(['credit', 'debit']) });
export async function fetchOpenBankingTransactions(tenantId: string, since: string) {
  if (!process.env.OPEN_BANKING_API_URL || !process.env.OPEN_BANKING_ACCESS_TOKEN) throw new Error('Open Banking connector is not configured.');
  if (process.env.OPEN_BANKING_TENANT_ID !== tenantId) throw new Error('Open Banking credentials are not scoped to this tenant.');
  const url = new URL('/transactions', process.env.OPEN_BANKING_API_URL); url.searchParams.set('since', since);
  const response = await fetch(url, { headers: { Authorization: `Bearer ${process.env.OPEN_BANKING_ACCESS_TOKEN}`, Accept: 'application/json' }, signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Open Banking API returned HTTP ${response.status}.`);
  return z.array(bankTransactionSchema).parse(await response.json());
}

export async function submitZatcaDocument(input: { tenantId: string; mode: 'clearance' | 'reporting'; invoiceHash: string; uuid: string; invoiceBase64: string }) {
  if (!process.env.ZATCA_API_URL || !process.env.ZATCA_CSID || !process.env.ZATCA_CSID_SECRET) throw new Error('ZATCA connector is not configured.');
  if (process.env.ZATCA_TENANT_ID !== input.tenantId) throw new Error('ZATCA CSID is not scoped to this tenant.');
  const path = input.mode === 'clearance' ? '/invoices/clearance/single' : '/invoices/reporting/single';
  const response = await fetch(new URL(path, process.env.ZATCA_API_URL), { method: 'POST', signal: AbortSignal.timeout(20_000),
    headers: { Authorization: `Basic ${Buffer.from(`${process.env.ZATCA_CSID}:${process.env.ZATCA_CSID_SECRET}`).toString('base64')}`,
      Accept: 'application/json', 'Content-Type': 'application/json', 'Accept-Version': 'V2' },
    body: JSON.stringify({ invoiceHash: input.invoiceHash, uuid: input.uuid, invoice: input.invoiceBase64 }) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`ZATCA ${input.mode} returned HTTP ${response.status}.`);
  return body;
}
