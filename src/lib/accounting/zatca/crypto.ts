import { createHash, createSign } from 'crypto';

/**
 * ZATCA Phase 2 Cryptographic Requirements:
 * 1. Invoice Hash (SHA-256)
 * 2. Cryptographic Stamp (ECDSA using secp256k1 curve)
 * 3. Previous Invoice Hash (PIH) for chaining
 */

export interface ZatcaCryptoConfig {
  privateKey: string;
  certificate: string;
}

/**
 * Generates SHA-256 hash of the UBL 2.1 XML Invoice
 */
export function generateInvoiceHash(xmlPayload: string): string {
  // ZATCA requires hashing the canonicalized XML, 
  // but for Phase 1/mocking we just hash the raw XML string.
  return createHash('sha256').update(xmlPayload).digest('base64');
}

/**
 * Generates an ECDSA signature over the invoice hash using the taxpayer's private key
 */
export function generateCryptographicStamp(invoiceHash: string, privateKey: string): string {
  if (!privateKey) {
    // For local dev without a real private key, return a mock stamp
    return Buffer.from(`MOCK_STAMP_${invoiceHash}`).toString('base64');
  }

  const sign = createSign('SHA256');
  sign.update(invoiceHash);
  sign.end();
  
  return sign.sign(privateKey, 'base64');
}

/**
 * Calculates the Previous Invoice Hash (PIH)
 * ZATCA requires the invoice to contain the base64 encoded SHA-256 hash of the previous invoice
 */
export function calculatePreviousInvoiceHash(previousXmlPayload?: string): string {
  if (!previousXmlPayload) {
    // If it's the first invoice, ZATCA expects a base64 encoded '0' character (NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjdz==)
    // Here we use a standard mock for the first invoice PIH as per ZATCA SDK
    return 'NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjdz==';
  }
  return generateInvoiceHash(previousXmlPayload);
}
