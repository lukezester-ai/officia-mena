import { NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { documentChunks } from '@/lib/db/schema/documents';
import { embedMany } from 'ai';
import { google } from '@ai-sdk/google';
import { PDFParse } from 'pdf-parse';
import { getErrorMessage } from '@/lib/errors';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const tenantId = formData.get('tenantId') as string;

    if (!file || !tenantId) {
      return NextResponse.json({ error: 'Missing file or tenantId' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Parse the PDF
    const parser = new PDFParse({ data: buffer });
    const pdfData = await parser.getText();
    await parser.destroy();
    const text = pdfData.text;

    // Simple chunking (e.g. by paragraphs or fixed length)
    // Here we chunk by double newlines or split into chunks of ~1000 chars
    const rawChunks = text.split(/\n\n+/).map(c => c.trim()).filter(c => c.length > 50);
    
    // If chunks are too large, we might want to split them further, but this is a simple demo
    let chunks: string[] = [];
    for (const raw of rawChunks) {
      if (raw.length > 1500) {
        // Split large chunks
        const parts = raw.match(/.{1,1500}/g) || [];
        chunks = chunks.concat(parts);
      } else {
        chunks.push(raw);
      }
    }

    if (chunks.length === 0) {
      return NextResponse.json({ error: 'No text extracted from PDF' }, { status: 400 });
    }

    // Generate Embeddings using Google Gemini
    const { embeddings } = await embedMany({
      model: google.embedding('text-embedding-004'),
      values: chunks,
    });

    // Insert into DB
    const insertData = chunks.map((chunk, index) => ({
      tenantId,
      fileName: file.name,
      content: chunk,
      embedding: embeddings[index],
    }));

    await db.insert(documentChunks).values(insertData);

    return NextResponse.json({ success: true, chunksCount: chunks.length });
  } catch (error: unknown) {
    console.error('Error processing document:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
