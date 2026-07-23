import { NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { invoices } from '@/lib/db/schema/invoices';
import { embed } from 'ai';
import { google } from '@ai-sdk/google';
import { sql, desc, isNotNull } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.trim() === '') {
      return NextResponse.json({ results: [] });
    }

    // Embed the search query
    const { embedding } = await embed({
      model: google.embedding('text-embedding-004'),
      value: query,
    });

    // Semantic Search on Invoices using pgvector cosine distance <=>
    const similarity = sql<number>`1 - (${invoices.embedding} <=> ${JSON.stringify(embedding)})`;
    
    const results = await db.select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      clientName: invoices.clientName,
      totalAmount: invoices.totalAmount,
      currency: invoices.currency,
      status: invoices.status,
      similarity: similarity,
    })
    .from(invoices)
    .where(isNotNull(invoices.embedding)) // Only search embedded invoices
    .orderBy(desc(similarity))
    .limit(5);

    // Only return highly relevant results (e.g. similarity > 0.4)
    const filteredResults = results.filter(r => r.similarity > 0.4);

    return NextResponse.json({ results: filteredResults });

  } catch (error: any) {
    console.error('Semantic Search Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
