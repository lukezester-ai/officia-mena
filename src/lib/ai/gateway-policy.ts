import { and, desc, eq, gte } from 'drizzle-orm';
import { db } from '@/lib/db/db';
import { maestroAiRuns } from '@/lib/db/schema/ai_orchestration';

const CIRCUIT_WINDOW_MS = 10 * 60 * 1000;
const MINIMUM_RUNS = 3;
const FAILURE_RATIO = 0.5;

export async function getMaestroCircuitDecision(tenantId: string) {
  const since = new Date(Date.now() - CIRCUIT_WINDOW_MS);
  const recentRuns = await db.select({ status: maestroAiRuns.status })
    .from(maestroAiRuns)
    .where(and(eq(maestroAiRuns.tenantId, tenantId), gte(maestroAiRuns.createdAt, since)))
    .orderBy(desc(maestroAiRuns.createdAt))
    .limit(20);
  const terminalRuns = recentRuns.filter((run) => run.status === 'completed' || run.status === 'failed');
  const failures = terminalRuns.filter((run) => run.status === 'failed').length;
  const failureRatio = terminalRuns.length ? failures / terminalRuns.length : 0;
  return {
    circuitOpen: terminalRuns.length >= MINIMUM_RUNS && failures >= MINIMUM_RUNS && failureRatio >= FAILURE_RATIO,
    sampleSize: terminalRuns.length,
    failures,
    failureRatio,
  };
}

export function classifyAiError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  if (message.includes('abort') || message.includes('timeout')) return 'MODEL_TIMEOUT';
  if (message.includes('rate') || message.includes('429')) return 'MODEL_RATE_LIMIT';
  if (message.includes('auth') || message.includes('401') || message.includes('403')) return 'MODEL_AUTH_ERROR';
  if (message.includes('overload') || message.includes('503')) return 'MODEL_UNAVAILABLE';
  return 'MODEL_STREAM_ERROR';
}
