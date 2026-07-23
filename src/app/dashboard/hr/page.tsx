'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, UserPlus, CreditCard, X } from 'lucide-react';
import Link from 'next/link';
import type { InferSelectModel } from 'drizzle-orm';
import type { employees as employeesTable } from '@/lib/db/schema/hr';
import { getEmployees, createEmployee } from './hr-actions';

type Employee = InferSelectModel<typeof employeesTable>;

export default function HrPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nationality: '',
    nationalIdNumber: '',
    basicSalary: '',
    housingAllowance: '0',
    transportAllowance: '0'
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    const res = await getEmployees();
    if (res.success && res.data) {
      setEmployees(res.data);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const res = await createEmployee({
      firstName: formData.firstName,
      lastName: formData.lastName,
      nationality: formData.nationality,
      nationalIdNumber: formData.nationalIdNumber,
      basicSalary: parseFloat(formData.basicSalary),
      housingAllowance: parseFloat(formData.housingAllowance),
      transportAllowance: parseFloat(formData.transportAllowance)
    });

    if (res.success) {
      setShowModal(false);
      setFormData({
        firstName: '', lastName: '', nationality: '', nationalIdNumber: '',
        basicSalary: '', housingAllowance: '0', transportAllowance: '0'
      });
      fetchEmployees();
    } else {
      alert('فشل في إضافة الموظف: ' + res.error);
    }
    setIsSubmitting(false);
  };

  const formatMoney = (val: string | number) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(Number(val));
  };

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
          <button 
            onClick={() => setShowModal(true)}
            className="bg-[var(--color-desert-900)] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-colors shadow-sm"
          >
            <UserPlus size={18} />
            إضافة موظف
          </button>
        </div>
      </div>

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
        
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm whitespace-nowrap">
            <thead className="bg-[var(--color-desert-50)]/50 text-[var(--color-desert-600)] border-b border-[var(--color-desert-200)]">
              <tr>
                <th className="py-3 px-6 font-medium">الرقم</th>
                <th className="py-3 px-6 font-medium">الاسم</th>
                <th className="py-3 px-6 font-medium">الجنسية</th>
                <th className="py-3 px-6 font-medium">رقم الإقامة/الهوية</th>
                <th className="py-3 px-6 font-medium">الراتب الأساسي</th>
                <th className="py-3 px-6 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-desert-100)] text-[var(--color-desert-900)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--color-desert-500)]">جاري التحميل...</td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--color-desert-500)]">لا يوجد موظفين مسجلين. أضف موظفاً جديداً.</td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-[var(--color-desert-50)]/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-[var(--color-desert-500)]">{emp.employeeId}</td>
                    <td className="py-4 px-6 font-bold">{emp.firstName} {emp.lastName}</td>
                    <td className="py-4 px-6">{emp.nationality}</td>
                    <td className="py-4 px-6 font-mono">{emp.nationalIdNumber}</td>
                    <td className="py-4 px-6 font-mono font-bold text-[var(--color-desert-900)]">
                      {formatMoney(emp.basicSalary)}
                    </td>
                    <td className="py-4 px-6">
                      {emp.status === 'ACTIVE' && (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold border border-emerald-200">
                          نشط (سارية)
                        </span>
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
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="p-6 border-b border-[var(--color-desert-200)] bg-[var(--color-desert-50)] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[var(--color-desert-900)]">إضافة موظف جديد</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--color-desert-500)] hover:text-black">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-[var(--color-desert-700)] mb-2">الاسم الأول</label>
                  <input 
                    type="text" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-gold-500)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-desert-700)] mb-2">اسم العائلة</label>
                  <input 
                    type="text" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-gold-500)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-desert-700)] mb-2">الجنسية</label>
                  <input 
                    type="text" 
                    value={formData.nationality}
                    onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                    className="w-full bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-gold-500)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-desert-700)] mb-2">رقم الهوية / الإقامة</label>
                  <input 
                    type="text" 
                    value={formData.nationalIdNumber}
                    onChange={(e) => setFormData({...formData, nationalIdNumber: e.target.value})}
                    className="w-full bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-gold-500)]"
                    required
                  />
                </div>
              </div>

              <h3 className="font-bold text-[var(--color-desert-900)] mb-4 border-b border-[var(--color-desert-200)] pb-2">بيانات الراتب (بالريال السعودي)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-[var(--color-desert-700)] mb-2">الراتب الأساسي</label>
                  <input 
                    type="number" 
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({...formData, basicSalary: e.target.value})}
                    className="w-full bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-gold-500)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-desert-700)] mb-2">بدل السكن</label>
                  <input 
                    type="number" 
                    value={formData.housingAllowance}
                    onChange={(e) => setFormData({...formData, housingAllowance: e.target.value})}
                    className="w-full bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-gold-500)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-desert-700)] mb-2">بدل النقل</label>
                  <input 
                    type="number" 
                    value={formData.transportAllowance}
                    onChange={(e) => setFormData({...formData, transportAllowance: e.target.value})}
                    className="w-full bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-gold-500)]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--color-desert-200)]">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-[var(--color-desert-900)] hover:bg-black text-white font-bold py-3 rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ بيانات الموظف'}
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
