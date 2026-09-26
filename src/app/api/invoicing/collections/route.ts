import { NextRequest, NextResponse } from 'next/server';
import { requireTenant, requireRole } from '@/lib/auth';
import {
  createCollectionEntry,
  getCollectionEntries,
  getInvoiceCollections,
  advanceCollectionStage,
  resolveCollection,
  getOverdueCollections,
  updateCollection,
  deleteCollection,
  getCollectionStats,
  getCollectionPipeline,
  autoEscalateCollections,
} from '@/lib/invoicing';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'list') {
      const invoiceId = searchParams.get('invoiceId') || undefined;
      const collections = await getCollectionEntries(tenant.id, invoiceId);
      return NextResponse.json({ success: true, data: collections });
    }

    if (action === 'invoice') {
      const invoiceId = searchParams.get('invoiceId');
      if (!invoiceId) {
        return NextResponse.json({ success: false, error: 'Invoice ID is required' }, { status: 400 });
      }

      const collections = await getInvoiceCollections(invoiceId, tenant.id);
      return NextResponse.json({ success: true, data: collections });
    }

    if (action === 'overdue') {
      const overdue = await getOverdueCollections(tenant.id);
      return NextResponse.json({ success: true, data: overdue });
    }

    if (action === 'stats') {
      const stats = await getCollectionStats(tenant.id);
      return NextResponse.json({ success: true, data: stats });
    }

    if (action === 'pipeline') {
      const pipeline = await getCollectionPipeline(tenant.id);
      return NextResponse.json({ success: true, data: pipeline });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const body = await request.json();
    const { action } = body;

    if (action === 'create') {
      await requireRole('admin', 'finance');
      const { invoiceId, collectionStage, actionTaken, notes, assignedToUserId, nextActionDate } = body;
      const userId = (await requireTenant()).id; // Would need actual user ID

      const collection = await createCollectionEntry({
        tenantId: tenant.id,
        invoiceId,
        collectionStage,
        actionTaken,
        notes,
        assignedToUserId,
        nextActionDate: nextActionDate ? new Date(nextActionDate) : undefined,
        userId,
      });

      return NextResponse.json({ success: true, data: collection });
    }

    if (action === 'advance') {
      await requireRole('admin', 'finance');
      const { collectionId, newStage, actionTaken, notes, nextActionDate } = body;

      const collection = await advanceCollectionStage(
        collectionId,
        tenant.id,
        newStage,
        actionTaken,
        notes,
        nextActionDate ? new Date(nextActionDate) : undefined
      );

      return NextResponse.json({ success: true, data: collection });
    }

    if (action === 'resolve') {
      await requireRole('admin', 'finance');
      const { collectionId } = body;

      const collection = await resolveCollection(collectionId, tenant.id);
      return NextResponse.json({ success: true, data: collection });
    }

    if (action === 'auto-escalate') {
      await requireRole('admin', 'finance');
      const escalated = await autoEscalateCollections(tenant.id);
      return NextResponse.json({ success: true, data: escalated });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireRole('admin', 'finance');
    const tenant = await requireTenant();
    const body = await request.json();
    const { action } = body;

    if (action === 'update') {
      const { collectionId, updates } = body;

      const collection = await updateCollection(collectionId, tenant.id, updates);
      return NextResponse.json({ success: true, data: collection });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireRole('admin', 'finance');
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');

    if (!collectionId) {
      return NextResponse.json({ success: false, error: 'Collection ID is required' }, { status: 400 });
    }

    await deleteCollection(collectionId, tenant.id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
