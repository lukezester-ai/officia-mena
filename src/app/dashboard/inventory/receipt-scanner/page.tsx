'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, Package, Bot, Building, CreditCard, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { analyzeReceiptImage, confirmAndAutomateReceipt } from './actions';

type ReceiptItem = {
  name: string;
  qty: number;
  unitPrice: number;
  isPetroleum?: boolean;
  isFertilizer?: boolean;
};

type ReceiptScanResult = {
  supplierName: string;
  totalAmount: number;
  date: string;
  items: ReceiptItem[];
};

export default function ReceiptScannerPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ReceiptScanResult | null>(null);
  
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!imagePreview) return;
    
    setIsScanning(true);
    setScanResult(null);
    
    const res = await analyzeReceiptImage(imagePreview);
    
    if (res.success && res.data) {
      setScanResult(res.data);
    } else {
      alert('حدث خطأ أثناء قراءة الفاتورة.');
    }
    
    setIsScanning(false);
  };

  const handleConfirm = async () => {
    if (!scanResult) return;
    
    setIsConfirming(true);
    const res = await confirmAndAutomateReceipt(scanResult);
    
    if (res.success) {
      setIsSuccess(true);
    } else {
      alert('حدث خطأ أثناء الحفظ.');
    }
    setIsConfirming(false);
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(val);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] text-center" dir="rtl">
        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
          <CheckCircle2 className="text-emerald-500" size={60} />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">تمت الأتمتة بنجاح!</h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
          قام AI Maestro بتسجيل الفاتورة كـ <span className="text-white font-bold">مصروف في المحاسبة</span>، وتمت إضافة المنتجات تلقائياً إلى <span className="text-white font-bold">المخزون</span>.
        </p>
        
        <div className="flex gap-4">
          <Link href="/dashboard/inventory" className="bg-primary hover:bg-primary/90 text-black font-bold py-3 px-8 rounded-xl transition-colors">
            العودة للمخزون
          </Link>
          <button onClick={() => {
            setIsSuccess(false);
            setImagePreview(null);
            setScanResult(null);
          }} className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-xl transition-colors border border-white/10">
            مسح فاتورة أخرى
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Bot className="text-primary" size={32} />
            AI Maestro: قراءة الفواتير (OCR)
          </h1>
          <p className="text-muted-foreground">صوّر فاتورة المورد، وسيقوم الذكاء الاصطناعي بتسجيلها في المحاسبة والمخزون معاً.</p>
        </div>
        
        <Link href="/dashboard/inventory" className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-white/10 transition-colors shadow-sm">
           العودة للمخزون <ArrowRight size={18} />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: UPLOAD & PREVIEW */}
        <div className="space-y-6">
          <div className="bg-card border border-white/10 rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-white mb-4">1. ارفع صورة الفاتورة</h2>
            
            {!imagePreview ? (
              <div 
                className="border-2 border-dashed border-white/20 rounded-2xl p-12 text-center cursor-pointer hover:bg-white/5 transition-colors group"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <UploadCloud className="text-primary" size={40} />
                </div>
                <p className="text-white font-bold text-lg mb-2">اضغط لرفع صورة الفاتورة</p>
                <p className="text-muted-foreground text-sm">أو اسحب وأفلت الملف هنا (JPG, PNG)</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-white/10 max-h-[400px] flex justify-center bg-black/50">
                  <img src={imagePreview} alt="Receipt" className="object-contain h-[400px]" />
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => { setImagePreview(null); setScanResult(null); }}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl border border-white/10 transition-colors"
                  >
                    تغيير الصورة
                  </button>
                  <button 
                    onClick={handleScan}
                    disabled={isScanning}
                    className="flex-2 bg-primary hover:bg-primary/90 text-black font-bold py-3 px-8 rounded-xl transition-colors flex items-center justify-center gap-2 flex-grow disabled:opacity-50"
                  >
                    {isScanning ? (
                      <>جاري التحليل (AI)...</>
                    ) : (
                      <><Sparkles size={18} /> قراءة الفاتورة بـ AI</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: AI RESULTS & CONFIRMATION */}
        <div>
          {isScanning && (
            <div className="bg-card border border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center text-center h-full animate-pulse min-h-[400px]">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
              <h3 className="text-xl font-bold text-white mb-2">Maestro يقرأ الفاتورة...</h3>
              <p className="text-muted-foreground">جاري استخراج المورد، المنتجات، والأسعار لتحديث الأقسام.</p>
            </div>
          )}
          
          {!isScanning && !scanResult && (
            <div className="bg-card border border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <Bot className="text-white/20 mb-4" size={80} />
              <h3 className="text-xl font-bold text-white/50">بانتظار قراءة الفاتورة</h3>
            </div>
          )}

          {!isScanning && scanResult && (
            <div className="bg-card border border-primary/30 rounded-3xl p-6 shadow-[0_0_30px_rgba(212,175,55,0.05)] h-full flex flex-col">
              <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                <CheckCircle2 size={24} /> تم استخراج البيانات
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="text-muted-foreground text-xs font-bold mb-1 flex items-center gap-1"><Building size={14}/> المورد</div>
                  <div className="text-white font-bold text-lg">{scanResult.supplierName}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="text-muted-foreground text-xs font-bold mb-1 flex items-center gap-1"><CreditCard size={14}/> الإجمالي</div>
                  <div className="text-primary font-bold text-lg">{formatMoney(scanResult.totalAmount)}</div>
                </div>
              </div>

              <div className="flex-1 bg-black/40 rounded-xl border border-white/10 overflow-hidden mb-6 flex flex-col">
                <div className="bg-white/5 px-4 py-2 border-b border-white/10">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2"><Package size={16}/> المنتجات المستخرجة</h3>
                </div>
                <div className="overflow-y-auto p-0 flex-1">
                  <table className="w-full text-right text-sm">
                    <thead className="text-muted-foreground bg-white/5">
                      <tr>
                        <th className="py-2 px-4 font-normal">المنتج</th>
                        <th className="py-2 px-4 font-normal text-center">الكمية</th>
                        <th className="py-2 px-4 font-normal text-left">سعر الوحدة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {scanResult.items.map((item, idx) => (
                        <tr key={idx} className="text-white">
                          <td className="py-3 px-4 font-bold">{item.name}</td>
                          <td className="py-3 px-4 text-center font-mono bg-white/5">{item.qty}</td>
                          <td className="py-3 px-4 text-left font-mono">{formatMoney(item.unitPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AUTOMATION EXPLANATION */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6">
                <h4 className="text-emerald-400 font-bold text-sm mb-2 flex items-center gap-2">
                  <Sparkles size={16}/> ماذا سيحدث عند الاعتماد؟
                </h4>
                <ul className="text-sm text-emerald-100 space-y-1 list-disc list-inside">
                  <li>إنشاء <strong>فاتورة مشتريات (مصروف)</strong> في قسم المحاسبة.</li>
                  <li>إضافة المنتجات فوراً إلى <strong>مخزون المستودع</strong>.</li>
                </ul>
              </div>

              <button 
                onClick={handleConfirm}
                disabled={isConfirming}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-4 rounded-xl transition-colors disabled:opacity-50 text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                {isConfirming ? 'جاري الأتمتة...' : 'اعتماد وإضافة للمحاسبة والمخزون'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
