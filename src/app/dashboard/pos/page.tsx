/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, CreditCard, Banknote, CheckCircle2, QrCode, Search, Printer } from 'lucide-react';
import { getPosProducts, checkoutPos } from './actions';
import { QRCodeSVG } from 'qrcode.react';

export default function POSPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [lastInvoice, setLastInvoice] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const res = await getPosProducts();
    if (res.success && res.data) {
      setProducts(res.data);
    }
    setLoading(false);
  };

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.unitPrice) * item.qty), 0);
  const vatRate = 15; // 15% Standard KSA VAT
  const vatAmount = subtotal * (vatRate / 100);
  const total = subtotal + vatAmount;

  const handleCheckout = async (method: 'cash' | 'card') => {
    if (cart.length === 0) return;
    
    setCheckoutStatus('processing');
    
    const res = await checkoutPos({
      items: cart,
      subtotal: subtotal,
      vatRate: vatRate,
      paymentMethod: method
    });
    
    if (res.success) {
      setCheckoutStatus('success');
      setLastInvoice({ number: res.invoiceNumber, qr: res.qrCode, total: total.toFixed(2), items: [...cart] });
      setCart([]);
    } else {
      alert('خطأ أثناء الدفع: ' + res.error);
      setCheckoutStatus('idle');
    }
  };

  const formatMoney = (val: number | string) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(Number(val));
  };

  if (checkoutStatus === 'success' && lastInvoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] bg-white/50 print:bg-white print:min-h-0" dir="rtl">
        
        {/* Screen UI only */}
        <div className="print:hidden text-center mb-8">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-emerald-500" size={60} />
          </div>
          <h1 className="text-4xl font-bold text-[var(--color-desert-900)] mb-2">تم الدفع بنجاح!</h1>
          <p className="text-[var(--color-desert-500)] text-lg">تم إصدار فاتورة ضريبية مبسطة (B2C)</p>
        </div>

        {/* Thermal Receipt (Screen + Print) */}
        <div className="bg-white p-6 rounded-2xl border border-[var(--color-desert-200)] shadow-lg print:shadow-none print:border-none print:p-0 w-[300px] print:w-auto mx-auto flex flex-col items-center">
          
          <h2 className="font-bold text-xl text-black mb-1">Officia MENA Corp</h2>
          <p className="text-xs text-gray-500 font-mono mb-4">TRN: 310123456700003</p>
          <div className="w-full border-b border-dashed border-gray-300 mb-4"></div>
          
          <div className="w-full text-sm text-left mb-4" dir="ltr">
            <div className="flex justify-between mb-1">
              <span className="text-gray-500">Invoice:</span>
              <span className="font-mono font-bold">{lastInvoice.number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date:</span>
              <span className="font-mono">{new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString('en-GB')}</span>
            </div>
          </div>
          
          <div className="w-full border-b border-dashed border-gray-300 mb-4"></div>

          {/* Items (Thermal layout) */}
          <div className="w-full text-sm mb-4">
            {lastInvoice.items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-start mb-2" dir="ltr">
                <div className="flex-1 pr-2">
                  <p className="font-bold leading-tight text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.qty} x {item.unitPrice}</p>
                </div>
                <div className="font-mono font-bold">
                  {(item.qty * parseFloat(item.unitPrice)).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="w-full border-b border-dashed border-gray-300 mb-4"></div>
          
          <div className="w-full text-sm font-bold text-left mb-6" dir="ltr">
            <div className="flex justify-between mb-1 text-gray-500">
              <span>VAT 15%:</span>
              <span className="font-mono">{(lastInvoice.total - (lastInvoice.total / 1.15)).toFixed(2)} SAR</span>
            </div>
            <div className="flex justify-between text-lg text-black mt-2">
              <span>TOTAL:</span>
              <span className="font-mono">{formatMoney(lastInvoice.total)}</span>
            </div>
          </div>
          
          {/* ZATCA QR Code */}
          {lastInvoice.qr ? (
             <QRCodeSVG value={lastInvoice.qr} size={160} />
          ) : (
            <div className="w-[160px] h-[160px] bg-gray-100 flex items-center justify-center text-xs text-gray-400">
              No QR
            </div>
          )}
          <p className="text-[10px] text-gray-400 mt-2 text-center w-full">Simplified Tax Invoice<br/>فاتورة ضريبية مبسطة</p>
        </div>
        
        {/* Actions (Screen only) */}
        <div className="print:hidden mt-8 flex gap-4">
          <button 
            onClick={() => {
              if (typeof window !== 'undefined') window.print();
            }}
            className="bg-white border-2 border-[var(--color-desert-200)] hover:bg-[var(--color-desert-50)] text-[var(--color-desert-700)] font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2"
          >
            <Printer size={20} /> طباعة الفاتورة
          </button>
          
          <button 
            onClick={() => setCheckoutStatus('idle')}
            className="bg-[var(--color-gold-500)] hover:bg-[var(--color-gold-600)] text-black font-bold py-3 px-8 rounded-xl transition-colors"
          >
            طلب جديد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6 print:hidden" dir="rtl">
      
      {/* LEFT: Products Grid */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-desert-900)] mb-1">نقطة البيع (POS)</h1>
            <p className="text-[var(--color-desert-600)] text-sm">مبيعات التجزئة والإصدار الفوري للفواتير</p>
          </div>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-desert-400)]" size={20} />
            <input 
              type="text" 
              placeholder="ابحث عن منتج..." 
              className="bg-white border-2 border-[var(--color-desert-200)] rounded-xl py-3 pr-10 pl-4 text-sm focus:outline-none focus:border-[var(--color-gold-500)] w-80 shadow-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-10">
          {loading ? (
            <div className="text-center text-[var(--color-desert-500)] mt-20">جاري تحميل المنتجات...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(product => (
                <div 
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white rounded-2xl border-2 border-[var(--color-desert-200)] p-4 cursor-pointer hover:border-[var(--color-gold-500)] hover:shadow-md transition-all flex flex-col h-40 active:scale-95"
                >
                  <div className="flex-1">
                    <span className="bg-[var(--color-desert-100)] text-[var(--color-desert-600)] text-xs font-bold px-2 py-1 rounded-md mb-2 inline-block">
                      {product.category || 'عام'}
                    </span>
                    <h3 className="font-bold text-[var(--color-desert-900)] leading-tight">{product.name}</h3>
                  </div>
                  <div className="mt-auto flex justify-between items-end">
                    <span className="font-mono font-bold text-lg text-[var(--color-desert-900)]">{formatMoney(product.unitPrice)}</span>
                    <div className="w-8 h-8 rounded-full bg-[var(--color-desert-50)] flex items-center justify-center">
                      <Plus size={16} className="text-[var(--color-gold-600)]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Cart & Checkout */}
      <div className="w-[400px] bg-white rounded-3xl border border-[var(--color-desert-200)] shadow-lg flex flex-col h-full overflow-hidden">
        <div className="p-6 border-b border-[var(--color-desert-200)] bg-[var(--color-desert-950)] text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="text-[var(--color-gold-500)]" /> سلة المشتريات
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-[var(--color-desert-50)]/50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[var(--color-desert-400)] text-center px-8">
              <ShoppingCart size={60} className="mb-4 opacity-20" />
              <p>السلة فارغة. قم بالضغط على المنتجات لإضافتها.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.id} className="bg-white p-3 rounded-xl border border-[var(--color-desert-200)] shadow-sm flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-[var(--color-desert-900)] text-sm truncate pr-1">{item.name}</h4>
                    <p className="font-mono text-xs text-[var(--color-desert-500)] mt-1">{formatMoney(item.unitPrice)}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-[var(--color-desert-50)] p-1 rounded-lg border border-[var(--color-desert-200)]">
                    <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white text-[var(--color-desert-600)]">
                      <Minus size={16} />
                    </button>
                    <span className="font-bold font-mono w-4 text-center text-sm">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white text-[var(--color-desert-900)]">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-[var(--color-desert-200)] bg-white">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-[var(--color-desert-500)] text-sm">
              <span>المجموع الفرعي</span>
              <span className="font-mono">{formatMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[var(--color-desert-500)] text-sm">
              <span>ضريبة القيمة المضافة ({vatRate}%)</span>
              <span className="font-mono">{formatMoney(vatAmount)}</span>
            </div>
            <div className="border-t border-dashed border-[var(--color-desert-200)] my-2"></div>
            <div className="flex justify-between text-[var(--color-desert-900)] font-bold text-2xl">
              <span>الإجمالي</span>
              <span className="font-mono text-[var(--color-gold-600)]">{formatMoney(total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleCheckout('cash')}
              disabled={cart.length === 0 || checkoutStatus === 'processing'}
              className="bg-[var(--color-desert-900)] hover:bg-black text-white py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Banknote size={24} className="text-[var(--color-gold-500)]" />
              دفع نقدي
            </button>
            <button 
              onClick={() => handleCheckout('card')}
              disabled={cart.length === 0 || checkoutStatus === 'processing'}
              className="bg-[var(--color-desert-100)] hover:bg-[var(--color-desert-200)] text-[var(--color-desert-900)] py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard size={24} />
              دفع شبكة
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
