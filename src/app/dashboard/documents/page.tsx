'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function DocumentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setMessage('جاري معالجة المستند وقراءته باستخدام الذكاء الاصطناعي...');

    const formData = new FormData();
    formData.append('file', file);
    // Hardcode tenantId for demo purposes, normally comes from auth context
    formData.append('tenantId', '11111111-1111-1111-1111-111111111111');

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(`تم رفع المستند بنجاح! تم استخراج ${data.chunksCount} مقطع للبحث.`);
        setFile(null);
      } else {
        setStatus('error');
        setMessage(data.error || 'حدث خطأ أثناء رفع المستند.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'فشل الاتصال بالخادم.');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-desert-900)] mb-2">إدارة المستندات الذكية (RAG)</h1>
        <p className="text-[var(--color-desert-600)]">قم برفع العقود، السياسات، أو التقارير هنا. سيقوم المايسترو (AI) بقراءتها وفهمها لتتمكن من سؤاله عنها لاحقاً.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-desert-200)] p-8">
        <div 
          className="border-2 border-dashed border-[var(--color-desert-300)] rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-[var(--color-desert-50)] transition-colors cursor-pointer relative"
        >
          <input 
            type="file" 
            accept="application/pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={status === 'uploading'}
          />
          
          <div className="w-16 h-16 rounded-full bg-[var(--color-desert-100)] flex items-center justify-center mb-4 text-[var(--color-gold-600)]">
            <Upload size={28} />
          </div>
          
          <h3 className="text-xl font-bold text-[var(--color-desert-900)] mb-2">
            {file ? file.name : 'اسحب وأفلت ملف PDF هنا'}
          </h3>
          <p className="text-sm text-[var(--color-desert-500)] mb-6">
            {file ? `حجم الملف: ${(file.size / 1024 / 1024).toFixed(2)} MB` : 'أو انقر لاختيار ملف من جهازك'}
          </p>
          
          {file && status === 'idle' && (
            <button 
              onClick={(e) => { e.preventDefault(); handleUpload(); }}
              className="px-6 py-2 bg-gradient-to-r from-[var(--color-gold-500)] to-[var(--color-gold-600)] text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all z-10 relative"
            >
              تحليل ورفع المستند
            </button>
          )}

          {status === 'uploading' && (
            <div className="flex items-center gap-3 text-[var(--color-gold-600)] z-10 relative">
              <Loader2 className="animate-spin" size={20} />
              <span className="font-medium">{message}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-3 text-[var(--color-emerald-600)] bg-[var(--color-emerald-500)]/10 px-4 py-2 rounded-lg mt-4 z-10 relative">
              <CheckCircle size={20} />
              <span className="font-medium">{message}</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-3 text-red-600 bg-red-50 px-4 py-2 rounded-lg mt-4 z-10 relative">
              <AlertCircle size={20} />
              <span className="font-medium">{message}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 bg-[var(--color-desert-50)] p-6 rounded-xl border border-[var(--color-desert-200)]">
        <h3 className="font-bold text-[var(--color-desert-900)] flex items-center gap-2 mb-3">
          <FileText size={18} className="text-[var(--color-gold-600)]" />
          كيف تعمل هذه الميزة؟
        </h3>
        <ul className="text-sm text-[var(--color-desert-700)] space-y-2 list-disc list-inside">
          <li>يقوم النظام باستخراج النصوص من ملفات الـ PDF الخاصة بك.</li>
          <li>يتم تحويل النصوص إلى "متجهات" (Vectors) رياضية باستخدام تقنية Google Gemini Embeddings.</li>
          <li>يتم حفظ المتجهات في قاعدة بيانات آمنة خاصة بك.</li>
          <li>عندما تطرح سؤالاً على المايسترو، سيقوم بالبحث الدلالي (Semantic Search) للعثور على الإجابة الدقيقة من مستنداتك!</li>
        </ul>
      </div>
    </div>
  );
}
