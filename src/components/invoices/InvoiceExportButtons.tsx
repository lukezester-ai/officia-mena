'use client';

import { Download, FileSpreadsheet } from 'lucide-react';
import { exportInvoiceToPDF } from '@/lib/utils/export-pdf';
import { exportInvoiceToExcel } from '@/lib/utils/export-excel';

interface InvoiceExportButtonsProps {
  invoice: any;
}

export default function InvoiceExportButtons({ invoice }: InvoiceExportButtonsProps) {
  const handleExportPDF = () => {
    exportInvoiceToPDF(invoice);
  };

  const handleExportExcel = () => {
    exportInvoiceToExcel(invoice);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExportPDF}
        className="bg-white border-2 border-[var(--color-desert-200)] hover:border-[var(--color-desert-300)] text-[var(--color-desert-700)] font-bold py-2 px-4 rounded-xl transition-colors shadow-sm flex items-center gap-2"
        title="تصدير PDF"
      >
        <Download size={18} />
        PDF
      </button>
      <button
        onClick={handleExportExcel}
        className="bg-white border-2 border-[var(--color-desert-200)] hover:border-[var(--color-desert-300)] text-[var(--color-desert-700)] font-bold py-2 px-4 rounded-xl transition-colors shadow-sm flex items-center gap-2"
        title="تصدير Excel"
      >
        <FileSpreadsheet size={18} />
        Excel
      </button>
    </div>
  );
}
