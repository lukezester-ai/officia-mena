import { describe, it, expect } from 'vitest';
import { centsToMoney, moneyToCents } from '@/lib/accounting/utils';
import { generateZatcaQrCode } from '@/lib/accounting/zatca-qr';

describe('financial utilities', () => {
  it('converts money without floating-point drift', () => {
    expect(moneyToCents('123.45')).toBe(12345);
    expect(centsToMoney(12345)).toBe('123.45');
  });

  it('rejects money with more than two decimals', () => {
    expect(() => moneyToCents('1.001')).toThrow('Invalid money amount');
  });

  it('generates a base64 ZATCA TLV payload', () => {
    const qr = generateZatcaQrCode({
      sellerName: 'Example Co',
      vatNumber: '310123456700003',
      timestamp: '2026-08-08T12:00:00.000Z',
      invoiceTotal: '115.00',
      vatTotal: '15.00',
    });
    expect(Buffer.from(qr, 'base64').length).toBeGreaterThan(20);
  });
});
