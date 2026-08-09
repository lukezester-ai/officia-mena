import { describe, expect, it } from 'vitest';
import { filterTools, routeMaestroRequest } from '@/lib/ai/orchestrator';
import { formatMemoryContext } from '@/lib/ai/memory';

describe('Maestro specialist orchestration', () => {
  it.each([
    ['Покажи ми просрочените фактури', 'collections'],
    ['Има ли изтичащи документи на служители?', 'hr'],
    ['Провери складовите наличности', 'inventory'],
    ['What does ZATCA require?', 'tax'],
    ['Дай финансов отчет', 'finance'],
  ])('routes %s to %s', (question, specialist) => {
    expect(routeMaestroRequest(question).specialist).toBe(specialist);
  });

  it('uses the executive coordinator for cross-functional questions', () => {
    const route = routeMaestroRequest('Сравни финансите и складовите наличности');
    expect(route.specialist).toBe('executive');
    expect(route.intent).toBe('cross_functional');
  });

  it('exposes only the tools allowed for the selected specialist', () => {
    const tools = { getFinancialOverview: 1, getPayrollSummary: 2, searchDocuments: 3 };
    expect(filterTools(tools, ['getFinancialOverview', 'searchDocuments'])).toEqual({ getFinancialOverview: 1, searchDocuments: 3 });
  });

  it('formats explicit memory as labelled data', () => {
    expect(formatMemoryContext([{ scope: 'user', category: 'preference', memoryKey: 'language', value: 'Bulgarian' }]))
      .toBe('- [user/preference] language: Bulgarian');
    expect(formatMemoryContext([])).toContain('No explicit');
  });
});
