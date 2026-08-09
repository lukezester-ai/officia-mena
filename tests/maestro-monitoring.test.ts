import { describe, expect, it } from 'vitest';
import { daysUntil, invoiceRisks } from '@/lib/ai/monitoring';

const now = new Date('2026-08-09T12:00:00.000Z');

describe('Maestro proactive monitoring', () => {
  it('calculates calendar-day distance consistently', () => {
    expect(daysUntil('2026-08-19T12:00:00.000Z', now)).toBe(10);
    expect(daysUntil('2026-08-08T12:00:00.000Z', now)).toBe(-1);
  });

  it('raises a critical alert for a receivable overdue by more than 90 days', () => {
    const risks = invoiceRisks([{
      id: 'invoice-1', invoiceNumber: 'INV-001', clientName: 'Acme', totalAmount: '1250.00',
      status: 'overdue', dueDate: new Date('2026-04-01T12:00:00.000Z'), issueDate: new Date('2026-03-01T12:00:00.000Z'),
      isZatcaReported: true, zatcaStatus: 'reported',
    }], now);
    expect(risks).toHaveLength(1);
    expect(risks[0]).toMatchObject({ fingerprint: 'monitor:overdue_invoice:invoice-1', priority: 'critical' });
  });

  it('raises a ZATCA delay only for an issued, unreported invoice older than 24 hours', () => {
    const risks = invoiceRisks([{
      id: 'invoice-2', invoiceNumber: 'INV-002', clientName: 'Beta', totalAmount: '100.00',
      status: 'issued', dueDate: new Date('2026-09-01T12:00:00.000Z'), issueDate: new Date('2026-08-07T12:00:00.000Z'),
      isZatcaReported: false, zatcaStatus: 'pending',
    }], now);
    expect(risks).toHaveLength(1);
    expect(risks[0]).toMatchObject({ type: 'zatca_delay', priority: 'high' });
  });

  it('does not alert on paid and reported invoices', () => {
    expect(invoiceRisks([{
      id: 'invoice-3', invoiceNumber: 'INV-003', clientName: 'Gamma', totalAmount: '100.00',
      status: 'paid', dueDate: new Date('2026-01-01T12:00:00.000Z'), issueDate: new Date('2026-01-01T12:00:00.000Z'),
      isZatcaReported: true, zatcaStatus: 'reported',
    }], now)).toEqual([]);
  });
});
