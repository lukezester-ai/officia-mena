'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Search, Clock, CheckCircle2, XCircle } from 'lucide-react';

type LeaveRequest = {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'annual' | 'sick' | 'emergency' | 'unpaid';
  startDate: string;
  endDate: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
};

export default function LeaveManagementPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<{
    employeeId: string;
    type: 'annual' | 'sick' | 'emergency' | 'unpaid';
    startDate: string;
    endDate: string;
    reason: string;
  }>({
    employeeId: '',
    type: 'annual',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    // Mock data - replace with API call
    setRequests([
      {
        id: '1',
        employeeId: 'EMP001',
        employeeName: 'أحمد عبدالله',
        type: 'annual',
        startDate: '2024-02-01',
        endDate: '2024-02-05',
        days: 5,
        status: 'pending',
        reason: 'إجازة عائلية'
      },
      {
        id: '2',
        employeeId: 'EMP002',
        employeeName: 'محمد علي',
        type: 'sick',
        startDate: '2024-01-20',
        endDate: '2024-01-22',
        days: 3,
        status: 'approved',
        reason: 'مرض طارئ'
      }
    ]);
    setLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add request logic here
    setShowModal(false);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      annual: 'إجازة سنوية',
      sick: 'إجازة مرضية',
      emergency: 'إجازة طارئة',
      unpaid: 'إجازة بدون راتب'
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-xs font-bold text-emerald-300">
            <CheckCircle2 size={12} />
            معتمد
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/20 bg-rose-400/10 px-2 py-1 text-xs font-bold text-rose-300">
            <XCircle size={12} />
            مرفوض
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-xs font-bold text-amber-300">
            <Clock size={12} />
            قيد المراجعة
          </span>
        );
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-desert-900)] mb-2 flex items-center gap-3">
            <Calendar className="text-[var(--color-gold-600)]" size={32} />
            إدارة الإجازات
          </h1>
          <p className="text-[var(--color-desert-600)]">تتبع طلبات الإجازات والموافقات</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[var(--color-desert-900)] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-colors shadow-sm"
        >
          <Plus size={18} />
          طلب إجازة جديد
        </button>
      </div>

      <div className="bg-white border border-[var(--color-desert-200)] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--color-desert-200)] flex justify-between items-center bg-[var(--color-desert-50)]">
          <div className="relative max-w-sm w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-desert-400)]" size={18} />
            <input 
              type="text" 
              placeholder="البحث باسم الموظف..." 
              className="w-full bg-white border border-[var(--color-desert-200)] rounded-lg py-2 pr-10 pl-4 text-sm focus:outline-none focus:border-[var(--color-gold-500)]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm whitespace-nowrap">
            <thead className="bg-[var(--color-desert-50)]/50 text-[var(--color-desert-600)] border-b border-[var(--color-desert-200)]">
              <tr>
                <th className="py-3 px-6 font-medium">الموظف</th>
                <th className="py-3 px-6 font-medium">نوع الإجازة</th>
                <th className="py-3 px-6 font-medium">من تاريخ</th>
                <th className="py-3 px-6 font-medium">إلى تاريخ</th>
                <th className="py-3 px-6 font-medium">الأيام</th>
                <th className="py-3 px-6 font-medium">السبب</th>
                <th className="py-3 px-6 font-medium">الحالة</th>
                <th className="py-3 px-6 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-desert-100)] text-[var(--color-desert-900)]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[var(--color-desert-500)]">جاري التحميل...</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[var(--color-desert-500)]">لا توجد طلبات إجازات</td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-[var(--color-desert-50)]/50 transition-colors">
                    <td className="py-4 px-6 font-bold">{request.employeeName}</td>
                    <td className="py-4 px-6">{getTypeLabel(request.type)}</td>
                    <td className="py-4 px-6 font-mono">{request.startDate}</td>
                    <td className="py-4 px-6 font-mono">{request.endDate}</td>
                    <td className="py-4 px-6 font-mono font-bold">{request.days}</td>
                    <td className="py-4 px-6">{request.reason}</td>
                    <td className="py-4 px-6">{getStatusBadge(request.status)}</td>
                    <td className="py-4 px-6">
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <button className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-emerald-600">
                            قبول
                          </button>
                          <button className="bg-rose-500 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-rose-600">
                            رفض
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl" dir="rtl">
            <div className="p-6 border-b border-[var(--color-desert-200)] bg-[var(--color-desert-50)] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[var(--color-desert-900)]">طلب إجازة جديد</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--color-desert-500)] hover:text-black">
                <span className="text-2xl">×</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-[var(--color-desert-700)] mb-2">الموظف</label>
                  <select 
                    value={formData.employeeId}
                    onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                    className="w-full bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-gold-500)]"
                    required
                  >
                    <option value="">اختر الموظف</option>
                    <option value="EMP001">أحمد عبدالله</option>
                    <option value="EMP002">محمد علي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-desert-700)] mb-2">نوع الإجازة</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'annual' | 'sick' | 'emergency' | 'unpaid'})}
                    className="w-full bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-gold-500)]"
                  >
                    <option value="annual">إجازة سنوية</option>
                    <option value="sick">إجازة مرضية</option>
                    <option value="emergency">إجازة طارئة</option>
                    <option value="unpaid">إجازة بدون راتب</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-desert-700)] mb-2">من تاريخ</label>
                  <input 
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-gold-500)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-desert-700)] mb-2">إلى تاريخ</label>
                  <input 
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-gold-500)]"
                    required
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-[var(--color-desert-700)] mb-2">السبب</label>
                <textarea 
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-gold-500)]"
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-[var(--color-desert-200)]">
                <button 
                  type="submit" 
                  className="flex-1 bg-[var(--color-desert-900)] hover:bg-black text-white font-bold py-3 rounded-xl"
                >
                  إرسال الطلب
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="bg-white border border-[var(--color-desert-200)] hover:bg-[var(--color-desert-50)] text-[var(--color-desert-700)] font-bold py-3 px-8 rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
