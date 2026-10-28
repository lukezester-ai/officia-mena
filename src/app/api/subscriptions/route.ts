import { NextRequest, NextResponse } from 'next/server';
import { requireTenant } from '@/lib/auth';
import { db } from '@/lib/db/db';
import { subscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();

    const result = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenant.id))
      .limit(1);

    return NextResponse.json({ success: true, data: result[0] || null });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const body = await request.json();
    const { planId } = body;

    // In production, this would create a Stripe checkout session
    // For now, just update the subscription directly
    const result = await db
      .insert(subscriptions)
      .values({
        tenantId: tenant.id,
        planId,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      })
      .onConflictDoUpdate({
        target: subscriptions.tenantId,
        set: {
          planId,
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        },
      })
      .returning();

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
