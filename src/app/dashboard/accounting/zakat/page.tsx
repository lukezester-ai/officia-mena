import { db } from '@/lib/db/db';
import { requireTenant } from '@/lib/auth/get-tenant';
import { accounts, journalLines } from '@/lib/db/schema/accounting';
import { eq, and, sql } from 'drizzle-orm';
import { Calculator, AlertTriangle, ShieldCheck, Download, History, Coins } from 'lucide-react';
import Link from 'next/link';

export default async function ZakatReportPage() {
  const tenant = await requireTenant();

  // Get all Zakatable accounts and sum their balances
  const accountsData = await db.select({
    id: accounts.id,
    name: accounts.name,
    code: accounts.code,
    type: accounts.type,
    normalBalance: accounts.normalBalance,
    totalDebit: sql<number>`COALESCE(SUM(${journalLines.debit}), 0)`,
    totalCredit: sql<number>`COALESCE(SUM(${journalLines.credit}), 0)`,
  })
  .from(accounts)
  .leftJoin(journalLines, eq(accounts.id, journalLines.accountId))
  .where(and(eq(accounts.tenantId, tenant.id), eq(accounts.isZakatable, true)))
  .groupBy(accounts.id, accounts.name, accounts.code, accounts.type, accounts.normalBalance);

  let totalZakatableWealth = 0;
  
  const zakatableAccounts = accountsData.map(acc => {
    let balance = 0;
    if (acc.normalBalance === 'debit') {
      balance = Number(acc.totalDebit) - Number(acc.totalCredit);
    } else {
      balance = Number(acc.totalCredit) - Number(acc.totalDebit);
    }
    
    // Add to total wealth if asset, subtract if liability
    if (acc.type === 'asset' || acc.type === 'expense') {
      totalZakatableWealth += balance;
    } else if (acc.type === 'liability' || acc.type === 'equity' || acc.type === 'revenue') {
      totalZakatableWealth -= balance;
    }

    return {
      ...acc,
      balance
    };
  });

  const zakatDue = Math.max(0, totalZakatableWealth * 0.025);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Coins className="w-8 h-8 text-[var(--color-gold-500)]" />
            حساب الزكاة
          </h1>
          <p className="text-zinc-400 mt-2">تقرير تفصيلي لحساب زكاة عروض التجارة والسيولة النقدية</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl transition-all border border-zinc-800">
            <History className="w-4 h-4" />
            سجل المدفوعات
          </button>
          <button className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl transition-all border border-zinc-800">
            <Download className="w-4 h-4" />
            تصدير PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Calculation Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-gold-500)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-zinc-800/50 pb-8">
              <div>
                <p className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-2">الوعاء الزكوي (Zakatable Wealth)</p>
                <div className="text-4xl font-black text-white">SAR {totalZakatableWealth.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2 justify-end">
                  <ShieldCheck className="w-4 h-4" />
                  الزكاة المستحقة (2.5%)
                </p>
                <div className="text-4xl font-black text-[var(--color-gold-500)]">SAR {zakatDue.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
              </div>
            </div>

            <div className="relative z-10 space-y-4">
              <h3 className="text-lg font-bold text-white mb-4">تفاصيل الحسابات الخاضعة للزكاة</h3>
              
              {zakatableAccounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-zinc-500 bg-zinc-950/30 rounded-2xl border border-zinc-800/50 border-dashed">
                  <AlertTriangle className="w-8 h-8 mb-3 opacity-50" />
                  <p>لا توجد حسابات محددة كخاضعة للزكاة.</p>
                  <Link href="/dashboard/accounting/chart" className="text-[var(--color-gold-500)] mt-2 hover:underline text-sm">
                    إدارة شجرة الحسابات لتحديد الحسابات الزكوية
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-right">
                    <thead>
                      <tr className="text-zinc-500 border-b border-zinc-800/50">
                        <th className="py-3 px-4 font-medium">رمز الحساب</th>
                        <th className="py-3 px-4 font-medium">اسم الحساب</th>
                        <th className="py-3 px-4 font-medium">النوع</th>
                        <th className="py-3 px-4 font-medium">الرصيد</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {zakatableAccounts.map(acc => (
                        <tr key={acc.id} className="text-zinc-300">
                          <td className="py-3 px-4 font-mono">{acc.code}</td>
                          <td className="py-3 px-4">{acc.name}</td>
                          <td className="py-3 px-4 text-zinc-500">
                            {acc.type === 'asset' ? 'أصل' : 
                             acc.type === 'liability' ? 'خصوم' : 
                             acc.type}
                          </td>
                          <td className="py-3 px-4 font-medium" dir="ltr">
                            {acc.balance >= 0 ? '+' : ''}{acc.balance.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[var(--color-gold-700)]/10 to-[var(--color-gold-500)]/5 border border-[var(--color-gold-500)]/20 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[var(--color-gold-500)]" />
              قيد استحقاق الزكاة
            </h3>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              قم بإثبات الزكاة المستحقة في الدفاتر المحاسبية لترحيلها إلى مصلحة الزكاة والدخل (ZATCA).
            </p>

            <button disabled={zakatDue <= 0} className="w-full py-4 rounded-xl gold-gradient text-[#1A120B] font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              تسجيل قيد الزكاة تلقائياً
            </button>

            <div className="mt-6 p-4 bg-black/40 rounded-xl border border-zinc-800 text-xs text-zinc-500">
              <div className="flex justify-between mb-2">
                <span>من حـ/ مصروف الزكاة</span>
                <span dir="ltr">{zakatDue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>إلى حـ/ الزكاة المستحقة (ZATCA)</span>
                <span dir="ltr">{zakatDue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              التوافق مع الشريعة
            </h3>
            <p className="text-sm text-emerald-400/80 leading-relaxed">
              يتم استبعاد الأصول الثابتة تلقائياً من الوعاء الزكوي. يحسب النظام 2.5% للسنة الهجرية (حَوَلان الحَول).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
