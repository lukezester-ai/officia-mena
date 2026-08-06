/**
 * ZATCA Phase 2 - UBL 2.1 XML Generator
 * Generates XML compliant with ZATCA Electronic Invoice specifications
 */

export interface InvoiceData {
  invoiceNumber: string;
  uuid: string;
  issueDate: Date;
  sellerName: string;
  sellerVatNumber: string;
  clientName: string;
  clientVatNumber?: string;
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  previousInvoiceHash: string;
}

export function generateUblXml(data: InvoiceData): string {
  // In a real implementation, this would use an XML builder library (like xmlbuilder2)
  // and construct the full ZATCA UBL 2.1 schema including all extensions and cryptographic stamps.
  // This is a simplified representation for the scope of this project.

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
    <ext:UBLExtensions>
        <ext:UBLExtension>
            <ext:ExtensionURI>urn:oasis:names:specification:ubl:dsig:enveloped:xades</ext:ExtensionURI>
            <ext:ExtensionContent>
                <!-- ZATCA Cryptographic Stamp will be injected here -->
            </ext:ExtensionContent>
        </ext:UBLExtension>
    </ext:UBLExtensions>
    
    <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
    <cbc:ID>${data.invoiceNumber}</cbc:ID>
    <cbc:UUID>${data.uuid}</cbc:UUID>
    <cbc:IssueDate>${data.issueDate.toISOString().split('T')[0]}</cbc:IssueDate>
    <cbc:IssueTime>${data.issueDate.toISOString().split('T')[1].replace('Z', '')}</cbc:IssueTime>
    <cbc:InvoiceTypeCode name="0100000">388</cbc:InvoiceTypeCode>
    <cbc:DocumentCurrencyCode>${data.currency}</cbc:DocumentCurrencyCode>
    
    <cac:AdditionalDocumentReference>
        <cbc:ID>PIH</cbc:ID>
        <cac:Attachment>
            <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">${data.previousInvoiceHash}</cbc:EmbeddedDocumentBinaryObject>
        </cac:Attachment>
    </cac:AdditionalDocumentReference>

    <cac:AccountingSupplierParty>
        <cac:Party>
            <cac:PartyLegalEntity>
                <cbc:RegistrationName>${data.sellerName}</cbc:RegistrationName>
            </cac:PartyLegalEntity>
            <cac:PartyTaxScheme>
                <cbc:CompanyID>${data.sellerVatNumber}</cbc:CompanyID>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:PartyTaxScheme>
        </cac:Party>
    </cac:AccountingSupplierParty>

    <cac:AccountingCustomerParty>
        <cac:Party>
            <cac:PartyLegalEntity>
                <cbc:RegistrationName>${data.clientName}</cbc:RegistrationName>
            </cac:PartyLegalEntity>
            ${data.clientVatNumber ? `
            <cac:PartyTaxScheme>
                <cbc:CompanyID>${data.clientVatNumber}</cbc:CompanyID>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:PartyTaxScheme>
            ` : ''}
        </cac:Party>
    </cac:AccountingCustomerParty>

    <cac:LegalMonetaryTotal>
        <cbc:LineExtensionAmount currencyID="${data.currency}">${data.subtotal.toFixed(2)}</cbc:LineExtensionAmount>
        <cbc:TaxExclusiveAmount currencyID="${data.currency}">${data.subtotal.toFixed(2)}</cbc:TaxExclusiveAmount>
        <cbc:TaxInclusiveAmount currencyID="${data.currency}">${data.totalAmount.toFixed(2)}</cbc:TaxInclusiveAmount>
        <cbc:PayableAmount currencyID="${data.currency}">${data.totalAmount.toFixed(2)}</cbc:PayableAmount>
    </cac:LegalMonetaryTotal>
</Invoice>`;
}
