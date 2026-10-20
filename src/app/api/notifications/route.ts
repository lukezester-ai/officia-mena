import { NextRequest, NextResponse } from 'next/server';
import { requireTenant } from '@/lib/auth';
import { db } from '@/lib/db/db';
import { notifications } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50;

    const result = await db
      .select()
      .from(notifications)
      .where(eq(notifications.tenantId, tenant.id))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const body = await request.json();
    const { type, title, message, actionUrl, actionLabel } = body;

    const result = await db.insert(notifications).values({
      tenantId: tenant.id,
      type: type || 'info',
      title,
      message,
      isRead: false,
      actionUrl,
      actionLabel,
    }).returning();

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const body = await request.json();
    const { action, notificationId } = body;

    if (action === 'mark-read') {
      const result = await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.id, notificationId), eq(notifications.tenantId, tenant.id)))
        .returning();

      return NextResponse.json({ success: true, data: result[0] });
    }

    if (action === 'mark-all-read') {
      const result = await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.tenantId, tenant.id))
        .returning();

      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('notificationId');

    if (!notificationId) {
      return NextResponse.json({ success: false, error: 'Notification ID is required' }, { status: 400 });
    }

    await db
      .delete(notifications)
      .where(and(eq(notifications.id, notificationId), eq(notifications.tenantId, tenant.id)));

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
