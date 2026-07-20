import { useGetDashboardSummary, useGetDashboardCashflow, useGetDashboardActivity, useGetDashboardAlerts } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Wallet, Receipt, AlertTriangle, Building2, TrendingUp, Package } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const { data: summary, isLoading: isSummaryLoading } = useGetDashboardSummary();
  const { data: cashflow, isLoading: isCashflowLoading } = useGetDashboardCashflow();
  const { data: activity, isLoading: isActivityLoading } = useGetDashboardActivity();
  const { data: alerts, isLoading: isAlertsLoading } = useGetDashboardAlerts();

  if (isSummaryLoading || isCashflowLoading || isActivityLoading || isAlertsLoading) {
    return <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 bg-white/5 rounded-md"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/5 rounded-xl"></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[400px] bg-white/5 rounded-xl"></div>
        <div className="h-[400px] bg-white/5 rounded-xl"></div>
      </div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">الرئيسية</h1>
        <div className="text-sm text-muted-foreground">{new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">الرصيد النقدي</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(summary?.cashBalance || 0)}
            </div>
            <p className="text-xs text-secondary flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3" />
              <span>+2.5% من الشهر الماضي</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">الفواتير المعلقة</CardTitle>
            <Receipt className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{summary?.pendingInvoices || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">تتطلب اتخاذ إجراء</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">الضرائب المستحقة</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(summary?.vatDue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">للفترة الحالية</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">تنبيهات المخزون</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{summary?.stockAlerts || 0}</div>
            <p className="text-xs text-destructive/80 mt-1">أصناف تحت حد الطلب</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card/50 border-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>التدفق النقدي (30 يوم)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashflow || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={12} tickFormatter={(val) => new Date(val).getDate().toString()} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickFormatter={(val) => `${val / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="income" name="الدخل" stroke="hsl(var(--secondary))" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expenses" name="المصروفات" stroke="hsl(var(--destructive))" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card/50 border-white/5 backdrop-blur-xl flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">تنبيهات هامة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts?.map((alert) => (
                <div key={alert.id} className="flex gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    alert.severity === 'high' ? 'bg-destructive shadow-[0_0_8px_hsl(var(--destructive))]' :
                    alert.severity === 'medium' ? 'bg-[#FF9F43]' : 'bg-primary'
                  }`} />
                  <div>
                    <h4 className="text-sm font-medium text-white">{alert.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{alert.body}</p>
                  </div>
                </div>
              ))}
              {(!alerts || alerts.length === 0) && (
                <div className="text-center py-6 text-sm text-muted-foreground">لا توجد تنبيهات حالية</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">أحدث النشاطات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activity?.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-start justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm text-white">{item.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString('ar-SA')}</p>
                    </div>
                    {item.amount && (
                      <span className={`text-sm font-medium ${item.type === 'invoice' || item.type === 'payment' ? 'text-secondary' : ''}`}>
                        {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(item.amount)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
