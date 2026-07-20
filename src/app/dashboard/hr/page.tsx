import React from 'react';
import { Users, FileWarning, Search, UserPlus, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function HrPage() {
  const mockEmployees = [
    { id: 'EMP-001', name: 'أحمد محمد', nationality: 'مصري', role: 'محاسب', iqamaExpiry: '2026-08-15', status: 'ACTIVE' },
    { id: 'EMP-002', name: 'John Smith', nationality: 'بريطاني', role: 'مدير مشروع', iqamaExpiry: '2026-07-22', status: 'EXPIRING_SOON' }, // Expiring in 4 days
    { id: 'EMP-003', name: 'فاطمة علي', nationality: 'سعودية', role: 'مسؤول موارد بشرية', iqamaExpiry: 'N/A', status: 'ACTIVE' }, // Citizens don't have Iqama expiry
    { id: 'EMP-004', name: 'Ravi Kumar', nationality: 'هندي', role: 'فني مستودع', iqamaExpiry: '2026-07-10', status: 'EXPIRED' }, // Expired
  ];

  const expiringCount = mockEmployees.filter(e => e.status === 'EXPIRING_SOON' || e.status === 'EXPIRED').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-desert-900)] mb-2 flex items-center gap-3">
            <Users className="text-[var(--color-gold-600)]" size={32} />
            الموارد البشرية (HR)
          </h1>
          <p className="text-[var(--color-desert-600)]">إدارة الموظفين وتتبع الإقامات.</p>
        </div>
        
        <div className="flex gap-3">
          <Link href="/dashboard/hr/payroll" className="bg-[var(--color-gold-50)] border border-[var(--color-gold-200)] text-[var(--color-gold-700)] px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[var(--color-gold-100)] transition-colors shadow-sm">
            <CreditCard size={18} />
            الرواتب (Payroll)
          </Link>
          <button className="bg-[var(--color-desert-900)] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-colors shadow-sm">
            <UserPlus size={18} />
            إضافة موظف
          </button>
        </div>
      </div>

      {expiringCount > 0 && (
        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-6 shadow-sm flex items-start gap-4">
          <div className="bg-rose-100 p-3 rounded-full text-rose-600 shrink-0">
            <FileWarning size={24} />
          </div>
          <div>
            <h3 className="text-rose-800 font-bold text-lg mb-1">تحذير الإقامات (Iqama Expiry Alert)</h3>
            <p className="text-rose-600 text-sm">
              يوجد <span className="font-bold text-lg">{expiringCount}</span> إقامات منتهية أو تقترب من الانتهاء. 
              عدم التجديد يعرض الشركة لغرامات مالية وإيقاف الخدمات الحكومية.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border border-[var(--color-desert-200)] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--color-desert-200)] flex justify-between items-center bg-[var(--color-desert-50)]">
          <div className="relative max-w-sm w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-desert-400)]" size={18} />
            <input 
              type="text" 
              placeholder="البحث باسم الموظف أو رقم الإقامة..." 
              className="w-full bg-white border border-[var(--color-desert-200)] rounded-lg py-2 pr-10 pl-4 text-sm focus:outline-none focus:border-[var(--color-gold-500)]"
            />
          </div>
        </div>
        
        <table className="w-full text-right text-sm">
          <thead className="bg-[var(--color-desert-50)]/50 text-[var(--color-desert-600)] border-b border-[var(--color-desert-200)]">
            <tr>
              <th className="py-3 px-6 font-medium">الرقم</th>
              <th className="py-3 px-6 font-medium">الاسم</th>
              <th className="py-3 px-6 font-medium">الجنسية</th>
              <th className="py-3 px-6 font-medium">المنصب</th>
              <th className="py-3 px-6 font-medium">صلاحية الإقامة (Iqama)</th>
              <th className="py-3 px-6 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-desert-100)] text-[var(--color-desert-900)]">
            {mockEmployees.map((emp) => (
              <tr key={emp.id} className="hover:bg-[var(--color-desert-50)]/50 transition-colors">
                <td className="py-4 px-6 font-mono text-[var(--color-desert-500)]">{emp.id}</td>
                <td className="py-4 px-6 font-bold">{emp.name}</td>
                <td className="py-4 px-6">{emp.nationality}</td>
                <td className="py-4 px-6">{emp.role}</td>
                <td className="py-4 px-6" dir="ltr">
                  <span className={`font-mono font-bold ${
                    emp.status === 'EXPIRED' ? 'text-rose-600' :
                    emp.status === 'EXPIRING_SOON' ? 'text-amber-600' :
                    'text-[var(--color-desert-700)]'
                  }`}>
                    {emp.iqamaExpiry}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {emp.status === 'EXPIRED' && (
                    <span className="bg-rose-100 text-rose-800 px-2 py-1 rounded text-xs font-bold border border-rose-200 flex items-center gap-1 w-max">
                      <FileWarning size={12} /> منتهية
                    </span>
                  )}
                  {emp.status === 'EXPIRING_SOON' && (
                    <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold border border-amber-200">
                      قريباً
                    </span>
                  )}
                  {emp.status === 'ACTIVE' && (
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold border border-emerald-200">
                      سارية
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
