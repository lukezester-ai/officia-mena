/**
 * Utility functions for ZATCA (Saudi Arabia) E-Invoicing Phase 1 Compliance
 */

function toBuffer(str: string): Buffer {
  return Buffer.from(str, 'utf-8');
}

/**
 * Encodes a tag and its string value to a TLV buffer.
 *
 * @param tag 1-byte identifier
 * @param value String value
 * @returns Buffer containing Tag-Length-Value
 */
function tlvEncode(tag: number, value: string): Buffer {
  const valueBuffer = toBuffer(value);
  const tagBuffer = Buffer.from([tag]);
  const lengthBuffer = Buffer.from([valueBuffer.length]);
  return Buffer.concat([tagBuffer, lengthBuffer, valueBuffer]);
}

export type ZatcaInvoiceData = {
  sellerName: string;
  vatRegistrationNumber: string;
  timestamp: string; // ISO 8601 e.g. "2023-11-28T14:30:00Z"
  invoiceTotal: string; // Including VAT
  vatTotal: string;
};

/**
 * Generates the ZATCA Base64 encoded TLV string for Phase 1 QR Codes.
 *
 * @param data The invoice data required by ZATCA
 * @returns Base64 encoded string
 */
export function generateZatcaQrCode(data: ZatcaInvoiceData): string {
  const tlvs = [
    tlvEncode(1, data.sellerName),
    tlvEncode(2, data.vatRegistrationNumber),
    tlvEncode(3, data.timestamp),
    tlvEncode(4, data.invoiceTotal),
    tlvEncode(5, data.vatTotal),
  ];
  
  const combinedBuffer = Buffer.concat(tlvs);
  return combinedBuffer.toString('base64');
}
