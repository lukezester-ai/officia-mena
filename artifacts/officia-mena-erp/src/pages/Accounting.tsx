import { useListAccounts, useListJournalEntries, useGetTrialBalance } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BookOpen, Calculator, Plus, Search, Filter, Hash, ChevronDown, ChevronLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export function Accounting() {
  const { data: accounts } = useListAccounts();
  const { data: journals } = useListJournalEntries();
  const { data: trialBalance } = useGetTrialBalance();

  const getAccountTypeLabel = (type: string) => {
    switch(type) {
      case 'asset': return 'أصول';
      case 'liability': return 'خصوم';
      case 'equity': return 'حقوق ملكية';
      case 'revenue': return 'إيرادات';
      case 'expense': return 'مصروفات';
      default: return type;
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch(type) {
      case 'asset': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'liability': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'equity': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'revenue': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'expense': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">المحاسبة المالية</h1>
          <p className="text-sm text-muted-foreground mt-1">الدليل المحاسبي، قيود اليومية وميزان المراجعة</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 ml-2" /> قيد يومية جديد
          </Button>
        </div>
      </div>

      <Tabs defaultValue="chart-of-accounts" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 mb-6 p-1">
          <TabsTrigger value="chart-of-accounts" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">الدليل المحاسبي</TabsTrigger>
          <TabsTrigger value="journal-entries" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">قيود اليومية</TabsTrigger>
          <TabsTrigger value="trial-balance" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">ميزان المراجعة</TabsTrigger>
        </TabsList>

        <TabsContent value="chart-of-accounts">
          <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
            <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="بحث برمز أو اسم الحساب..." className="pl-4 pr-9 bg-white/5 border-white/10" />
              </div>
              <Button variant="outline" className="bg-white/5 border-white/10 text-white w-full sm:w-auto">
                <Plus className="w-4 h-4 ml-2" /> إضافة حساب
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-white/5 text-muted-foreground border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 font-medium w-32">رمز الحساب</th>
                    <th className="px-4 py-3 font-medium">اسم الحساب</th>
                    <th className="px-4 py-3 font-medium">النوع</th>
                    <th className="px-4 py-3 font-medium text-left">الرصيد الحالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {accounts?.map((acc) => (
                    <tr key={acc.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-mono text-muted-foreground">{acc.code}</td>
                      <td className="px-4 py-3 font-medium text-white">{acc.nameAr || acc.name}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`text-xs ${getAccountTypeColor(acc.type)}`}>
                          {getAccountTypeLabel(acc.type)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-left text-white" dir="ltr">
                        {new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2 }).format(acc.balance)}
                      </td>
                    </tr>
                  ))}
                  {(!accounts || accounts.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">لا توجد حسابات</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="journal-entries">
          <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-white/5 text-muted-foreground border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 font-medium">الرقم المرجعي</th>
                    <th className="px-4 py-3 font-medium">التاريخ</th>
                    <th className="px-4 py-3 font-medium">البيان</th>
                    <th className="px-4 py-3 font-medium">الحالة</th>
                    <th className="px-4 py-3 font-medium text-left">إجمالي القيد</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {journals?.map((entry) => {
                    const total = entry.lines.filter(l => l.debit > 0).reduce((sum, l) => sum + l.debit, 0);
                    return (
                      <tr key={entry.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-4 py-4 font-mono text-white">{entry.reference || `JRN-${entry.id}`}</td>
                        <td className="px-4 py-4 font-mono text-muted-foreground">{new Date(entry.date).toLocaleDateString('en-GB')}</td>
                        <td className="px-4 py-4 text-white line-clamp-1 max-w-[200px]" title={entry.description}>{entry.description}</td>
                        <td className="px-4 py-4">
                          <Badge variant="outline" className={`text-xs ${entry.status === 'posted' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-white/10 text-muted-foreground border-white/20'}`}>
                            {entry.status === 'posted' ? 'مرحل' : 'مسودة'}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 font-mono font-bold text-left text-white" dir="ltr">
                          {new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2 }).format(total)}
                        </td>
                        <td className="px-4 py-4 text-left">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {(!journals || journals.length === 0) && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">لا توجد قيود يومية</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="trial-balance">
          <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
            <div className="p-4 border-b border-white/5">
              <h3 className="font-semibold text-white">ميزان المراجعة</h3>
              <p className="text-sm text-muted-foreground">يعرض أرصدة الحسابات للتحقق من توازن الدفاتر</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-white/5 text-muted-foreground border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 font-medium w-32">رمز الحساب</th>
                    <th className="px-4 py-3 font-medium">اسم الحساب</th>
                    <th className="px-4 py-3 font-medium text-left">مدين</th>
                    <th className="px-4 py-3 font-medium text-left">دائن</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {trialBalance?.map((line, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-mono text-muted-foreground">{line.accountCode}</td>
                      <td className="px-4 py-3 font-medium text-white">{line.accountName}</td>
                      <td className="px-4 py-3 font-mono text-left text-white" dir="ltr">
                        {line.debit > 0 ? new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2 }).format(line.debit) : '-'}
                      </td>
                      <td className="px-4 py-3 font-mono text-left text-white" dir="ltr">
                        {line.credit > 0 ? new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2 }).format(line.credit) : '-'}
                      </td>
                    </tr>
                  ))}
                  {trialBalance && trialBalance.length > 0 && (
                    <tr className="bg-white/5 font-bold border-t-2 border-white/10 text-primary">
                      <td colSpan={2} className="px-4 py-4">الإجمالي</td>
                      <td className="px-4 py-4 font-mono text-left" dir="ltr">
                        {new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2 }).format(trialBalance.reduce((s, l) => s + l.debit, 0))}
                      </td>
                      <td className="px-4 py-4 font-mono text-left" dir="ltr">
                        {new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2 }).format(trialBalance.reduce((s, l) => s + l.credit, 0))}
                      </td>
                    </tr>
                  )}
                  {(!trialBalance || trialBalance.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">لا توجد بيانات للعرض</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
