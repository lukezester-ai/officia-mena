import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportData {
  headers: string[];
  rows: string[][];
  title: string;
  filename: string;
}

export function exportToPDF(data: ExportData) {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text(data.title, 14, 22);

  // Add table
  autoTable(doc, {
    head: [data.headers],
    body: data.rows,
    startY: 30,
    styles: {
      font: 'helvetica',
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  // Save
  doc.save(`${data.filename}.pdf`);
}

export function exportInvoiceToPDF(invoice: {
  invoiceNumber: string;
  createdAt?: Date | string;
  clientName?: string;
  totalAmount?: number;
  currency?: string;
  items?: Array<{
    description?: string;
    quantity?: number;
    price?: number;
  }>;
}) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text('Invoice', 105, 20, { align: 'center' });

  // Invoice number
  doc.setFontSize(12);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 14, 35);
  doc.text(`Date: ${invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : '-'}`, 14, 45);
  doc.text(`Client: ${invoice.clientName || '-'}`, 14, 55);

  // Table
  const headers = ['Description', 'Quantity', 'Price', 'Total'];
  const rows = (invoice.items || []).map((item) => [
    item.description || '-',
    item.quantity?.toString() || '0',
    String(item.price || 0),
    String((item.quantity || 0) * (item.price || 0)),
  ]);

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 70,
    styles: {
      font: 'helvetica',
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: 255,
      fontStyle: 'bold',
    },
  });

  // Total
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(`Total: ${invoice.totalAmount || 0} ${invoice.currency || 'SAR'}`, 14, finalY);

  doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
}
