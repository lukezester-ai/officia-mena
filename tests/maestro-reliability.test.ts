import { describe, expect, it } from 'vitest';
import { evaluateMaestroRun } from '@/lib/ai/evaluation';

describe('Maestro automatic evaluation', () => {
  it('scores an evidenced answer with sources at 100', () => {
    expect(evaluateMaestroRun({ text: 'Result\n\nSources: ledger', toolNames: ['getFinancialOverview'], intent: 'financial_control' }))
      .toEqual({ score: 100, flags: [] });
  });
  it('flags factual answers without tool evidence', () => {
    const result = evaluateMaestroRun({ text: 'Revenue is 10.', toolNames: [], intent: 'financial_control' });
    expect(result.score).toBeLessThan(100); expect(result.flags).toContain('no_tool_evidence');
  });
  it('flags unsupported external action claims', () => {
    expect(evaluateMaestroRun({ text: 'Изпратих документа.', toolNames: [], intent: 'general_business' }).flags)
      .toContain('unsupported_action_claim');
  });
});
