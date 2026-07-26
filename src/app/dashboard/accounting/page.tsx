import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, BookOpen, Calculator, CheckCircle2, Clock3, Download, FileText, Landmark, PlusCircle, RotateCcw, Scale, ShieldCheck, TrendingUp, XCircle } from 'lucide-react';
import { getAccountingDashboard, reverseAccountingEntry, seedChartOfAccounts, updateProductCostPrice } from './actions';
import { AccountingRepairPanel } from './accounting-repair-panel';
import { ManualJournalEntryForm } from './manual-journal-entry-form';

const TYPE_COLORS: Record<string, string> = {
  asset: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20',
  liability: 'text-amber-300 bg-amber-400/10 border-amber-400/20',
  equity: 'text-sky-300 bg-sky-400/10 border-sky-400/20',
  revenue: 'text-[var(--color-gold-500)] bg-[var(--color-gold-500)]/10 border-[var(--color-gold-500)]/20',
  expense: 'text-rose-300 bg-rose-400/10 border-rose-400/20',
};

const AGING_BUCKET_LABELS: Record<string, string> = {
  current: '0-30',
  days31To60: '31-60',
  days61To90: '61-90',
  daysOver90: '90+',
};

export default async function AccountingPage() {
  const result = await getAccountingDashboard();
  const data = result.success && result.data ? result.data : { accounts: [], journalEntries: [] };
  const accounts = data.accounts;
  const journalEntries = data.journalEntries;
  const recentJournalEntries = 'recentJournalEntries' in data ? data.recentJournalEntries : journalEntries.map((entry) => ({ ...entry, lines: [] }));
  const accountOptions = accounts.map((account) => ({
    id: account.id,
    code: account.code,
    name: account.name,
    type: account.type,
  }));
  const trialBalance = 'trialBalance' in data ? data.trialBalance : [];
  const totals = 'totals' in data ? data.totals : { debit: '0.00', credit: '0.00', isBalanced: true };
  const statements = 'financialStatements' in data
    ? data.financialStatements
    : {
        profitAndLoss: { revenue: '0.00', expenses: '0.00', netIncome: '0.00' },
        balanceSheet: {
          assets: '0.00',
          liabilities: '0.00',
          equity: '0.00',
          retainedEarnings: '0.00',
          liabilitiesAndEquity: '0.00',
          isBalanced: true,
        },
      };
  const aging = 'aging' in data
    ? data.aging
    : {
        receivables: {
          total: '0.00',
          buckets: { current: '0.00', days31To60: '0.00', days61To90: '0.00', daysOver90: '0.00' },
          items: [],
        },
        payables: {
          total: '0.00',
          buckets: { current: '0.00', days31To60: '0.00', days61To90: '0.00', daysOver90: '0.00' },
          items: [],
        },
      };
  const vatControl = 'vatControl' in data
    ? data.vatControl
    : { outputVat: '0.00', inputVat: '0.00', netVat: '0.00', position: 'payable' };
  const cashFlow = 'cashFlow' in data
    ? data.cashFlow
    : { inflow: '0.00', outflow: '0.00', net: '0.00', endingCash: '0.00', categories: [] };
  const controlChecks = 'controlChecks' in data
    ? data.controlChecks
    : {
        postingGaps: { issuedInvoices: 0, posSales: 0, approvedExpenses: 0, payrollAccruals: 0, total: 0 },
        bankReconciliation: { pendingCount: 0, pendingIn: '0.00', pendingOut: '0.00' },
        inventoryCosting: { missingCostCount: 0, items: [] },
        integrity: { unbalancedEntryCount: 0 },
      };
  const hasControlWarnings = (
    controlChecks.postingGaps.total > 0 ||
    controlChecks.bankReconciliation.pendingCount > 0 ||
    controlChecks.inventoryCosting.missingCostCount > 0 ||
    controlChecks.integrity.unbalancedEntryCount > 0
  );

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black text-white">
            <BookOpen className="text-primary" size={32} />
            المحاسبة الأساسية
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            دليل الحسابات، قيود اليومية، وأساس القيد المزدوج الذي تستند إليه الفواتير والمصروفات
            ونقاط البيع والمدفوعات والتسوية البنكية.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/api/accounting/trial-balance"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white transition hover:border-primary/40"
          >
            <Download size={18} />
            ميزان المراجعة CSV
          </a>
          <a
            href="/api/accounting/journal-lines"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white transition hover:border-primary/40"
          >
            <Download size={18} />
            دفتر اليومية CSV
          </a>
          <form action={seedChartOfAccounts}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-black text-background shadow-[0_14px_34px_rgba(245,197,24,0.22)] transition hover:bg-amber-300"
            >
              <PlusCircle size={18} />
              تهيئة الحسابات الافتراضية
            </button>
          </form>
        </div>
      </div>

      {!result.success && (
        <div className="rounded-lg border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">
          {result.error}
        </div>
      )}

      <AccountingRepairPanel />

      <section className="rounded-xl border border-white/10 bg-card/70 shadow-xl">
        <div className="flex flex-col gap-2 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            {hasControlWarnings ? <AlertTriangle className="text-amber-300" size={18} /> : <ShieldCheck className="text-emerald-300" size={18} />}
            <h2 className="text-lg font-black text-white">الرقابة المحاسبية</h2>
          </div>
          <span className={`w-max rounded-full border px-3 py-1 text-xs font-black ${hasControlWarnings ? 'border-amber-400/20 bg-amber-400/10 text-amber-300' : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'}`}>
            {hasControlWarnings ? 'بحاجة للمراجعة' : 'سليم'}
          </span>
        </div>

        <div className="grid gap-3 p-5 md:grid-cols-4">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">فجوات الترحيل</div>
            <div className={`mt-3 font-mono text-2xl font-black ${controlChecks.postingGaps.total > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>{controlChecks.postingGaps.total}</div>
            <div className="mt-2 text-xs leading-5 text-muted-foreground">
              فواتير {controlChecks.postingGaps.issuedInvoices} · نقاط بيع {controlChecks.postingGaps.posSales} · مصروفات {controlChecks.postingGaps.approvedExpenses} · رواتب {controlChecks.postingGaps.payrollAccruals}
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">معاملات بنكية غير مسوية</div>
            <div className={`mt-3 font-mono text-2xl font-black ${controlChecks.bankReconciliation.pendingCount > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>{controlChecks.bankReconciliation.pendingCount}</div>
            <div className="mt-2 text-xs leading-5 text-muted-foreground">
              وارد {controlChecks.bankReconciliation.pendingIn} · صادر {controlChecks.bankReconciliation.pendingOut}
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">سعر التكلفة مفقود</div>
            <div className={`mt-3 font-mono text-2xl font-black ${controlChecks.inventoryCosting.missingCostCount > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>{controlChecks.inventoryCosting.missingCostCount}</div>
            <div className="mt-2 text-xs leading-5 text-muted-foreground">يؤثر على دقة تكلفة البضاعة المباعة</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">قيود غير متوازنة</div>
            <div className={`mt-3 font-mono text-2xl font-black ${controlChecks.integrity.unbalancedEntryCount > 0 ? 'text-rose-300' : 'text-emerald-300'}`}>{controlChecks.integrity.unbalancedEntryCount}</div>
            <div className="mt-2 text-xs leading-5 text-muted-foreground">يجب أن تكون صفر دائماً</div>
          </div>
        </div>

        {controlChecks.inventoryCosting.items.length > 0 && (
          <div className="px-5 pb-5">
            <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 p-3">
              <div className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-amber-300">منتجات تحتاج سعر تكلفة</div>
              <div className="grid gap-2 md:grid-cols-2">
                {controlChecks.inventoryCosting.items.map((item) => (
                  <form
                    key={item.id}
                    action={updateProductCostPrice}
                    className="grid gap-2 rounded-lg border border-white/10 bg-black/10 px-3 py-2 text-xs md:grid-cols-[1fr_120px_auto] md:items-center"
                  >
                    <input type="hidden" name="productId" value={item.id} />
                    <span className="font-bold text-white">{item.sku} · {item.name} · كمية {item.quantity}</span>
                    <input
                      name="costPrice"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="التكلفة"
                      className="rounded-md border border-white/10 bg-black/30 px-2 py-1 font-mono text-white outline-none focus:border-primary"
                    />
                    <button
                      type="submit"
                      className="rounded-md bg-primary px-3 py-1 font-black text-background transition hover:bg-amber-300"
                    >
                      حفظ التكلفة
                    </button>
                  </form>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">الحسابات</div>
          <div className="mt-3 text-3xl font-black text-white">{accounts.length}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">قيود اليومية</div>
          <div className="mt-3 text-3xl font-black text-white">{journalEntries.length}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            <Scale size={16} />
            ميزان المراجعة
          </div>
          <div className={`mt-3 flex items-center gap-2 text-xl font-black ${totals.isBalanced ? 'text-emerald-300' : 'text-rose-300'}`}>
            {totals.isBalanced ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
            {totals.isBalanced ? 'متوازن' : 'غير متوازن'}
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-white/10 bg-card/70 shadow-xl">
        <div className="grid gap-0 md:grid-cols-2">
          <div className="border-b border-white/10 p-5 md:border-b-0 md:border-l">
            <div className="mb-5 flex items-center gap-2">
              <TrendingUp className="text-primary" size={18} />
              <h2 className="text-lg font-black text-white">الأرباح والخسائر</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">الإيرادات</span>
                <span className="font-mono font-bold text-emerald-300">{statements.profitAndLoss.revenue}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">المصروفات</span>
                <span className="font-mono font-bold text-rose-300">{statements.profitAndLoss.expenses}</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-3">
                <span className="font-black text-white">صافي الدخل</span>
                <span className="font-mono text-lg font-black text-primary">{statements.profitAndLoss.netIncome}</span>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Landmark className="text-primary" size={18} />
                <h2 className="text-lg font-black text-white">الميزانية العمومية</h2>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-bold ${statements.balanceSheet.isBalanced ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300' : 'border-rose-400/20 bg-rose-400/10 text-rose-300'}`}>
                {statements.balanceSheet.isBalanced ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {statements.balanceSheet.isBalanced ? 'متوازنة' : 'مراجعة'}
              </span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">الأصول</span>
                <span className="font-mono font-bold text-emerald-300">{statements.balanceSheet.assets}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">الخصوم</span>
                <span className="font-mono font-bold text-amber-300">{statements.balanceSheet.liabilities}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">حقوق الملكية</span>
                <span className="font-mono font-bold text-sky-300">{statements.balanceSheet.equity}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">الأرباح المحتجزة</span>
                <span className="font-mono font-bold text-primary">{statements.balanceSheet.retainedEarnings}</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-3">
                <span className="font-black text-white">الخصوم + حقوق الملكية</span>
                <span className="font-mono text-lg font-black text-primary">{statements.balanceSheet.liabilitiesAndEquity}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-card/70 p-5 shadow-xl">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="text-primary" size={18} />
            <h2 className="text-lg font-black text-white">الرقابة على ضريبة القيمة المضافة</h2>
          </div>
          <span className={`w-max rounded-full border px-3 py-1 text-xs font-black ${vatControl.position === 'payable' ? 'border-amber-400/20 bg-amber-400/10 text-amber-300' : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'}`}>
            {vatControl.position === 'payable' ? 'ضريبة مستحقة' : 'ضريبة قابلة للاسترداد'}
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">ضريبة المخرجات</div>
            <div className="mt-3 font-mono text-2xl font-black text-amber-300">{vatControl.outputVat}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">ضريبة المدخلات</div>
            <div className="mt-3 font-mono text-2xl font-black text-emerald-300">{vatControl.inputVat}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">صافي ضريبة القيمة المضافة</div>
            <div className="mt-3 font-mono text-2xl font-black text-primary">{vatControl.netVat}</div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-card/70 shadow-xl">
        <div className="flex flex-col gap-2 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <ArrowDownToLine className="text-primary" size={18} />
            <h2 className="text-lg font-black text-white">التدفق النقدي</h2>
          </div>
          <div className="font-mono text-xs font-bold text-muted-foreground">
            الرصيد النقدي الختامي {cashFlow.endingCash}
          </div>
        </div>
        <div className="grid gap-3 p-5 md:grid-cols-3">
          <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-300">
              <ArrowDownToLine size={15} />
              التدفق الداخل
            </div>
            <div className="mt-3 font-mono text-2xl font-black text-emerald-300">{cashFlow.inflow}</div>
          </div>
          <div className="rounded-lg border border-rose-400/20 bg-rose-400/10 p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-rose-300">
              <ArrowUpFromLine size={15} />
              التدفق الخارج
            </div>
            <div className="mt-3 font-mono text-2xl font-black text-rose-300">{cashFlow.outflow}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">صافي الحركة النقدية</div>
            <div className="mt-3 font-mono text-2xl font-black text-primary">{cashFlow.net}</div>
          </div>
        </div>
        <div className="px-5 pb-5">
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full text-right text-xs">
              <thead className="bg-white/[0.03] uppercase tracking-[0.12em] text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-bold">الفئة</th>
                  <th className="px-3 py-2 font-bold">وارد</th>
                  <th className="px-3 py-2 font-bold">صادر</th>
                  <th className="px-3 py-2 font-bold">الصافي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {cashFlow.categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">لا توجد حركات نقدية بعد.</td>
                  </tr>
                ) : (
                  cashFlow.categories.map((row) => (
                    <tr key={row.category}>
                      <td className="px-3 py-2 font-bold text-white">{row.category}</td>
                      <td className="px-3 py-2 font-mono text-emerald-300">{row.inflow}</td>
                      <td className="px-3 py-2 font-mono text-rose-300">{row.outflow}</td>
                      <td className="px-3 py-2 font-mono font-black text-primary">{row.net}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <ManualJournalEntryForm accounts={accountOptions} />

      <section className="rounded-xl border border-white/10 bg-card/70 shadow-xl">
        <div className="flex flex-col gap-2 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Clock3 className="text-primary" size={18} />
            <h2 className="text-lg font-black text-white">تقادم الذمم المدينة والدائنة</h2>
          </div>
          <div className="font-mono text-xs font-bold text-muted-foreground">
            ذمم مدينة {aging.receivables.total} / ذمم دائنة {aging.payables.total}
          </div>
        </div>

        <div className="grid gap-0 md:grid-cols-2">
          {[
            { title: 'الذمم المدينة', data: aging.receivables, tone: 'text-emerald-300' },
            { title: 'الذمم الدائنة', data: aging.payables, tone: 'text-amber-300' },
          ].map((section) => (
            <div key={section.title} className="border-b border-white/10 p-5 md:border-b-0 md:border-l md:last:border-l-0">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="font-black text-white">{section.title}</h3>
                <span className={`font-mono text-lg font-black ${section.tone}`}>{section.data.total}</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {Object.entries(section.data.buckets).map(([bucket, amount]) => (
                  <div key={bucket} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-xs font-bold text-muted-foreground">{AGING_BUCKET_LABELS[bucket]}</div>
                    <div className={`mt-2 break-words font-mono text-sm font-black ${section.tone}`}>{amount}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 divide-y divide-white/5 rounded-lg border border-white/10">
                {section.data.items.length === 0 ? (
                  <div className="px-3 py-4 text-center text-xs text-muted-foreground">لا توجد بنود مفتوحة.</div>
                ) : (
                  section.data.items.slice(0, 5).map((item) => (
                    <div key={item.id} className="grid gap-2 px-3 py-3 text-xs md:grid-cols-[1fr_auto] md:items-center">
                      <div>
                        <div className="font-bold text-white">{item.documentNumber}</div>
                        <div className="mt-1 text-muted-foreground">{item.counterparty} · {AGING_BUCKET_LABELS[item.bucket]}</div>
                      </div>
                      <div className={`font-mono font-black ${section.tone}`}>{item.amount}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-card/70 shadow-xl">
        <div className="flex flex-col gap-2 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Scale className="text-primary" size={18} />
            <h2 className="text-lg font-black text-white">ميزان المراجعة</h2>
          </div>
          <div className="font-mono text-xs font-bold text-muted-foreground">
            مدين {totals.debit} / دائن {totals.credit}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-bold">الرمز</th>
                <th className="px-5 py-3 font-bold">الحساب</th>
                <th className="px-5 py-3 font-bold">النوع</th>
                <th className="px-5 py-3 font-bold">مدين</th>
                <th className="px-5 py-3 font-bold">دائن</th>
                <th className="px-5 py-3 font-bold">الرصيد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {trialBalance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                    لا توجد أرصدة بعد. قم بترحيل الفواتير أو نقاط البيع أو المصروفات أو التسويات لتعبئة هذا التقرير.
                  </td>
                </tr>
              ) : (
                trialBalance.map((row) => (
                  <tr key={row.accountId} className="hover:bg-white/[0.03]">
                    <td className="px-5 py-3 font-mono font-bold text-primary">{row.code}</td>
                    <td className="px-5 py-3 font-bold text-white">{row.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{row.type}</td>
                    <td className="px-5 py-3 font-mono text-white">{row.debit}</td>
                    <td className="px-5 py-3 font-mono text-white">{row.credit}</td>
                    <td className="px-5 py-3 font-mono font-black text-primary">{row.balance}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-card/70 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-black text-white">دليل الحسابات</h2>
          <span className="text-xs font-bold text-muted-foreground">محدود بالمنشأة</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-bold">الرمز</th>
                <th className="px-5 py-3 font-bold">الاسم</th>
                <th className="px-5 py-3 font-bold">النوع</th>
                <th className="px-5 py-3 font-bold">الرصيد الطبيعي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">
                    لا توجد حسابات بعد. قم بتهيئة دليل الحسابات الافتراضي لبدء الدفتر.
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-white/[0.03]">
                    <td className="px-5 py-3 font-mono font-bold text-primary">{account.code}</td>
                    <td className="px-5 py-3 font-bold text-white">{account.name}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full border px-2 py-1 text-xs font-bold ${TYPE_COLORS[account.type] || 'border-white/10 bg-white/5 text-white'}`}>
                        {account.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{account.normalBalance}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-card/70 shadow-xl">
        <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
          <FileText className="text-primary" size={18} />
          <h2 className="text-lg font-black text-white">آخر قيود اليومية</h2>
        </div>
        <div className="divide-y divide-white/5">
          {recentJournalEntries.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              لم يتم ترحيل أي قيود بعد.
            </div>
          ) : (
            recentJournalEntries.map((entry) => (
              <div key={entry.id} className="px-5 py-4">
                <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-black text-primary">{entry.entryNumber}</span>
                      {entry.sourceType && (
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-xs font-bold text-muted-foreground">
                          {entry.sourceType}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-white">{entry.memo || 'قيد يومية'}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(entry.entryDate).toLocaleDateString('ar-SA')}
                  </div>
                  <div className="text-left font-mono text-sm font-bold text-white">
                    مدين {entry.totalDebit} / دائن {entry.totalCredit}
                  </div>
                  {entry.sourceType !== 'journal.reversal' ? (
                    <form action={reverseAccountingEntry}>
                      <input type="hidden" name="entryId" value={entry.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs font-black text-amber-300 transition hover:bg-amber-400/15"
                      >
                        <RotateCcw size={14} />
                        عكس
                      </button>
                    </form>
                  ) : (
                    <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-center text-xs font-bold text-muted-foreground">
                      قيد عكسي
                    </span>
                  )}
                </div>

                <div className="mt-4 overflow-x-auto rounded-lg border border-white/10">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-white/[0.03] uppercase tracking-[0.12em] text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 font-bold">الحساب</th>
                        <th className="px-3 py-2 font-bold">الوصف</th>
                        <th className="px-3 py-2 font-bold">مدين</th>
                        <th className="px-3 py-2 font-bold">دائن</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {entry.lines.map((line) => (
                        <tr key={line.id}>
                          <td className="px-3 py-2">
                            <span className="font-mono font-bold text-primary">{line.accountCode}</span>
                            <span className="mx-2 text-muted-foreground">-</span>
                            <span className="font-bold text-white">{line.accountName}</span>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">{line.description || '-'}</td>
                          <td className="px-3 py-2 font-mono text-emerald-300">{line.debit !== '0.00' ? line.debit : '-'}</td>
                          <td className="px-3 py-2 font-mono text-amber-300">{line.credit !== '0.00' ? line.credit : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
