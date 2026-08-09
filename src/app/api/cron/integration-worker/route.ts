import { NextResponse } from 'next/server';
import { requireBearerSecret } from '@/lib/auth/api';
import { processDueIntegrationJobs } from '@/lib/integrations/jobs';
import { getErrorMessage } from '@/lib/errors';

export async function GET(request: Request) {
  const unauthorized = requireBearerSecret(request, 'CRON_SECRET'); if (unauthorized) return unauthorized;
  try { const results = await processDueIntegrationJobs(20); return NextResponse.json({ success: true, processed: results.length, results, generatedAt: new Date().toISOString() }); }
  catch (error) { console.error('Integration worker failed:', error); return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 }); }
}
