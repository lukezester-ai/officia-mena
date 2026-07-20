import { useGetProfitLoss, useGetBalanceSheet, useGetTopProducts } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, FileDown, PieChart as PieChartIcon, BarChart3, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function Reports() {
  const { data: pl } = useGetProfitLoss();
  const { data: bs } = useGetBalanceSheet();
  const { data: topProducts } = useGetTopProducts();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">التقارير المالية والتحليلية</h1>
          <p className="text-sm text-muted-foreground mt-1">القوائم المالية وتحليلات المبيعات</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
            <Download className="w-4 h-4 ml-2" /> تحميل PDF
          </Button>
          <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
            <FileDown className="w-4 h-4 ml-2" /> تصدير Excel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="financials" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 mb-6 p-1">
          <TabsTrigger value="financials" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">القوائم المالية</TabsTrigger>
          <TabsTrigger value="sales" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">تحليل المبيعات</TabsTrigger>
        </TabsList>

        <TabsContent value="financials" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profit & Loss Statement */}
            <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
              <CardHeader className="border-b border-white/5 pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg text-white">قائمة الدخل</CardTitle>
                    <CardDescription className="mt-1">للفترة المنتهية في {pl?.period || 'الحالية'}</CardDescription>
                  </div>
                  <div className={`p-3 rounded-full bg-white/5 ${pl && pl.netProfit > 0 ? 'text-secondary' : 'text-destructive'}`}>
                    {pl && pl.netProfit > 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white">الإيرادات</span>
                    <span className="font-mono">{formatCurrency(pl?.revenue || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>تكلفة البضاعة المباعة</span>
                    <span className="font-mono">({formatCurrency(pl?.costOfGoods || 0)})</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/10 font-bold text-white">
                    <span>إجمالي الربح</span>
                    <span className="font-mono text-primary">{formatCurrency(pl?.grossProfit || 0)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>المصروفات التشغيلية</span>
                    <span className="font-mono">({formatCurrency(pl?.operatingExpenses || 0)})</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t-2 border-double border-white/10 font-bold text-lg text-white">
                    <span>صافي الربح / (الخسارة)</span>
                    <span className={`font-mono ${(pl?.netProfit || 0) >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                      {formatCurrency(pl?.netProfit || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Balance Sheet */}
            <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
              <CardHeader className="border-b border-white/5 pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg text-white">الميزانية العمومية</CardTitle>
                    <CardDescription className="mt-1">كما في {bs?.date || new Date().toLocaleDateString('ar-SA')}</CardDescription>
                  </div>
                  <div className="p-3 rounded-full bg-white/5 text-blue-400">
                    <PieChartIcon className="w-5 h-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-3">
                  <h4 className="font-bold text-primary mb-2">الأصول</h4>
                  <div className="flex justify-between items-center font-medium text-white">
                    <span>إجمالي الأصول</span>
                    <span className="font-mono">{formatCurrency(bs?.assets || 0)}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5">
                  <h4 className="font-bold text-rose-400 mb-2">الخصوم وحقوق الملكية</h4>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>الالتزامات (الخصوم)</span>
                    <span className="font-mono">{formatCurrency(bs?.liabilities || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>حقوق الملكية</span>
                    <span className="font-mono">{formatCurrency(bs?.equity || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/10 font-bold text-white">
                    <span>إجمالي الخصوم وحقوق الملكية</span>
                    <span className="font-mono">{formatCurrency((bs?.liabilities || 0) + (bs?.equity || 0))}</span>
                  </div>
                </div>
                
                {/* Balance Check */}
                {bs && (
                  <div className={`mt-4 p-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium ${
                    Math.abs(bs.assets - (bs.liabilities + bs.equity)) < 1 ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-destructive/10 text-destructive border border-destructive/20'
                  }`}>
                    {Math.abs(bs.assets - (bs.liabilities + bs.equity)) < 1 ? (
                      <>الميزانية متوازنة</>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        الفرق: {formatCurrency(Math.abs(bs.assets - (bs.liabilities + bs.equity)))}
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="w-5 h-5 text-primary" /> المنتجات الأكثر مبيعاً
              </CardTitle>
              <CardDescription>المنتجات الأعلى إيراداً للفترة الحالية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full mt-4" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts || []} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={12} tickFormatter={(val) => `${val / 1000}k`} />
                    <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.8)" fontSize={12} width={120} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'الإيرادات']}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                    <Bar dataKey="totalRevenue" name="الإيرادات" radius={[0, 4, 4, 0]} maxBarSize={40}>
                      {
                        topProducts?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.category === 'petroleum' ? 'hsl(var(--primary))' : entry.category === 'fertilizer' ? 'hsl(var(--secondary))' : '#8884d8'} />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-8 overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="bg-white/5 text-muted-foreground border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3 font-medium">المنتج</th>
                      <th className="px-4 py-3 font-medium">التصنيف</th>
                      <th className="px-4 py-3 font-medium text-center">الكمية المباعة</th>
                      <th className="px-4 py-3 font-medium text-left">الإيرادات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {topProducts?.map((prod) => (
                      <tr key={prod.productId} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-medium text-white">{prod.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {prod.category === 'petroleum' ? 'بترول' : prod.category === 'fertilizer' ? 'أسمدة' : 'عام'}
                        </td>
                        <td className="px-4 py-3 font-mono text-center">{prod.quantitySold} <span className="text-xs text-muted-foreground">{prod.unit}</span></td>
                        <td className="px-4 py-3 font-mono font-bold text-left text-white" dir="ltr">
                          {formatCurrency(prod.totalRevenue)}
                        </td>
                      </tr>
                    ))}
                    {(!topProducts || topProducts.length === 0) && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">لا توجد بيانات متاحة</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
