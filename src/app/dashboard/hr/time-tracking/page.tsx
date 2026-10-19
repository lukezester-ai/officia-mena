'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Plus, Search, CheckCircle2, AlertCircle } from 'lucide-react';

type TimeEntry = {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  hours: number;
  status: 'present' | 'late' | 'absent' | 'half-day';
  notes: string;
};

export default function TimeTrackingPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'present' | 'late' | 'absent'>('all');

  useEffect(() => {
    // Mock data - replace with API call
    setEntries([
      {
        id: '1',
        employeeId: 'EMP001',
        employeeName: 'أحمد عبدالله',
        date: '2024-01-15',
        checkIn: '08:00',
        checkOut: '17:00',
        hours: 9,
        status: 'present',
        notes: ''
      },
      {
        id: '2',
        employeeId: 'EMP002',
        employeeName: 'محمد علي',
        date: '2024-01-15',
        checkIn: '08:45',
        checkOut: '17:00',
        hours: 8.25,
        status: 'late',
        notes: 'تأخر 45 دقيقة'
      },
      {
        id: '3',
        employeeId: 'EMP003',
        employeeName: 'خالد محمد',
        date: '2024-01-15',
        checkIn: null,
        checkOut: null,
        hours: 0,
        status: 'absent',
        notes: 'إجازة مرضية'
      }
    ]);
    setLoading(false);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-xs font-bold text-emerald-300">
            <CheckCircle2 size={12} />
            حاضر
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-xs font-bold text-amber-300">
            <AlertCircle size={12} />
            متأخر
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/20 bg-rose-400/10 px-2 py-1 text-xs font-bold text-rose-300">
            <AlertCircle size={12} />
            غائب
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-400/20 bg-blue-400/10 px-2 py-1 text-xs font-bold text-blue-300">
            نصف يوم
          </span>
        );
    }
  };

  const filteredEntries = filter === 'all' 
    ? entries 
    : entries.filter(entry => entry.status === filter);

  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  const presentCount = entries.filter(e => e.status === 'present').length;
  const lateCount = entries.filter(e => e.status === 'late').length;
  const absentCount = entries.filter(e => e.status === 'absent').length;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-desert-900)] mb-2 flex items-center gap-3">
            <Clock className="text-[var(--color-gold-600)]" size={32} />
            تتبع الوقت
          </h1>
          <p className="text-[var(--color-desert-600)]">تتبع الحضور وساعات العمل</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[var(--color-desert-900)] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-colors shadow-sm"
        >
          <Plus size={18} />
          تسجيل يدوي
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white border border-[var(--color-desert-200)] rounded-2xl p-6 shadow-sm">
          <div className="text-sm font-bold text-[var(--color-desert-600)] mb-2">إجمالي الساعات</div>
          <div className="text-3xl font-black text-[var(--color-desert-900)]">{totalHours.toFixed(1)}</div>
          <div className="text-sm text-[var(--color-desert-500)] mt-2">ساعة</div>
        </div>
        <div className="bg-white border border-[var(--color-desert-200)] rounded-2xl p-6 shadow-sm">
          <div className="text-sm font-bold text-[var(--color-desert-600)] mb-2">الحضور</div>
          <div className="text-3xl font-black text-emerald-600">{presentCount}</div>
          <div className="text-sm text-[var(--color-desert-500)] mt-2">موظف حاضر</div>
        </div>
        <div className="bg-white border border-[var(--color-desert-200)] rounded-2xl p-6 shadow-sm">
          <div className="text-sm font-bold text-[var(--color-desert-600)] mb-2">التأخير</div>
          <div className="text-3xl font-black text-amber-600">{lateCount}</div>
          <div className="text-sm text-[var(--color-desert-500)] mt-2">موظف متأخر</div>
        </div>
        <div className="bg-white border border-[var(--color-desert-200)] rounded-2xl p-6 shadow-sm">
          <div className="text-sm font-bold text-[var(--color-desert-600)] mb-2">الغياب</div>
          <div className="text-3xl font-black text-rose-600">{absentCount}</div>
          <div className="text-sm text-[var(--color-desert-500)] mt-2">موظف غائب</div>
        </div>
      </div>

      <div className="bg-white border border-[var(--color-desert-200)] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--color-desert-200)] flex justify-between items-center bg-[var(--color-desert-50)]">
          <div className="flex gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-desert-400)]" size={18} />
              <input 
                type="text" 
                placeholder="البحث باسم الموظف..." 
                className="w-full bg-white border border-[var(--color-desert-200)] rounded-lg py-2 pr-10 pl-4 text-sm focus:outline-none focus:border-[var(--color-gold-500)]"
              />
            </div>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'present' | 'late' | 'absent')}
              className="bg-white border border-[var(--color-desert-200)] rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-[var(--color-gold-500)]"
            >
              <option value="all">الكل</option>
              <option value="present">حاضر</option>
              <option value="late">متأخر</option>
              <option value="absent">غائب</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm whitespace-nowrap">
            <thead className="bg-[var(--color-desert-50)]/50 text-[var(--color-desert-600)] border-b border-[var(--color-desert-200)]">
              <tr>
                <th className="py-3 px-6 font-medium">الموظف</th>
                <th className="py-3 px-6 font-medium">التاريخ</th>
                <th className="py-3 px-6 font-medium">وقت الدخول</th>
                <th className="py-3 px-6 font-medium">وقت الخروج</th>
                <th className="py-3 px-6 font-medium">الساعات</th>
                <th className="py-3 px-6 font-medium">الحالة</th>
                <th className="py-3 px-6 font-medium">ملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-desert-100)] text-[var(--color-desert-900)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[var(--color-desert-500)]">جاري التحميل...</td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[var(--color-desert-500)]">لا توجد سجلات</td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-[var(--color-desert-50)]/50 transition-colors">
                    <td className="py-4 px-6 font-bold">{entry.employeeName}</td>
                    <td className="py-4 px-6 font-mono">{entry.date}</td>
                    <td className="py-4 px-6 font-mono">{entry.checkIn || '-'}</td>
                    <td className="py-4 px-6 font-mono">{entry.checkOut || '-'}</td>
                    <td className="py-4 px-6 font-mono font-bold">{entry.hours > 0 ? entry.hours.toFixed(1) : '-'}</td>
                    <td className="py-4 px-6">{getStatusBadge(entry.status)}</td>
                    <td className="py-4 px-6 text-sm text-[var(--color-desert-600)]">{entry.notes || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl" dir="rtl">
            <div className="p-6 border-b border-[var(--color-desert-200)] bg-[var(--color-desert-50)] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[var(--color-desert-900)]">تسجيل يدوي</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--color-desert-500)] hover:text-black">
                <span className="text-2xl">×</span>
              </button>
            </div>
            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-[var(--color-desert-700)] mb-2">الموظف</label>
                <select className="w-full bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-gold-500)]">
                  <option value="">اختر الموظف</option>
                  <option value="EMP001">أحمد عبدالله</option>
                  <option value="EMP002">محمد علي</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--color-desert-700)] mb-2">التاريخ</label>
                <input 
                  type="date"
                  className="w-full bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-gold-500)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[var(--color-desert-700)] mb-2">وقت الدخول</label>
                  <input 
                    type="time"
                    className="w-full bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-gold-500)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-desert-700)] mb-2">وقت الخروج</label>
                  <input 
                    type="time"
                    className="w-full bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-gold-500)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--color-desert-700)] mb-2">الحالة</label>
                <select className="w-full bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-gold-500)]">
                  <option value="present">حاضر</option>
                  <option value="late">متأخر</option>
                  <option value="absent">غائب</option>
                  <option value="half-day">نصف يوم</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--color-desert-700)] mb-2">ملاحظات</label>
                <textarea 
                  className="w-full bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-gold-500)]"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-[var(--color-desert-200)]">
                <button 
                  type="submit"
                  className="flex-1 bg-[var(--color-desert-900)] hover:bg-black text-white font-bold py-3 rounded-xl"
                >
                  تسجيل
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
