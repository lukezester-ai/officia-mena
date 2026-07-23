/**
 * ZATCA Phase 1 QR Code generation (Base64 TLV Encoder)
 * Saudi Arabia E-Invoicing requires a Base64 encoded TLV (Tag-Length-Value) string for the QR code.
 */

export interface ZatcaQRCodeParams {
  sellerName: string;
  vatRegistrationNumber: string;
  timestamp: string; // ISO 8601 e.g., '2023-09-07T14:26:00Z'
  invoiceTotal: string; // e.g., '100.00'
  vatTotal: string; // e.g., '15.00'
}

function getHexFromStr(str: string): string {
  // Use TextEncoder to properly handle UTF-8 Arabic characters
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

function getHexFromLength(length: number): string {
  return length.toString(16).padStart(2, '0');
}

function tlvHex(tag: number, value: string): string {
  const valueHex = getHexFromStr(value);
  const lengthHex = getHexFromLength(valueHex.length / 2);
  const tagHex = getHexFromLength(tag);
  return tagHex + lengthHex + valueHex;
}

export function generateZatcaQR(params: ZatcaQRCodeParams): string {
  const { sellerName, vatRegistrationNumber, timestamp, invoiceTotal, vatTotal } = params;

  let hexString = '';
  hexString += tlvHex(1, sellerName);
  hexString += tlvHex(2, vatRegistrationNumber);
  hexString += tlvHex(3, timestamp);
  hexString += tlvHex(4, invoiceTotal);
  hexString += tlvHex(5, vatTotal);

  // Convert hex string to base64
  const bytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    bytes[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
  }

  // Since this might run in the browser (client component), we use btoa
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return btoa(binary);
}
