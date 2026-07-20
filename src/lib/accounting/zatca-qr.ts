/**
 * ZATCA e-Invoicing Phase 2 - TLV Base64 QR Code Generator
 * 
 * ZATCA requires a very specific QR code format: Base64 encoded TLV (Tag-Length-Value) array.
 * Tags:
 * 1: Seller's Name
 * 2: VAT Registration Number
 * 3: Time Stamp (ISO 8601)
 * 4: Invoice Total (with VAT)
 * 5: VAT Total
 */

export interface ZatcaTags {
  sellerName: string;
  vatNumber: string;
  timestamp: string;
  invoiceTotal: string;
  vatTotal: string;
}

export function generateZatcaQrCode(data: ZatcaTags): string {
  const tags = [
    { tag: 1, value: data.sellerName },
    { tag: 2, value: data.vatNumber },
    { tag: 3, value: data.timestamp },
    { tag: 4, value: data.invoiceTotal },
    { tag: 5, value: data.vatTotal },
  ];

  let tlvBuffer = Buffer.alloc(0);

  for (const item of tags) {
    const valueBuffer = Buffer.from(item.value, 'utf8');
    const tagBuffer = Buffer.from([item.tag, valueBuffer.length]);
    tlvBuffer = Buffer.concat([tlvBuffer, tagBuffer, valueBuffer]);
  }

  return tlvBuffer.toString('base64');
}

/**
 * Validates if the invoice is ready for ZATCA Phase 2 reporting
 */
export function validateZatcaReadiness(invoice: Record<string, unknown>): boolean {
  if (!invoice.clientTrn) return false;
  if (!invoice.totalAmount || !invoice.vatAmount) return false;
  if (!invoice.issueDate) return false;
  return true;
}
