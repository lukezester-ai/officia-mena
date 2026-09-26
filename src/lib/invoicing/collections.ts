import { db } from '@/lib/db/db';
import { invoiceCollections, invoices } from '@/lib/db/schema/invoice_extensions';
import { eq, and, desc } from 'drizzle-orm';

export interface CollectionInput {
  tenantId: string;
  invoiceId: string;
  collectionStage: 'friendly' | 'formal' | 'escalated' | 'legal';
  actionTaken?: string;
  notes?: string;
  assignedToUserId?: string;
  nextActionDate?: Date;
  userId: string;
}

export async function createCollectionEntry(input: CollectionInput) {
  const [collection] = await db
    .insert(invoiceCollections)
    .values({
      tenantId: input.tenantId,
      invoiceId: input.invoiceId,
      collectionStage: input.collectionStage,
      actionTaken: input.actionTaken,
      notes: input.notes,
      assignedToUserId: input.assignedToUserId,
      nextActionDate: input.nextActionDate,
      createdByUserId: input.userId,
    })
    .returning();

  return collection;
}

export async function getCollectionEntries(tenantId: string, invoiceId?: string) {
  const query = db
    .select()
    .from(invoiceCollections)
    .where(eq(invoiceCollections.tenantId, tenantId));

  if (invoiceId) {
    query.where(and(eq(invoiceCollections.tenantId, tenantId), eq(invoiceCollections.invoiceId, invoiceId)));
  }

  return query.orderBy(desc(invoiceCollections.createdAt));
}

export async function getInvoiceCollections(invoiceId: string, tenantId: string) {
  return db
    .select()
    .from(invoiceCollections)
    .where(and(eq(invoiceCollections.invoiceId, invoiceId), eq(invoiceCollections.tenantId, tenantId)))
    .orderBy(desc(invoiceCollections.createdAt));
}

export async function advanceCollectionStage(
  collectionId: string,
  tenantId: string,
  newStage: 'friendly' | 'formal' | 'escalated' | 'legal',
  actionTaken: string,
  notes?: string,
  nextActionDate?: Date
) {
  const [collection] = await db
    .update(invoiceCollections)
    .set({
      collectionStage: newStage,
      actionTaken,
      notes,
      nextActionDate,
      updatedAt: new Date(),
    })
    .where(and(eq(invoiceCollections.id, collectionId), eq(invoiceCollections.tenantId, tenantId)))
    .returning();

  return collection;
}

export async function resolveCollection(collectionId: string, tenantId: string) {
  const [collection] = await db
    .update(invoiceCollections)
    .set({
      resolvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(invoiceCollections.id, collectionId), eq(invoiceCollections.tenantId, tenantId)))
    .returning();

  return collection;
}

export async function getOverdueCollections(tenantId: string) {
  const today = new Date();

  const overdueInvoices = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      clientName: invoices.clientName,
      totalAmount: invoices.totalAmount,
      dueDate: invoices.dueDate,
      status: invoices.status,
    })
    .from(invoices)
    .where(and(
      eq(invoices.tenantId, tenantId),
      eq(invoices.status, 'overdue')
    ));

  const collections = [];

  for (const invoice of overdueInvoices) {
    const [collection] = await db
      .select()
      .from(invoiceCollections)
      .where(and(
        eq(invoiceCollections.invoiceId, invoice.id),
        eq(invoiceCollections.tenantId, tenantId)
      ))
      .orderBy(desc(invoiceCollections.createdAt))
      .limit(1);

    const daysOverdue = invoice.dueDate
      ? Math.floor((today.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    collections.push({
      invoice,
      collection: collection || null,
      daysOverdue,
      recommendedStage: daysOverdue > 60 ? 'escalated' : daysOverdue > 30 ? 'formal' : 'friendly',
    });
  }

  return collections;
}

export async function updateCollection(
  collectionId: string,
  tenantId: string,
  updates: Partial<{
    actionTaken: string;
    notes: string;
    assignedToUserId: string;
    nextActionDate: Date;
  }>
) {
  const [collection] = await db
    .update(invoiceCollections)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(and(eq(invoiceCollections.id, collectionId), eq(invoiceCollections.tenantId, tenantId)))
    .returning();

  return collection;
}

export async function deleteCollection(collectionId: string, tenantId: string) {
  await db
    .delete(invoiceCollections)
    .where(and(eq(invoiceCollections.id, collectionId), eq(invoiceCollections.tenantId, tenantId)));
}

export async function getCollectionStats(tenantId: string) {
  const collections = await getCollectionEntries(tenantId);

  const stats = {
    total: collections.length,
    resolved: collections.filter(c => c.resolvedAt !== null).length,
    active: collections.filter(c => c.resolvedAt === null).length,
    byStage: {} as Record<string, number>,
    overdueActions: collections.filter(c => {
      const nextAction = c.nextActionDate ? new Date(c.nextActionDate) : null;
      return nextAction && nextAction < new Date();
    }).length,
  };

  for (const collection of collections) {
    stats.byStage[collection.collectionStage] = (stats.byStage[collection.collectionStage] || 0) + 1;
  }

  return stats;
}

export async function getCollectionPipeline(tenantId: string) {
  const stages = ['friendly', 'formal', 'escalated', 'legal'];
  const pipeline = [];

  for (const stage of stages) {
    const [count] = await db
      .select({ count: invoiceCollections.id })
      .from(invoiceCollections)
      .where(and(
        eq(invoiceCollections.tenantId, tenantId),
        eq(invoiceCollections.collectionStage, stage),
        eq(invoiceCollections.resolvedAt, null)
      ));

    pipeline.push({
      stage,
      count: Number(count?.count || 0),
    });
  }

  return pipeline;
}

export async function autoEscalateCollections(tenantId: string) {
  const today = new Date();
  const overdueCollections = await getOverdueCollections(tenantId);

  const escalated = [];

  for (const { invoice, collection, daysOverdue, recommendedStage } of overdueCollections) {
    if (!collection) {
      // Create initial collection entry
      const newCollection = await createCollectionEntry({
        tenantId,
        invoiceId: invoice.id,
        collectionStage: recommendedStage,
        actionTaken: 'auto_created',
        notes: `Auto-created collection entry for overdue invoice (${daysOverdue} days overdue)`,
        userId: 'system', // Would need actual user ID
      });
      escalated.push(newCollection);
      continue;
    }

    if (collection.resolvedAt) continue;

    const nextAction = collection.nextActionDate ? new Date(collection.nextActionDate) : null;
    if (!nextAction || nextAction > today) continue;

    // Auto-escalate based on stage and time
    let newStage = collection.collectionStage;
    if (collection.collectionStage === 'friendly' && daysOverdue > 30) {
      newStage = 'formal';
    } else if (collection.collectionStage === 'formal' && daysOverdue > 60) {
      newStage = 'escalated';
    } else if (collection.collectionStage === 'escalated' && daysOverdue > 90) {
      newStage = 'legal';
    }

    if (newStage !== collection.collectionStage) {
      const updated = await advanceCollectionStage(
        collection.id,
        tenantId,
        newStage,
        'auto_escalation',
        `Auto-escalated from ${collection.collectionStage} to ${newStage}`
      );
      escalated.push(updated);
    }
  }

  return escalated;
}
