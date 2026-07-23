/* eslint-disable */
// @ts-nocheck
export const dynamic = 'force-dynamic';
import React from 'react';
import { Wallet, FileWarning, ShieldAlert, Scale, ArrowUpRight, ArrowDownRight, Clock, FileText } from 'lucide-react';
import { getDashboardStats } from './actions';

export default async function DashboardPage() {
  const statsRes = await getDashboardStats();
  const data = statsRes.data || { cashBalance: 0, totalRevenue: 0, totalVat: 0, totalExpenses: 0, alertsCount: 0 };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount);
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-desert-900)] mb-2">مرحباً بعودتك 👋</h1>
        <p className="text-[var(--color-desert-600)]">إليك نظرة عامة على الوضع المالي لشركتك اليوم.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { title: "الرصيد النقدي (تقريبي)", amount: formatMoney(data.cashBalance), trend: "صافي التدفق", isUp: data.cashBalance >= 0, icon: Wallet },
          { title: "إجمالي الإيرادات", amount: formatMoney(data.totalRevenue), trend: "المبيعات المفوترة", isUp: true, icon: FileText },
          { title: "إجمالي المصروفات", amount: formatMoney(data.totalExpenses), trend: "التكاليف المسجلة", isUp: false, icon: Clock },
          { title: "ضريبة القيمة المضافة", amount: formatMoney(data.totalVat), trend: "مستحقة لـ ZATCA", isUp: false, icon: Scale },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-desert-200)]`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-[var(--color-desert-50)] text-[var(--color-desert-600)]`}>
                  <Icon size={24} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold text-[var(--color-desert-500)]`}>
                  <span>{stat.trend}</span>
                </div>
              </div>
              <h3 className="text-[var(--color-desert-500)] text-sm font-medium mb-1">{stat.title}</h3>
              <p className={`text-2xl font-bold text-[var(--color-desert-900)]`}>{stat.amount}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[var(--color-desert-200)] shadow-sm p-6 h-96 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[var(--color-desert-900)]">التدفق النقدي (آخر 30 يوماً)</h2>
            <select className="bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] rounded-lg px-3 py-1.5 text-sm text-[var(--color-desert-700)] outline-none">
              <option>هذا الشهر</option>
              <option>الشهر الماضي</option>
              <option>هذا العام</option>
            </select>
          </div>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[var(--color-desert-200)] rounded-xl bg-[var(--color-desert-50)/50]">
            <p className="text-[var(--color-desert-500)]">مساحة الرسم البياني (سيتم تفعيله لاحقاً)</p>
          </div>
        </div>

        {/* AI Inbox Mini */}
        <div className="bg-white rounded-2xl border border-[var(--color-desert-200)] shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[var(--color-desert-900)] flex items-center gap-2">
              <ShieldAlert className="text-[var(--color-gold-500)]" size={20} />
              صندوق الوارد الذكي
            </h2>
            {data.alertsCount > 0 && (
              <span className="bg-[var(--color-gold-100)] text-[var(--color-gold-700)] text-xs font-bold px-2 py-1 rounded-md">{data.alertsCount} جديد</span>
            )}
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="p-4 rounded-xl bg-[var(--color-desert-50)] border border-[var(--color-desert-200)] hover:border-[var(--color-gold-500)] cursor-pointer transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <FileWarning size={16} className="text-rose-500" />
                <h4 className="font-bold text-sm text-[var(--color-desert-900)]">تغيير في رقم الحساب (IBAN)</h4>
              </div>
              <p className="text-xs text-[var(--color-desert-600)]">المورد &quot;مجموعة التقنية&quot; قام بتغيير تفاصيل البنك في الفاتورة الأخيرة.</p>
            </div>
          </div>
          
          <button 
            className="w-full mt-4 py-3 rounded-xl border border-[var(--color-desert-200)] text-[var(--color-desert-700)] font-bold text-sm hover:bg-[var(--color-desert-50)] transition-colors"
          >
            عرض كل التنبيهات ({data.alertsCount})
          </button>
        </div>
      </div>
    </>
  );
}

