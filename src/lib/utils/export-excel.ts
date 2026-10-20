import * as XLSX from 'xlsx';

export interface ExportData {
  headers: string[];
  rows: any[][];
  title: string;
  filename: string;
}

export function exportToExcel(data: ExportData) {
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Create worksheet with headers and data
  const wsData = [data.headers, ...data.rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, data.title);
  
  // Generate and download
  XLSX.writeFile(wb, `${data.filename}.xlsx`);
}

export function exportInvoiceToExcel(invoice: any) {
  const wb = XLSX.utils.book_new();

  // Invoice info
  const info = [
    ['رقم الفاتورة', invoice.invoiceNumber || '-'],
    ['التاريخ', invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('ar-SA') : '-'],
    ['العميل', invoice.clientName || '-'],
    ['المجموع', `${invoice.totalAmount || 0} ${invoice.currency || 'SAR'}`],
  ];

  const infoWs = XLSX.utils.aoa_to_sheet(info);
  XLSX.utils.book_append_sheet(wb, infoWs, 'معلومات الفاتورة');

  // Items
  const headers = ['الوصف', 'الكمية', 'السعر', 'المجموع'];
  const rows = (invoice.items || []).map((item: any) => [
    item.description || '-',
    item.quantity || 0,
    item.price || 0,
    (item.quantity || 0) * (item.price || 0),
  ]);

  const itemsWs = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  XLSX.utils.book_append_sheet(wb, itemsWs, 'البنود');

  XLSX.writeFile(wb, `invoice-${invoice.invoiceNumber}.xlsx`);
}
