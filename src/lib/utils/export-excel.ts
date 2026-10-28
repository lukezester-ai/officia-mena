import * as XLSX from 'xlsx';

export interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  title: string;
  filename: string;
}

export function exportToExcel(data: ExportData) {
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Create worksheet with headers and data
  const wsData = [data.headers, ...data.rows] as (string | number)[][];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, data.title);
  
  // Generate and download
  XLSX.writeFile(wb, `${data.filename}.xlsx`);
}

export function exportInvoiceToExcel(invoice: {
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
  const wb = XLSX.utils.book_new();

  // Invoice info
  const info: (string | number)[][] = [
    ['رقم الفاتورة', invoice.invoiceNumber || '-'],
    ['التاريخ', invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('ar-SA') : '-'],
    ['العميل', invoice.clientName || '-'],
    ['المجموع', invoice.totalAmount || 0],
  ];

  const infoWs = XLSX.utils.aoa_to_sheet(info);
  XLSX.utils.book_append_sheet(wb, infoWs, 'معلومات الفاتورة');

  // Items
  const headers = ['الوصف', 'الكمية', 'السعر', 'المجموع'];
  const rows: (string | number)[][] = (invoice.items || []).map((item) => [
    item.description || '-',
    item.quantity || 0,
    item.price || 0,
    (item.quantity || 0) * (item.price || 0),
  ]);

  const itemsWs = XLSX.utils.aoa_to_sheet([headers, ...rows] as (string | number)[][]);
  XLSX.utils.book_append_sheet(wb, itemsWs, 'البنود');

  XLSX.writeFile(wb, `invoice-${invoice.invoiceNumber}.xlsx`);
}
