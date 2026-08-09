export function evaluateMaestroRun(input: { text: string; toolNames: string[]; intent: string }) {
  const flags: string[] = [];
  let score = 100;
  if (!input.text.trim()) { flags.push('empty_response'); score -= 100; }
  const needsEvidence = !['general_business'].includes(input.intent);
  if (needsEvidence && input.toolNames.length === 0) { flags.push('no_tool_evidence'); score -= 40; }
  if (input.toolNames.length > 0 && !/(sources|източници|المصادر)/iu.test(input.text)) { flags.push('missing_source_section'); score -= 20; }
  if (/(i (sent|submitted|approved|created)|изпратих|подадох|одобрих|създадох|تم الإرسال|تمت الموافقة)/iu.test(input.text)
    && !input.toolNames.some((name) => name.startsWith('propose'))) { flags.push('unsupported_action_claim'); score -= 40; }
  if (input.text.length > 12_000) { flags.push('excessive_length'); score -= 10; }
  return { score: Math.max(0, score), flags };
}
