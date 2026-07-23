/* eslint-disable */
// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingCart, Plus, CheckCircle, PackageOpen, ArrowRight, Loader2, Warehouse } from 'lucide-react';
import Link from 'next/link';
import { getPOs, receivePO } from './po-actions';
import { getWarehouses } from '../warehouse-actions';

interface PO {
  id: string;
  poNumber: string;
  supplierName: string;
  totalAmount: string;
  status: string;
  createdAt: string;
}

interface Warehouse {
  id: string;
  name: string;
}

export default function PurchaseOrdersPage() {
  const [pos, setPos] = useState<PO[]>([]);
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  
  // Receive Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPo, setSelectedPo] = useState<PO | null>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [isReceiving, setIsReceiving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [poRes, whRes] = await Promise.all([getPOs(), getWarehouses()]);
    if (poRes.success && poRes.data) setPos(poRes.data);
    if (whRes.success && whRes.data) setWarehouses(whRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openReceiveModal = (po: PO) => {
    setSelectedPo(po);
    setSelectedWarehouseId(warehouses.length > 0 ? warehouses[0].id : '');
    setIsModalOpen(true);
  };

  const executeReceive = async () => {
    if (!selectedPo || !selectedWarehouseId) return;
    setIsReceiving(true);
    
    const res = await receivePO(selectedPo.id, selectedWarehouseId);
    if (res.success) {
      alert(`تم استلام ${selectedPo.poNumber} بنجاح وتم تحديث المخزون!`);
      setIsModalOpen(false);
      fetchData(); // Refresh list
    } else {
      alert('حدث خطأ: ' + res.error);
    }
    setIsReceiving(false);
  };

  const formatMoney = (val: string) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(parseFloat(val));
  };

  return (
    <div className="space-y-6 pb-12" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="text-primary" /> أوامر الشراء (Purchase Orders)
          </h1>
          <p className="text-muted-foreground mt-1">إدارة المشتريات واستلام البضائع للمستودع</p>
        </div>
        <Link 
          href="/dashboard/inventory/purchase-orders/create" 
          className="bg-primary hover:bg-primary/90 text-black px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2"
        >
          <Plus size={20} /> أمر شراء جديد
        </Link>
      </div>

      <div className="bg-card rounded-2xl border border-white/5 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : pos.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            لا توجد أوامر شراء حتى الآن
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-white/5 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-semibold">رقم الأمر</th>
                  <th className="px-6 py-4 font-semibold">المورد</th>
                  <th className="px-6 py-4 font-semibold">التاريخ</th>
                  <th className="px-6 py-4 font-semibold">الإجمالي</th>
                  <th className="px-6 py-4 font-semibold">الحالة</th>
                  <th className="px-6 py-4 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pos.map((po) => (
                  <tr key={po.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-white">{po.poNumber}</td>
                    <td className="px-6 py-4 font-bold text-white">{po.supplierName}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(po.createdAt).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 font-mono text-primary font-bold">
                      {formatMoney(po.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      {po.status === 'received' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">
                          <CheckCircle size={14} /> مستلم (في المخزون)
                        </span>
                      ) : po.status === 'sent' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400">
                          <ShoppingCart size={14} /> مُرسل للمورد
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-white/70">
                          {po.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {po.status !== 'received' && (
                        <button
                          onClick={() => openReceiveModal(po)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 text-primary hover:bg-primary hover:text-black rounded-lg transition-all font-bold text-xs"
                        >
                          <PackageOpen size={16} /> استلام البضاعة
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receive Modal */}
      {isModalOpen && selectedPo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#07070F] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/5 flex items-center gap-3 text-primary">
              <PackageOpen size={28} />
              <h3 className="text-xl font-bold text-white">استلام البضاعة</h3>
            </div>
            
            <div className="p-6 space-y-4 text-white">
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-4">
                <span className="text-sm text-primary block mb-1">استلام أمر الشراء:</span>
                <span className="font-bold text-lg font-mono block mb-1">{selectedPo.poNumber}</span>
                <span className="text-sm text-muted-foreground">من: {selectedPo.supplierName}</span>
              </div>

              <p className="text-sm text-muted-foreground">
                عند تأكيد الاستلام، سيتم تلقائياً إنشاء المنتجات في النظام وتحديث كميات المخزون في المستودع الذي تختاره.
              </p>
              
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-2 flex items-center gap-2">
                  <Warehouse size={16}/> اختر المستودع للاستلام
                </label>
                <select 
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                >
                  <option value="" disabled>اختر مستودع...</option>
                  {warehouses.map(wh => (
                    <option key={wh.id} value={wh.id}>{wh.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="p-6 bg-white/5 border-t border-white/5 flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={isReceiving}
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                onClick={executeReceive}
                disabled={isReceiving || !selectedWarehouseId}
                className="flex-1 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-black transition-colors disabled:opacity-50"
              >
                {isReceiving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تأكيد الاستلام'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

