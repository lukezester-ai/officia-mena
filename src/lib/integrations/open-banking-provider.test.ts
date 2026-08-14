import { describe, expect, it } from 'vitest';
import { openBankingAccountSchema, openBankingTransactionSchema } from './open-banking-provider';

describe('Open Banking boundary schemas', () => {
  it('normalizes valid provider records', () => {
    expect(openBankingAccountSchema.parse({ id: 'acc-1', bankName: 'Sandbox Bank', accountName: 'Operating',
      iban: 'SA0380000000608010167519', currency: 'sar', balance: 1250.5, status: 'active' }).currency).toBe('SAR');
    expect(openBankingTransactionSchema.parse({ id: 'tx-1', accountId: 'acc-1', bookedAt: '2026-08-10T08:00:00.000Z',
      description: 'Invoice payment', amount: 100, currency: 'sar', direction: 'credit' }).currency).toBe('SAR');
  });

  it('rejects malformed provider data before database writes', () => {
    expect(() => openBankingTransactionSchema.parse({ id: '', accountId: 'acc-1', bookedAt: 'not-a-date',
      description: '', amount: Number.NaN, currency: 'SAR', direction: 'credit' })).toThrow();
  });
});
