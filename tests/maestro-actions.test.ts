import { describe, expect, it } from 'vitest';
import { actionTypeSchema, validateActionPayload } from '@/lib/ai/actions';

describe('Maestro action validation', () => {
  it('accepts a valid draft invoice and supplies the default VAT rate', () => {
    expect(validateActionPayload('draft_invoice', { clientName: 'Acme LLC', subtotal: 1000 }))
      .toMatchObject({ clientName: 'Acme LLC', subtotal: 1000, vatRate: 15 });
  });

  it('accepts a valid draft expense date', () => {
    expect(validateActionPayload('draft_expense', {
      description: 'Office supplies', amount: 125, category: 'office', expenseDate: '2026-08-09',
    })).toMatchObject({ amount: 125, expenseDate: '2026-08-09' });
  });

  it('rejects unsafe financial values and malformed dates', () => {
    expect(() => validateActionPayload('draft_invoice', { clientName: 'Acme LLC', subtotal: -1 })).toThrow();
    expect(() => validateActionPayload('draft_expense', {
      description: 'Office supplies', amount: 10, category: 'office', expenseDate: '09/08/2026',
    })).toThrow();
  });

  it('only permits the supported proposal actions', () => {
    expect(actionTypeSchema.safeParse('delete_invoice').success).toBe(false);
  });
});
