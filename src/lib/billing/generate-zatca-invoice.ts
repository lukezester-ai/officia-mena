// Utility for ZATCA Phase 2 E-Invoicing QR Code generation
// Saudi Arabia requires a specific TLV (Tag-Length-Value) Base64 format for QR codes

export function generateZatcaQr(
  sellerName: string,
  vatNumber: string,
  timestamp: string,
  invoiceTotal: string,
  vatTotal: string
): string {
  const getTlvBuffer = (tag: number, value: string): Buffer => {
    const valueBuffer = Buffer.from(value, 'utf8');
    const tlvBuffer = Buffer.alloc(2 + valueBuffer.length);
    tlvBuffer.writeUInt8(tag, 0);
    tlvBuffer.writeUInt8(valueBuffer.length, 1);
    valueBuffer.copy(tlvBuffer, 2);
    return tlvBuffer;
  };

  const tags = [
    getTlvBuffer(1, sellerName),
    getTlvBuffer(2, vatNumber),
    getTlvBuffer(3, timestamp),
    getTlvBuffer(4, invoiceTotal),
    getTlvBuffer(5, vatTotal),
  ];

  const qrBuffer = Buffer.concat(tags);
  return qrBuffer.toString('base64');
}
