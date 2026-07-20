import { useGetVatSummary, useListVatDeclarations, useListVatTransactions } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, FileCheck, FileDown, Plus, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export function VAT() {
  const { data: summary } = useGetVatSummary();
  const { data: declarations } = useListVatDeclarations();
  const { data: transactions } = useListVatTransactions();

  const getDeclarationStatusConfig = (status: string) => {
    switch(status) {
      case 'paid': return { color: 'text-secondary bg-secondary/10 border-secondary/20', label: 'مسددة' };
      case 'submitted': return { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', label: 'مقدمة للزكاة' };
      case 'draft': return { color: 'text-muted-foreground bg-white/10 border-white/20', label: 'مسودة' };
      default: return { color: 'text-white bg-white/10 border-white/20', label: status };
    }
  };

  const vatPieData = summary ? [
    { name: 'ضريبة المخرجات (مبيعات)', value: summary.outputVat, color: 'hsl(var(--primary))' },
    { name: 'ضريبة المدخلات (مشتريات)', value: summary.inputVat, color: 'hsl(var(--secondary))' }
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">الزكاة والضرائب (VAT)</h1>
          <p className="text-sm text-muted-foreground mt-1">الإقرارات الضريبية وتحليلات ضريبة القيمة المضافة 15%</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-white/5 border-white/10">
            <FileDown className="w-4 h-4 ml-2" /> تقرير هيئة الزكاة
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 ml-2" /> إقرار ضريبي جديد
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-card/50 border-white/5 backdrop-blur-xl h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex justify-between items-center">
                <span>ملخص الفترة الضريبية الحالية</span>
                <Badge variant="outline" className="bg-white/5 border-white/10 font-mono">{summary?.currentPeriod}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="text-sm text-muted-foreground mb-1">ضريبة المخرجات (مبيعات)</div>
                  <div className="text-xl font-bold font-mono text-white">
                    {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(summary?.outputVat || 0)}
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="text-sm text-muted-foreground mb-1">ضريبة المدخلات (مشتريات)</div>
                  <div className="text-xl font-bold font-mono text-secondary">
                    {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(summary?.inputVat || 0)}
                  </div>
                </div>
                <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                  <div className="text-sm text-primary/80 font-medium mb-1">الضريبة المستحقة الدفع</div>
                  <div className="text-xl font-bold font-mono text-primary">
                    {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(summary?.netVat || 0)}
                  </div>
                  {summary?.dueDate && (
                    <div className="text-xs mt-2 text-white/60 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      تستحق في: <span className="font-mono">{new Date(summary.dueDate).toLocaleDateString('en-GB')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-[250px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vatPieData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.8)" fontSize={12} width={150} />
                    <Tooltip 
                      formatter={(value: number) => [new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(value), 'المبلغ']}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={40}>
                      {
                        vatPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-card/50 border-white/5 backdrop-blur-xl h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">تكوين الضريبة</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center">
              <div className="h-[250px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vatPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {vatPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(value)}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full space-y-2 mt-4 text-sm">
                <div className="flex items-center justify-between p-2 rounded bg-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span>ضريبة المبيعات</span>
                  </div>
                  <span className="font-mono text-white">
                    {vatPieData[0] ? ((vatPieData[0].value / (vatPieData[0].value + vatPieData[1].value)) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-secondary" />
                    <span>ضريبة المشتريات</span>
                  </div>
                  <span className="font-mono text-white">
                    {vatPieData[1] ? ((vatPieData[1].value / (vatPieData[0].value + vatPieData[1].value)) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="declarations" className="w-full mt-6">
        <TabsList className="bg-white/5 border border-white/10 mb-6 p-1">
          <TabsTrigger value="declarations" className="data-[state=active]:bg-white/10 data-[state=active]:text-white px-6">الإقرارات الضريبية</TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:bg-white/10 data-[state=active]:text-white px-6">سجل العمليات الخاضعة للضريبة</TabsTrigger>
        </TabsList>

        <TabsContent value="declarations">
          <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-white/5 text-muted-foreground border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 font-medium">الفترة الضريبية</th>
                    <th className="px-4 py-3 font-medium text-left">ضريبة المخرجات</th>
                    <th className="px-4 py-3 font-medium text-left">ضريبة المدخلات</th>
                    <th className="px-4 py-3 font-medium text-left">الضريبة المستحقة</th>
                    <th className="px-4 py-3 font-medium text-center">تاريخ الاستحقاق</th>
                    <th className="px-4 py-3 font-medium text-center">الحالة</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {declarations?.map((dec) => {
                    const status = getDeclarationStatusConfig(dec.status);
                    return (
                      <tr key={dec.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-4 py-4 font-bold text-white font-mono">{dec.period}</td>
                        <td className="px-4 py-4 font-mono text-left text-muted-foreground" dir="ltr">
                          {new Intl.NumberFormat('ar-SA').format(dec.outputVat)}
                        </td>
                        <td className="px-4 py-4 font-mono text-left text-secondary" dir="ltr">
                          {new Intl.NumberFormat('ar-SA').format(dec.inputVat)}
                        </td>
                        <td className="px-4 py-4 font-mono font-bold text-left text-white" dir="ltr">
                          {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(dec.netVat)}
                        </td>
                        <td className="px-4 py-4 font-mono text-center text-muted-foreground">{new Date(dec.dueDate).toLocaleDateString('en-GB')}</td>
                        <td className="px-4 py-4 text-center">
                          <Badge variant="outline" className={`border ${status.color} px-2 py-0.5`}>
                            {status.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-left">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <FileCheck className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {(!declarations || declarations.length === 0) && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">لا توجد إقرارات ضريبية</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-white/5 text-muted-foreground border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 font-medium">التاريخ</th>
                    <th className="px-4 py-3 font-medium">البيان</th>
                    <th className="px-4 py-3 font-medium text-center">النوع</th>
                    <th className="px-4 py-3 font-medium text-center">النسبة</th>
                    <th className="px-4 py-3 font-medium text-left">قيمة الضريبة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions?.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-mono text-muted-foreground">{new Date(tx.date).toLocaleDateString('en-GB')}</td>
                      <td className="px-4 py-3 text-white">
                        <div>{tx.description}</div>
                        {tx.invoiceId && <div className="text-xs text-muted-foreground font-mono mt-0.5">INV-{tx.invoiceId}</div>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {tx.type === 'output' ? (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">مخرجات (مبيعات)</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20 text-xs">مدخلات (مشتريات)</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-muted-foreground">{tx.vatRate}%</td>
                      <td className="px-4 py-3 font-mono font-bold text-left text-white" dir="ltr">
                        {new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2 }).format(tx.vatAmount)}
                      </td>
                    </tr>
                  ))}
                  {(!transactions || transactions.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">لا توجد عمليات</td>
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
