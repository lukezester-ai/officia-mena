import { NextRequest, NextResponse } from 'next/server';
import { requireTenant, requireRole } from '@/lib/auth';
import {
  generateAIAnalytics,
  getAIAnalytics,
  queueDocumentProcessing,
  getProcessingQueue,
  createKnowledgeArticle,
  searchKnowledgeArticles,
  logKnowledgeSearch,
  createSafetyEvent,
  getSafetyEvents,
  resolveSafetyEvent,
  updateModelPerformance,
  getModelPerformance,
  setFeatureFlag,
  getFeatureFlag,
  getAllFeatureFlags,
} from '@/lib/ai';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'analytics') {
      const limit = Number(searchParams.get('limit')) || 12;
      const analytics = await getAIAnalytics(tenant.id, limit);
      return NextResponse.json({ success: true, data: analytics });
    }

    if (action === 'processing-queue') {
      const status = searchParams.get('status') || undefined;
      const queue = await getProcessingQueue(tenant.id, status);
      return NextResponse.json({ success: true, data: queue });
    }

    if (action === 'knowledge-search') {
      const query = searchParams.get('query');
      const category = searchParams.get('category') || undefined;
      const limit = Number(searchParams.get('limit')) || 10;

      if (!query) {
        return NextResponse.json({ success: false, error: 'Query is required' }, { status: 400 });
      }

      const articles = await searchKnowledgeArticles(tenant.id, query, category, limit);
      return NextResponse.json({ success: true, data: articles });
    }

    if (action === 'safety-events') {
      const severity = searchParams.get('severity') || undefined;
      const limit = Number(searchParams.get('limit')) || 20;

      const events = await getSafetyEvents(tenant.id, severity, limit);
      return NextResponse.json({ success: true, data: events });
    }

    if (action === 'model-performance') {
      const performance = await getModelPerformance(tenant.id);
      return NextResponse.json({ success: true, data: performance });
    }

    if (action === 'feature-flags') {
      const flags = await getAllFeatureFlags(tenant.id);
      return NextResponse.json({ success: true, data: flags });
    }

    if (action === 'feature-flag') {
      const featureName = searchParams.get('featureName');
      const userId = searchParams.get('userId') || undefined;

      if (!featureName) {
        return NextResponse.json({ success: false, error: 'Feature name is required' }, { status: 400 });
      }

      const flag = await getFeatureFlag(tenant.id, featureName, userId);
      return NextResponse.json({ success: true, data: flag });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole('admin', 'ai-admin');
    const tenant = await requireTenant();
    const body = await request.json();
    const { action } = body;

    if (action === 'generate-analytics') {
      const { periodType, periodStart, periodEnd } = body;

      const analytics = await generateAIAnalytics({
        tenantId: tenant.id,
        periodType,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
      });

      return NextResponse.json({ success: true, data: analytics });
    }

    if (action === 'queue-processing') {
      const { documentId, documentType, processingType, priority } = body;

      const queueItem = await queueDocumentProcessing(
        tenant.id,
        documentId,
        documentType,
        processingType,
        priority
      );

      return NextResponse.json({ success: true, data: queueItem });
    }

    if (action === 'create-article') {
      const { title, content, category, tags, source } = body;
      const userId = (await requireTenant()).id; // Would need actual user ID

      const article = await createKnowledgeArticle(
        tenant.id,
        title,
        content,
        category,
        tags,
        source,
        userId
      );

      return NextResponse.json({ success: true, data: article });
    }

    if (action === 'log-search') {
      const { query, searchType, resultsCount, selectedArticleId, confidence, latencyMs } = body;
      const userId = (await requireTenant()).id; // Would need actual user ID

      const log = await logKnowledgeSearch(
        tenant.id,
        userId,
        query,
        searchType,
        resultsCount,
        selectedArticleId,
        confidence,
        latencyMs
      );

      return NextResponse.json({ success: true, data: log });
    }

    if (action === 'create-safety-event') {
      const { eventType, severity, description, aiRunId, userId, payload } = body;

      const event = await createSafetyEvent(
        tenant.id,
        eventType,
        severity,
        description,
        aiRunId,
        userId,
        payload
      );

      return NextResponse.json({ success: true, data: event });
    }

    if (action === 'set-feature-flag') {
      const { featureName, isEnabled, rolloutPercentage, allowedUserIds, configuration } = body;

      const flag = await setFeatureFlag(
        tenant.id,
        featureName,
        isEnabled,
        rolloutPercentage,
        allowedUserIds,
        configuration
      );

      return NextResponse.json({ success: true, data: flag });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireRole('admin', 'ai-admin');
    const tenant = await requireTenant();
    const body = await request.json();
    const { action } = body;

    if (action === 'resolve-safety-event') {
      const { eventId, actionTaken, userId } = body;

      const event = await resolveSafetyEvent(eventId, tenant.id, actionTaken, userId);
      return NextResponse.json({ success: true, data: event });
    }

    if (action === 'update-model-performance') {
      const { modelName, modelVersion, specialist, success, latency, tokens, evaluationScore } = body;

      const performance = await updateModelPerformance(
        tenant.id,
        modelName,
        modelVersion,
        specialist,
        success,
        latency,
        tokens,
        evaluationScore
      );

      return NextResponse.json({ success: true, data: performance });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
