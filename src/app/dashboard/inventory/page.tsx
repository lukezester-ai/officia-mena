/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, ScanBarcode, ArrowUpDown, AlertTriangle, FileScan, MessageCircle, Fuel, Sprout, X, Sparkles, Loader2, Camera } from 'lucide-react';
import Link from 'next/link';
import { getProducts, createProduct, generateProductWithAi } from './inventory-actions';
import BarcodeScanner from '@/components/inventory/BarcodeScanner';

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Scanner State
  const [isScanningGlobal, setIsScanningGlobal] = useState(false);
  const [isScanningForm, setIsScanningForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [productType, setProductType] = useState<'general' | 'petroleum' | 'fertilizer'>('general');
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    unitPrice: '',
    costPrice: '',
    initialQuantity: '',
    initialStockReference: '',
    category: '',
    apiGravity: '',
    mewaRegistration: '',
    securityClearanceExpiry: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const res = await getProducts();
    if (res.success && res.data) {
      setProducts(res.data);
    }
    setLoading(false);
  };

  const handleAiFill = async () => {
    if (!aiPrompt) return;
    setIsAiLoading(true);
    
    const res = await generateProductWithAi(aiPrompt);
    if (res.success && res.data) {
      const data = res.data;
      if (data.isPetroleum) setProductType('petroleum');
      else if (data.isFertilizer) setProductType('fertilizer');
      else setProductType('general');
      
      setFormData({
        ...formData,
        name: data.name || '',
        sku: data.sku || '',
        unitPrice: data.unitPrice?.toString() || '',
        costPrice: data.costPrice?.toString() || '',
        initialQuantity: '',
        initialStockReference: '',
        category: data.category || '',
        apiGravity: data.apiGravity?.toString() || '',
        barcode: Math.floor(Math.random() * 1000000000000).toString() // Generate random barcode
      });
      setAiPrompt('');
    } else {
      alert('فشل الذكاء الاصطناعي في تحليل النص');
    }
    
    setIsAiLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const res = await createProduct({
      name: formData.name,
      sku: formData.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
      barcode: formData.barcode || Math.floor(Math.random() * 1000000000000).toString(),
      unitPrice: parseFloat(formData.unitPrice) || 0,
      costPrice: parseFloat(formData.costPrice) || undefined,
      initialQuantity: parseInt(formData.initialQuantity, 10) || 0,
      initialStockReference: formData.initialStockReference || undefined,
      category: formData.category || 'عام',
      isPetroleum: productType === 'petroleum',
      apiGravity: productType === 'petroleum' && formData.apiGravity ? parseFloat(formData.apiGravity) : undefined,
      isFertilizer: productType === 'fertilizer',
      mewaRegistration: productType === 'fertilizer' ? formData.mewaRegistration : undefined,
      securityClearanceExpiry: productType === 'fertilizer' ? formData.securityClearanceExpiry : undefined
    });
    
    if (res.success) {
      setIsModalOpen(false);
      setFormData({ name: '', sku: '', barcode: '', unitPrice: '', costPrice: '', initialQuantity: '', initialStockReference: '', category: '', apiGravity: '', mewaRegistration: '', securityClearanceExpiry: '' });
      fetchData();
    } else {
      alert('حدث خطأ أثناء الحفظ');
    }
    setIsSubmitting(false);
  };

  const formatMoney = (val: string | number | null | undefined) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(Number(val));
  };

  const inventoryValue = products.reduce((sum, product) => {
    return sum + (Number(product.costPrice || 0) * Number(product.qty || 0));
  }, 0);
  const reorderCount = products.filter((product) => Number(product.qty || 0) <= Number(product.minStockLevel || 5)).length;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Package className="text-primary" size={32} />
            المخزون (Inventory)
          </h1>
          <p className="text-muted-foreground">إدارة المنتجات، الكميات، والبترول والسماد.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setIsScanningGlobal(true)}
            className="bg-card border border-white/10 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-white/5 transition-colors shadow-sm"
          >
            <Camera size={18} />
            مسح باركود
          </button>
          <Link href="/dashboard/inventory/receipt-scanner" className="bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/20 transition-colors shadow-sm">
            <FileScan size={18} />
            AI قراءة فاتورة
          </Link>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={18} />
            إضافة منتج
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-2xl border border-white/5 p-6 shadow-sm">
          <h3 className="text-muted-foreground text-sm font-medium mb-1">إجمالي قيمة المخزون</h3>
          <p className="text-2xl font-bold text-white">{formatMoney(inventoryValue)}</p>
        </div>
        <div className="bg-card rounded-2xl border border-white/5 p-6 shadow-sm">
          <h3 className="text-muted-foreground text-sm font-medium mb-1">إجمالي المنتجات</h3>
          <p className="text-2xl font-bold text-white">{products.length} نوع</p>
        </div>
        <div className="bg-rose-500/10 border-rose-500/20 rounded-2xl border p-6 shadow-sm">
          <h3 className="text-rose-400 text-sm font-medium mb-1 flex items-center gap-2">
            <AlertTriangle size={16} />
            منتجات بحاجة للطلب
          </h3>
          <p className="text-2xl font-bold text-rose-500">{reorderCount} منتج</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card border border-white/5 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="relative max-w-sm w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث بالاسم، SKU، أو الباركود..." 
              className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pr-10 pl-4 text-sm text-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-white/5 text-muted-foreground border-b border-white/10">
              <tr>
                <th className="py-3 px-6 font-medium">المنتج (Product)</th>
                <th className="py-3 px-6 font-medium">SKU</th>
                <th className="py-3 px-6 font-medium">الباركود (Barcode)</th>
                <th className="py-3 px-6 font-medium text-center">التصنيف (Class)</th>
                <th className="py-3 px-6 font-medium">السعر (Price)</th>
                <th className="py-3 px-6 font-medium flex items-center gap-1 justify-end">الكمية (Qty) <ArrowUpDown size={14}/></th>
                <th className="py-3 px-6 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">جاري التحميل...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">لا توجد منتجات. ابدأ بإضافة منتج جديد.</td>
                </tr>
              ) : (
                products.filter(p => 
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.barcode?.includes(searchQuery)
                ).map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-bold">{p.name}</td>
                    <td className="py-4 px-6 font-mono text-muted-foreground">{p.sku}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <ScanBarcode size={14} className="text-muted-foreground" />
                        <span className="font-mono text-xs text-muted-foreground tracking-widest">{p.barcode}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {p.isPetroleum && (
                        <div className="flex flex-col items-center gap-1">
                          <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded border border-primary/30 flex items-center gap-1"><Fuel size={12}/> بترول</span>
                          {p.apiGravity && <span className="text-[10px] text-muted-foreground">API: {p.apiGravity}</span>}
                        </div>
                      )}
                      {p.isFertilizer && (
                        <div className="flex flex-col items-center gap-1">
                          <span className="bg-amber-500/20 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1"><Sprout size={12}/> سماد (مقيد)</span>
                          {p.securityClearanceExpiry && <span className="text-[10px] text-muted-foreground" dir="ltr">🛡️ {new Date(p.securityClearanceExpiry).toLocaleDateString()}</span>}
                        </div>
                      )}
                      {!p.isHalal && !p.isPetroleum && !p.isFertilizer && <span className="text-muted-foreground">-</span>}
                    </td>
                    <td className="py-4 px-6">{formatMoney(p.unitPrice)}</td>
                    <td className="py-4 px-6 text-left" dir="ltr">
                      <span className="font-bold text-white">
                        {p.qty}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl w-full max-w-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-xl font-bold text-white">إضافة منتج للمخزون</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-rose-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-[#07070F]">
              
              {/* AI Smart Fill Box */}
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-6 relative overflow-hidden">
                <h2 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                  <Sparkles size={16} /> التعبئة الذكية (AI Auto-fill)
                </h2>
                <div className="flex gap-2 relative z-10">
                  <input 
                    type="text" 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="مثال: أضف ديزل يورو 5 بسعر 1.15 لتر..."
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                    onKeyDown={(e) => e.key === 'Enter' && handleAiFill()}
                  />
                  <button 
                    type="button"
                    onClick={handleAiFill}
                    disabled={isAiLoading || !aiPrompt}
                    className="bg-primary hover:bg-primary/90 text-black font-bold px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    تحليل
                  </button>
                </div>
              </div>

              <form id="productForm" onSubmit={handleSave} className="space-y-4">
                
                {/* Product Type Selection */}
                <div className="flex gap-4 p-1 bg-black/40 rounded-xl border border-white/10">
                  <button type="button" onClick={() => setProductType('general')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${productType === 'general' ? 'bg-white shadow-sm border border-white text-black' : 'text-muted-foreground hover:bg-white/5'}`}>عام (General)</button>
                  <button type="button" onClick={() => setProductType('petroleum')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${productType === 'petroleum' ? 'bg-primary shadow-sm border border-primary text-black' : 'text-muted-foreground hover:bg-white/5'}`}><Fuel size={14}/> بترول</button>
                  <button type="button" onClick={() => setProductType('fertilizer')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${productType === 'fertilizer' ? 'bg-amber-500 shadow-sm border border-amber-500 text-black' : 'text-muted-foreground hover:bg-white/5'}`}><Sprout size={14}/> سماد</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">اسم المنتج *</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">السعر (SAR) *</label>
                    <input required type="number" step="0.01" value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">Cost Price (COGS)</label>
                    <input type="number" step="0.01" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">الرصيد الافتتاحي</label>
                    <input type="number" min="0" step="1" value={formData.initialQuantity} onChange={e => setFormData({...formData, initialQuantity: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">مرجع الرصيد الافتتاحي</label>
                    <input type="text" value={formData.initialStockReference} onChange={e => setFormData({...formData, initialStockReference: e.target.value})} placeholder="مثال: INV-2026-001" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">الباركود (Barcode)</label>
                    <div className="flex gap-2">
                      <input type="text" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} placeholder="اتركه فارغاً للتوليد" className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
                      <button type="button" onClick={() => setIsScanningForm(true)} className="bg-white/10 hover:bg-white/20 text-white px-3 rounded-lg border border-white/10 transition-colors">
                        <Camera size={16} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">رمز SKU (اختياري)</label>
                    <input type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">التصنيف</label>
                    <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
                  </div>
                </div>

                {/* Petroleum Fields */}
                {productType === 'petroleum' && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-4 space-y-3">
                    <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1"><Fuel size={14}/> الخصائص البترولية</h3>
                    <div>
                      <label className="block text-xs font-bold text-white mb-1">API Gravity (لتحويل الحجم/الكتلة)</label>
                      <input type="number" step="0.1" placeholder="مثال: 35.5" value={formData.apiGravity} onChange={e => setFormData({...formData, apiGravity: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                )}

                {/* Fertilizer Fields */}
                {productType === 'fertilizer' && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mt-4 space-y-3">
                    <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1"><Sprout size={14}/> قيود زراعية وأمنية</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-white mb-1">رقم تسجيل الزراعة (MEWA)</label>
                        <input type="text" value={formData.mewaRegistration} onChange={e => setFormData({...formData, mewaRegistration: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-white mb-1">انتهاء التصريح الأمني (MOI)</label>
                        <input type="date" value={formData.securityClearanceExpiry} onChange={e => setFormData({...formData, securityClearanceExpiry: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                      </div>
                    </div>
                  </div>
                )}
                
              </form>
            </div>
            
            <div className="p-4 border-t border-white/10 bg-card flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-white transition-colors"
              >
                إلغاء
              </button>
              <button 
                type="submit"
                form="productForm"
                disabled={isSubmitting || !formData.name || !formData.unitPrice}
                className="bg-primary hover:bg-primary/90 text-black px-6 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'جاري الحفظ...' : 'حفظ المنتج'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanners */}
      {isScanningGlobal && (
        <BarcodeScanner 
          onScan={(text) => {
            setSearchQuery(text);
            setIsScanningGlobal(false);
          }} 
          onClose={() => setIsScanningGlobal(false)} 
        />
      )}

      {isScanningForm && (
        <BarcodeScanner 
          onScan={(text) => {
            setFormData({ ...formData, barcode: text });
            setIsScanningForm(false);
          }} 
          onClose={() => setIsScanningForm(false)} 
        />
      )}
    </div>
  );
}
