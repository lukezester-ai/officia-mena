import { NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { invoices } from '@/lib/db/schema/invoices';
import { isNull, eq } from 'drizzle-orm';
import { embedMany } from 'ai';
import { google } from '@ai-sdk/google';

export async function GET(req: Request) {
  try {
    // Fetch invoices that don't have embeddings
    const invoicesWithoutEmbeddings = await db.select().from(invoices).where(isNull(invoices.embedding));

    if (invoicesWithoutEmbeddings.length === 0) {
      return NextResponse.json({ message: 'All invoices already have embeddings.' });
    }

    // Prepare text summaries to embed
    const textsToEmbed = invoicesWithoutEmbeddings.map(inv => {
      return `فاتورة رقم ${inv.invoiceNumber}. العميل: ${inv.clientName}. العنوان: ${inv.clientAddress || 'غير محدد'}. المبلغ الإجمالي: ${inv.totalAmount} ${inv.currency}. التفاصيل والملاحظات: ${inv.notes || 'لا يوجد'}.`;
    });

    // Generate embeddings
    const { embeddings } = await embedMany({
      model: google.embedding('text-embedding-004'),
      values: textsToEmbed,
    });

    // Update DB
    for (let i = 0; i < invoicesWithoutEmbeddings.length; i++) {
      await db.update(invoices)
        .set({ embedding: embeddings[i] })
        .where(eq(invoices.id, invoicesWithoutEmbeddings[i].id));
    }

    return NextResponse.json({ success: true, message: `Embedded ${invoicesWithoutEmbeddings.length} invoices.` });

  } catch (error: any) {
    console.error('Error embedding invoices:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
