'use client';

import React, { useEffect, useState } from 'react';
import { Package, ArrowLeftRight, Building2, MapPin, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { getWarehouses, getInventoryDistribution, transferStock } from '../warehouse-actions';

interface Warehouse {
  id: string;
  name: string;
  location: string | null;
  managerName: string | null;
}

interface DistributionRow {
  product: { id: string; name: string; sku: string };
  warehouses: Record<string, number>;
  total: number;
}

export default function AdvancedWarehousePage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [distribution, setDistribution] = useState<DistributionRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Transfer Modal State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{id: string, name: string} | null>(null);
  const [fromWarehouse, setFromWarehouse] = useState('');
  const [toWarehouse, setToWarehouse] = useState('');
  const [transferQty, setTransferQty] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    await getWarehouses(); // Ensure dummy warehouses are seeded if empty
    const distRes = await getInventoryDistribution();
    if (distRes.success && distRes.data && distRes.warehousesList) {
      setWarehouses(distRes.warehousesList);
      setDistribution(distRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenTransfer = (productId: string, productName: string, defaultFrom: string) => {
    setSelectedProduct({ id: productId, name: productName });
    setFromWarehouse(defaultFrom);
    setToWarehouse('');
    setTransferQty('');
    setIsTransferModalOpen(true);
  };

  const executeTransfer = async () => {
    if (!selectedProduct || !fromWarehouse || !toWarehouse || !transferQty) return;
    if (fromWarehouse === toWarehouse) {
      alert('لا يمكن النقل لنفس المستودع');
      return;
    }
    
    setIsTransferring(true);
    const res = await transferStock(selectedProduct.id, fromWarehouse, toWarehouse, parseInt(transferQty));
    
    if (res.success) {
      setIsTransferModalOpen(false);
      fetchData(); // Refresh table
    } else {
      alert('حدث خطأ: ' + res.error);
    }
    setIsTransferring(false);
  };

  return (
    <div className="space-y-6 pb-12" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Building2 className="text-primary" size={32} />
            إدارة المستودعات (Advanced Warehouse)
          </h1>
          <p className="text-muted-foreground mt-1">تتبع المخزون عبر فروع ومستودعات متعددة ونقل البضائع</p>
        </div>
      </div>

      {/* Warehouses Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          [1,2].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse"></div>)
        ) : warehouses.length === 0 ? (
          <div className="col-span-3 text-center text-muted-foreground p-8 bg-card rounded-2xl border border-white/5">لا توجد مستودعات.</div>
        ) : (
          warehouses.map(wh => (
            <div key={wh.id} className="bg-card/50 border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Building2 size={80} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 relative z-10">{wh.name}</h3>
              <div className="flex items-center gap-2 text-muted-foreground text-sm relative z-10">
                <MapPin size={14} /> <span>{wh.location || 'بدون عنوان'}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center relative z-10 text-sm">
                <span className="text-white/50">أمين المستودع:</span>
                <span className="font-bold text-primary">{wh.managerName || 'غير محدد'}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Distribution Matrix */}
      <div className="bg-card rounded-2xl border border-white/5 shadow-xl overflow-hidden mt-8">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <Package className="text-primary" />
          <h2 className="text-xl font-bold text-white">توزيع المخزون (Stock Distribution)</h2>
        </div>
        
        {loading ? (
          <div className="p-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : distribution.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">لا توجد منتجات لعرض المخزون</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-black/40 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-semibold">المنتج</th>
                  {warehouses.map(wh => (
                    <th key={wh.id} className="px-6 py-4 font-semibold text-center border-r border-white/5">{wh.name}</th>
                  ))}
                  <th className="px-6 py-4 font-semibold text-center border-r border-white/5 bg-primary/5 text-primary">الإجمالي (Total)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {distribution.map((row) => (
                  <tr key={row.product.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{row.product.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{row.product.sku}</div>
                    </td>
                    {warehouses.map(wh => {
                      const qty = row.warehouses[wh.id] || 0;
                      return (
                        <td key={wh.id} className="px-6 py-4 text-center border-r border-white/5 relative">
                          <div className={`font-mono font-bold ${qty > 0 ? 'text-white' : 'text-white/30'}`}>
                            {qty}
                          </div>
                          {qty > 0 && (
                            <button
                              onClick={() => handleOpenTransfer(row.product.id, row.product.name, wh.id)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary/20 text-primary rounded-md opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-black transition-all"
                              title="نقل مخزون من هذا المستودع"
                            >
                              <ArrowLeftRight size={14} />
                            </button>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 text-center border-r border-white/5 bg-primary/5">
                      <div className="font-mono font-bold text-primary text-lg">{row.total}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transfer Modal */}
      {isTransferModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#07070F] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/5 flex items-center gap-3 text-primary">
              <ArrowLeftRight size={28} />
              <h3 className="text-xl font-bold text-white">نقل المخزون (Stock Transfer)</h3>
            </div>
            
            <div className="p-6 space-y-5 text-white">
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                <span className="text-sm text-primary mb-1 block">المنتج المحدد:</span>
                <span className="font-bold text-lg">{selectedProduct.name}</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2">من مستودع (المصدر)</label>
                  <select 
                    value={fromWarehouse}
                    onChange={(e) => setFromWarehouse(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                  >
                    <option value="" disabled>اختر مستودع المصدر...</option>
                    {warehouses.map(wh => (
                      <option key={wh.id} value={wh.id}>{wh.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex justify-center -my-2 relative z-10">
                  <div className="bg-background border border-white/10 p-2 rounded-full text-muted-foreground">
                    <ArrowLeftRight size={16} className="rotate-90" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2">إلى مستودع (الوجهة)</label>
                  <select 
                    value={toWarehouse}
                    onChange={(e) => setToWarehouse(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                  >
                    <option value="" disabled>اختر مستودع الوجهة...</option>
                    {warehouses.map(wh => (
                      <option key={wh.id} value={wh.id} disabled={wh.id === fromWarehouse}>{wh.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2">الكمية المراد نقلها</label>
                  <input 
                    type="number"
                    value={transferQty}
                    onChange={(e) => setTransferQty(e.target.value)}
                    placeholder="مثال: 10"
                    min="1"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 font-mono text-lg text-center"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white/5 border-t border-white/5 flex gap-3">
              <button 
                onClick={() => setIsTransferModalOpen(false)}
                disabled={isTransferring}
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                onClick={executeTransfer}
                disabled={isTransferring || !toWarehouse || !transferQty || parseInt(transferQty) <= 0}
                className="flex-1 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-black transition-colors disabled:opacity-50"
              >
                {isTransferring ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تأكيد النقل'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
