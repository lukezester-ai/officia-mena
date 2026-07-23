import { NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { documentChunks } from '@/lib/db/schema/documents';
import { embedMany } from 'ai';
import { google } from '@ai-sdk/google';
import { getErrorMessage } from '@/lib/errors';

const zatcaRules = [
  {
    title: 'ZATCA E-Invoicing (FATOORAH) Phase 2 Overview',
    content: 'Phase 2 (Integration Phase) of the ZATCA E-Invoicing mandate requires taxpayers to integrate their POS and ERP systems with the ZATCA FATOORA platform. All electronic invoices (Tax Invoices and Simplified Tax Invoices) must be cleared or reported to ZATCA.'
  },
  {
    title: 'Tax Invoice vs Simplified Tax Invoice',
    content: 'A Standard Tax Invoice is used for B2B and B2G transactions and must be CLEARED by ZATCA before being shared with the buyer. A Simplified Tax Invoice is used for B2C transactions and must be REPORTED to ZATCA within 24 hours of issuance.'
  },
  {
    title: 'ZATCA QR Code Requirements',
    content: 'The QR Code is mandatory for all electronic invoices. For Phase 2, the QR code must be generated using Base64 TLV (Tag-Length-Value) format. It must contain the Seller Name, VAT Registration Number, Timestamp, Invoice Total, VAT Total, and Cryptographic Hash of the XML invoice, plus the ECDSA signature.'
  },
  {
    title: 'VAT Rate in Saudi Arabia',
    content: 'The standard Value Added Tax (VAT) rate in Saudi Arabia is 15%. This applies to most goods and services supplied in the Kingdom. Some services like specific healthcare, education, and international transport may be zero-rated or exempt.'
  },
  {
    title: 'Prohibited Functions in POS/ERP under ZATCA',
    content: 'To comply with ZATCA regulations, an invoicing system MUST NOT allow: 1. Anonymous access. 2. Tampering with invoices after issuance. 3. Multiple invoice sequences. 4. Deleting invoices (credit/debit notes must be used to adjust issued invoices). 5. Resetting the invoice counter.'
  }
];

export async function POST() {
  try {
    // Generate embeddings for all ZATCA rules
    const chunks = zatcaRules.map(r => `${r.title}\n\n${r.content}`);
    
    const { embeddings } = await embedMany({
      model: google.embedding('text-embedding-004'),
      values: chunks,
    });

    const insertData = chunks.map((chunk, index) => ({
      tenantId: null, // Global
      docType: 'zatca_regulation',
      fileName: 'ZATCA_Phase2_Official_Guidelines.pdf',
      content: chunk,
      embedding: embeddings[index],
    }));

    await db.insert(documentChunks).values(insertData);

    return NextResponse.json({ success: true, message: `Seeded ${chunks.length} ZATCA rules.` });
  } catch (error: unknown) {
    console.error('Error seeding ZATCA knowledge:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
