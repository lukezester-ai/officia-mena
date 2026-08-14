import { z } from 'zod';

export const openBankingAccountSchema = z.object({
  id: z.string().min(1).max(255),
  bankName: z.string().min(1).max(100),
  accountName: z.string().min(1).max(100),
  iban: z.string().min(8).max(50),
  currency: z.string().length(3).transform((value) => value.toUpperCase()),
  balance: z.number().finite(),
  status: z.enum(['active', 'inactive', 'blocked']).default('active'),
});

export const openBankingTransactionSchema = z.object({
  id: z.string().min(1).max(255),
  accountId: z.string().min(1).max(255),
  bookedAt: z.string().datetime(),
  description: z.string().max(2_000),
  amount: z.number().finite(),
  currency: z.string().length(3).transform((value) => value.toUpperCase()),
  direction: z.enum(['credit', 'debit']),
});

export type OpenBankingAccount = z.infer<typeof openBankingAccountSchema>;
export type OpenBankingTransaction = z.infer<typeof openBankingTransactionSchema>;
const consentSchema = z.object({ id: z.string().min(1).max(255), authorizationUrl: z.string().url().optional(),
  status: z.enum(['awaiting_authorization', 'authorized', 'rejected', 'revoked', 'expired']), expiresAt: z.string().datetime().optional() });

export interface OpenBankingProvider {
  readonly name: string;
  readonly environment: 'sandbox' | 'production';
  health(): Promise<void>;
  createConsent(redirectUri: string): Promise<z.infer<typeof consentSchema>>;
  getConsent(consentId: string): Promise<z.infer<typeof consentSchema>>;
  listAccounts(): Promise<OpenBankingAccount[]>;
  listTransactions(since: string): Promise<OpenBankingTransaction[]>;
}

class HttpOpenBankingProvider implements OpenBankingProvider {
  readonly name = process.env.OPEN_BANKING_PROVIDER || 'generic-ob';
  readonly environment = process.env.OPEN_BANKING_ENV === 'production' ? 'production' : 'sandbox';

  private async request(path: string, search?: Record<string, string>, init?: { method?: 'GET' | 'POST'; body?: unknown }) {
    if (!process.env.OPEN_BANKING_API_URL || !process.env.OPEN_BANKING_ACCESS_TOKEN) {
      throw new Error('Open Banking provider is not configured.');
    }
    const url = new URL(path, process.env.OPEN_BANKING_API_URL);
    for (const [key, value] of Object.entries(search || {})) url.searchParams.set(key, value);
    const response = await fetch(url, { method: init?.method || 'GET', headers: { Authorization: `Bearer ${process.env.OPEN_BANKING_ACCESS_TOKEN}`,
      Accept: 'application/json', 'Content-Type': 'application/json', 'X-Client-Id': process.env.OPEN_BANKING_CLIENT_ID || '' },
      body: init?.body ? JSON.stringify(init.body) : undefined, signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error(`Open Banking provider returned HTTP ${response.status}.`);
    return response.json();
  }

  async health() { await this.request(process.env.OPEN_BANKING_HEALTH_PATH || '/health'); }
  async createConsent(redirectUri: string) {
    const body = await this.request(process.env.OPEN_BANKING_CONSENTS_PATH || '/consents', undefined, { method: 'POST',
      body: { redirectUri, scopes: ['accounts:read', 'transactions:read'], environment: this.environment } });
    return consentSchema.parse(body);
  }
  async getConsent(consentId: string) {
    const path = `${process.env.OPEN_BANKING_CONSENTS_PATH || '/consents'}/${encodeURIComponent(consentId)}`;
    return consentSchema.parse(await this.request(path));
  }
  async listAccounts() {
    const body = await this.request(process.env.OPEN_BANKING_ACCOUNTS_PATH || '/accounts');
    return z.array(openBankingAccountSchema).parse(Array.isArray(body) ? body : (body as { accounts?: unknown }).accounts);
  }
  async listTransactions(since: string) {
    const body = await this.request(process.env.OPEN_BANKING_TRANSACTIONS_PATH || '/transactions', { since });
    return z.array(openBankingTransactionSchema).parse(Array.isArray(body) ? body : (body as { transactions?: unknown }).transactions);
  }
}

export function getOpenBankingProvider(tenantId: string): OpenBankingProvider {
  if (!process.env.OPEN_BANKING_TENANT_ID || process.env.OPEN_BANKING_TENANT_ID !== tenantId) {
    throw new Error('Open Banking credentials are not scoped to this tenant.');
  }
  if (process.env.OPEN_BANKING_ENV === 'production' && process.env.OPEN_BANKING_PRODUCTION_ENABLED !== 'true') {
    throw new Error('Open Banking production access is disabled until provider certification is complete.');
  }
  return new HttpOpenBankingProvider();
}
