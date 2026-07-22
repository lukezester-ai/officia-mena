/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useRef } from 'react';
import { Camera, UploadCloud, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { processReceiptImage } from './actions';

export default function OCRScannerPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        handleUpload(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (base64: string) => {
    setIsScanning(true);
    setResult(null);
    try {
      const res = await processReceiptImage(base64);
      if (res.success) {
        setResult(res.data);
      } else {
        alert('حدث خطأ أثناء فحص الفاتورة: ' + res.error);
      }
    } catch (error) {
      alert('خطأ غير متوقع.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12" dir="rtl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/expenses" className="p-2 bg-white rounded-full border border-[var(--color-desert-200)] hover:bg-[var(--color-desert-50)] transition-colors">
          <ArrowRight size={20} className="text-[var(--color-desert-600)]" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-desert-900)] mb-1 flex items-center gap-3">
            <Camera className="text-[var(--color-gold-600)]" size={32} />
            المسح الضوئي للفواتير (AI OCR)
          </h1>
          <p className="text-[var(--color-desert-600)] text-sm">ارفع صورة الفاتورة وسيقوم الذكاء الاصطناعي بقراءتها وتسجيلها تلقائياً</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Upload Area */}
        <div 
          className="bg-white rounded-3xl border-2 border-dashed border-[var(--color-desert-300)] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[var(--color-desert-50)] transition-colors min-h-[400px]"
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          
          {imagePreview ? (
            <div className="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden shadow-inner">
              <img src={imagePreview} alt="Receipt" className="object-contain w-full h-full absolute inset-0" />
            </div>
          ) : (
            <>
              <div className="w-20 h-20 bg-[var(--color-gold-100)] rounded-full flex items-center justify-center mb-6">
                <UploadCloud className="text-[var(--color-gold-600)]" size={40} />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-desert-900)] mb-2">اضغط لرفع صورة الفاتورة</h3>
              <p className="text-[var(--color-desert-500)] text-sm max-w-xs mx-auto">
                يدعم صيغ JPG و PNG. سيتم استخراج اسم التاجر، التاريخ، والمبلغ الإجمالي تلقائياً.
              </p>
            </>
          )}
        </div>

        {/* Results Area */}
        <div className="bg-[var(--color-desert-950)] rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--color-gold-400)] to-[var(--color-gold-600)]"></div>
          
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FileText className="text-[var(--color-gold-500)]" />
            البيانات المستخرجة
          </h2>

          {isScanning ? (
            <div className="flex flex-col items-center justify-center h-[250px] space-y-4">
              <div className="w-12 h-12 border-4 border-[var(--color-desert-700)] border-t-[var(--color-gold-500)] rounded-full animate-spin"></div>
              <p className="text-[var(--color-desert-400)] animate-pulse">جاري تحليل الفاتورة عبر الذكاء الاصطناعي...</p>
            </div>
          ) : result ? (
            <div className="space-y-6">
              <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                <p className="text-sm text-[var(--color-desert-400)] mb-1">اسم التاجر</p>
                <p className="font-bold text-xl">{result.merchantName}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                  <p className="text-sm text-[var(--color-desert-400)] mb-1">التاريخ</p>
                  <p className="font-bold font-mono text-sm">{result.date}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                  <p className="text-sm text-[var(--color-desert-400)] mb-1">التصنيف</p>
                  <p className="font-bold text-sm">{result.category}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                  <p className="text-sm text-[var(--color-desert-400)] mb-1">مبلغ الضريبة (VAT)</p>
                  <p className="font-bold font-mono text-sm text-[var(--color-gold-400)]">{result.vatAmount} SAR</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                  <p className="text-sm text-[var(--color-desert-400)] mb-1">الرقم الضريبي</p>
                  <p className="font-bold font-mono text-xs">{result.vatNumber}</p>
                </div>
              </div>

              <div className="bg-[var(--color-gold-500)]/20 p-4 rounded-xl border border-[var(--color-gold-500)]/30 flex justify-between items-center">
                <p className="text-sm text-[var(--color-gold-400)] font-bold">المبلغ الإجمالي</p>
                <p className="font-bold text-2xl text-[var(--color-gold-400)] font-mono">{result.totalAmount} SAR</p>
              </div>

              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 p-3 rounded-lg border border-emerald-400/20">
                <CheckCircle2 size={20} />
                <span className="font-bold text-sm">تم حفظ المصروف في قاعدة البيانات بنجاح!</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[250px] text-[var(--color-desert-500)] text-center">
              <FileText size={48} className="mb-4 opacity-20" />
              <p>قم برفع صورة الفاتورة لترى السحر!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
