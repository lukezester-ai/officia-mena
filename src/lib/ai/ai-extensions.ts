/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from '@/lib/db/db';
import {
  aiAnalytics,
  documentProcessingQueue,
  knowledgeArticles,
  knowledgeSearchLogs,
  aiSafetyEvents,
  aiModelPerformance,
  aiFeatureFlags,
} from '@/lib/db/schema/ai_extensions';
import { eq, and, desc, gte, lte } from 'drizzle-orm';

export interface AnalyticsInput {
  tenantId: string;
  periodType: 'daily' | 'weekly' | 'monthly';
  periodStart: Date;
  periodEnd: Date;
}

export async function generateAIAnalytics(input: AnalyticsInput) {
  // This would query the maestro_ai_runs table and aggregate metrics
  const analyticsData = {
    totalRuns: 0,
    successfulRuns: 0,
    failedRuns: 0,
    averageLatency: 0,
    totalTokens: 0,
    averageTokensPerRun: 0,
    toolCallCount: 0,
    approvalRate: 0,
    evaluationScore: 0,
    bySpecialist: {} as Record<string, number>,
    byModel: {} as Record<string, number>,
    byIntent: {} as Record<string, number>,
  };

  const [analytics] = await db
    .insert(aiAnalytics)
    .values({
      tenantId: input.tenantId,
      periodType: input.periodType,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      totalRuns: analyticsData.totalRuns,
      successfulRuns: analyticsData.successfulRuns,
      failedRuns: analyticsData.failedRuns,
      averageLatency: analyticsData.averageLatency.toFixed(2),
      totalTokens: analyticsData.totalTokens,
      averageTokensPerRun: analyticsData.averageTokensPerRun.toFixed(2),
      toolCallCount: analyticsData.toolCallCount,
      approvalRate: analyticsData.approvalRate.toFixed(2),
      evaluationScore: analyticsData.evaluationScore.toFixed(2),
      data: analyticsData as any,
    })
    .returning();

  return analytics;
}

export async function getAIAnalytics(tenantId: string, limit = 12) {
  return db
    .select()
    .from(aiAnalytics)
    .where(eq(aiAnalytics.tenantId, tenantId))
    .orderBy(desc(aiAnalytics.periodStart))
    .limit(limit);
}

export async function queueDocumentProcessing(
  tenantId: string,
  documentId: string,
  documentType: string,
  processingType: 'ocr' | 'extraction' | 'classification' | 'validation',
  priority = 5
) {
  const [queueItem] = await db
    .insert(documentProcessingQueue)
    .values({
      tenantId,
      documentId,
      documentType,
      processingType,
      status: 'pending',
      priority,
      retryCount: 0,
      maxRetries: 3,
    })
    .returning();

  return queueItem;
}

export async function getProcessingQueue(tenantId: string, status?: string) {
  const query = db
    .select()
    .from(documentProcessingQueue)
    .where(eq(documentProcessingQueue.tenantId, tenantId));

  if (status) {
    query.where(and(eq(documentProcessingQueue.tenantId, tenantId), eq(documentProcessingQueue.status, status)));
  }

  return query.orderBy(desc(documentProcessingQueue.priority), documentProcessingQueue.createdAt);
}

export async function createKnowledgeArticle(
  tenantId: string,
  title: string,
  content: string,
  category: string,
  tags: string[],
  source: string,
  userId: string
) {
  const [article] = await db
    .insert(knowledgeArticles)
    .values({
      tenantId,
      title,
      content,
      category,
      tags: tags as any,
      source,
      isActive: true,
      viewCount: 0,
      createdByUserId: userId,
    })
    .returning();

  return article;
}

export async function searchKnowledgeArticles(
  tenantId: string,
  query: string,
  category?: string,
  limit = 10
) {
  const searchQuery = db
    .select()
    .from(knowledgeArticles)
    .where(and(
      eq(knowledgeArticles.tenantId, tenantId),
      eq(knowledgeArticles.isActive, true)
    ));

  if (category) {
    searchQuery.where(and(
      eq(knowledgeArticles.tenantId, tenantId),
      eq(knowledgeArticles.isActive, true),
      eq(knowledgeArticles.category, category)
    ));
  }

  return searchQuery.limit(limit);
}

export async function logKnowledgeSearch(
  tenantId: string,
  userId: string,
  query: string,
  searchType: 'semantic' | 'keyword' | 'hybrid',
  resultsCount: number,
  selectedArticleId?: string,
  confidence?: number,
  latencyMs?: number
) {
  const [log] = await db
    .insert(knowledgeSearchLogs)
    .values({
      tenantId,
      userId,
      query,
      searchType,
      resultsCount,
      selectedArticleId,
      confidence: confidence?.toFixed(2),
      latencyMs,
    })
    .returning();

  return log;
}

export async function createSafetyEvent(
  tenantId: string,
  eventType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  description: string,
  aiRunId?: string,
  userId?: string,
  payload?: any
) {
  const [event] = await db
    .insert(aiSafetyEvents)
    .values({
      tenantId,
      eventType,
      severity,
      description,
      aiRunId,
      userId,
      payload: payload as any,
      actionTaken: 'flagged',
    })
    .returning();

  return event;
}

export async function getSafetyEvents(tenantId: string, severity?: string, limit = 20) {
  const query = db
    .select()
    .from(aiSafetyEvents)
    .where(eq(aiSafetyEvents.tenantId, tenantId));

  if (severity) {
    query.where(and(eq(aiSafetyEvents.tenantId, tenantId), eq(aiSafetyEvents.severity, severity)));
  }

  return query.orderBy(desc(aiSafetyEvents.createdAt)).limit(limit);
}

export async function resolveSafetyEvent(eventId: string, tenantId: string, actionTaken: string, userId: string) {
  const [event] = await db
    .update(aiSafetyEvents)
    .set({
      actionTaken,
      resolvedAt: new Date(),
      resolvedByUserId: userId,
    })
    .where(and(eq(aiSafetyEvents.id, eventId), eq(aiSafetyEvents.tenantId, tenantId)))
    .returning();

  return event;
}

export async function updateModelPerformance(
  tenantId: string,
  modelName: string,
  modelVersion: string,
  specialist: string,
  success: boolean,
  latency: number,
  tokens: number,
  evaluationScore?: number
) {
  const [performance] = await db
    .select()
    .from(aiModelPerformance)
    .where(and(
      eq(aiModelPerformance.tenantId, tenantId),
      eq(aiModelPerformance.modelName, modelName),
      eq(aiModelPerformance.modelVersion, modelVersion),
      eq(aiModelPerformance.specialist, specialist)
    ))
    .limit(1);

  if (performance) {
    const [updated] = await db
      .update(aiModelPerformance)
      .set({
        totalRequests: performance.totalRequests + 1,
        successfulRequests: performance.successfulRequests + (success ? 1 : 0),
        failedRequests: performance.failedRequests + (success ? 0 : 1),
        averageLatency: ((performance.averageLatency * performance.totalRequests) + latency) / (performance.totalRequests + 1),
        averageTokens: ((performance.averageTokens * performance.totalRequests) + tokens) / (performance.totalRequests + 1),
        averageEvaluationScore: evaluationScore
          ? ((performance.averageEvaluationScore * performance.totalRequests) + evaluationScore) / (performance.totalRequests + 1)
          : performance.averageEvaluationScore,
        lastUsedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(aiModelPerformance.id, performance.id))
      .returning();

    return updated;
  } else {
    const [newPerformance] = await db
      .insert(aiModelPerformance)
      .values({
        tenantId,
        modelName,
        modelVersion,
        specialist,
        totalRequests: 1,
        successfulRequests: success ? 1 : 0,
        failedRequests: success ? 0 : 1,
        averageLatency: latency.toFixed(2),
        averageTokens: tokens.toFixed(2),
        averageEvaluationScore: evaluationScore?.toFixed(2) || '0.00',
        lastUsedAt: new Date(),
        isActive: true,
      })
      .returning();

    return newPerformance;
  }
}

export async function getModelPerformance(tenantId: string) {
  return db
    .select()
    .from(aiModelPerformance)
    .where(and(eq(aiModelPerformance.tenantId, tenantId), eq(aiModelPerformance.isActive, true)))
    .orderBy(desc(aiModelPerformance.lastUsedAt));
}

export async function setFeatureFlag(
  tenantId: string,
  featureName: string,
  isEnabled: boolean,
  rolloutPercentage = 0,
  allowedUserIds?: string[],
  configuration?: any
) {
  const [flag] = await db
    .insert(aiFeatureFlags)
    .values({
      tenantId,
      featureName,
      isEnabled,
      rolloutPercentage,
      allowedUserIds: allowedUserIds as any,
      configuration: configuration as any,
    })
    .onConflictDoUpdate({
      target: aiFeatureFlags.featureName,
      set: {
        isEnabled,
        rolloutPercentage,
        allowedUserIds: allowedUserIds as any,
        configuration: configuration as any,
        updatedAt: new Date(),
      },
    })
    .returning();

  return flag;
}

export async function getFeatureFlag(tenantId: string, featureName: string, userId?: string) {
  const [flag] = await db
    .select()
    .from(aiFeatureFlags)
    .where(and(
      eq(aiFeatureFlags.tenantId, tenantId),
      eq(aiFeatureFlags.featureName, featureName)
    ))
    .limit(1);

  if (!flag) {
    return { isEnabled: false, featureName };
  }

  // Check if user is in allowed list
  if (userId && flag.allowedUserIds) {
    const allowedUsers = flag.allowedUserIds as string[];
    if (allowedUsers.includes(userId)) {
      return { ...flag, isEnabled: true };
    }
  }

  // Check rollout percentage
  if (flag.rolloutPercentage > 0 && flag.rolloutPercentage < 100) {
    // Would need consistent user hash for deterministic rollout
    // For now, return disabled if not explicitly enabled
    return { ...flag, isEnabled: flag.isEnabled };
  }

  return flag;
}

export async function getAllFeatureFlags(tenantId: string) {
  return db
    .select()
    .from(aiFeatureFlags)
    .where(eq(aiFeatureFlags.tenantId, tenantId))
    .orderBy(aiFeatureFlags.featureName);
}
