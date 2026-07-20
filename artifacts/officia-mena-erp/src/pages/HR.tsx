import { useGetHrSummary, useListEmployees, useListPayrollRuns } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, Briefcase, Plus, Wallet, FileText, ChevronLeft } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export function HR() {
  const { data: summary } = useGetHrSummary();
  const { data: employees } = useListEmployees();
  const { data: payroll } = useListPayrollRuns();

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--destructive))', '#FF9F43', '#8884d8'];

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'active': return { color: 'text-secondary bg-secondary/10 border-secondary/20', label: 'على رأس العمل' };
      case 'on_leave': return { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', label: 'في إجازة' };
      case 'inactive': return { color: 'text-muted-foreground bg-white/10 border-white/20', label: 'غير نشط' };
      default: return { color: 'text-white bg-white/10 border-white/20', label: status };
    }
  };

  const getPayrollStatusConfig = (status: string) => {
    switch(status) {
      case 'paid': return { color: 'text-secondary bg-secondary/10 border-secondary/20', label: 'مصروفة' };
      case 'approved': return { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', label: 'معتمدة' };
      case 'draft': return { color: 'text-muted-foreground bg-white/10 border-white/20', label: 'مسودة' };
      default: return { color: 'text-white bg-white/10 border-white/20', label: status };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">الموارد البشرية والرواتب</h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة شؤون الموظفين ومسيرات الرواتب</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 ml-2" /> إضافة موظف
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">إجمالي الموظفين</p>
              <div className="text-2xl font-bold text-white">{summary?.totalEmployees || 0}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">على رأس العمل</p>
              <div className="text-2xl font-bold text-secondary">{summary?.activeEmployees || 0}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">في إجازة</p>
              <div className="text-2xl font-bold text-amber-400">{summary?.onLeave || 0}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">مسير الرواتب الشهري</p>
              <div className="text-xl font-bold text-white font-mono">
                {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(summary?.monthlyPayroll || 0)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 mb-6 p-1">
          <TabsTrigger value="employees" className="data-[state=active]:bg-white/10 data-[state=active]:text-white px-6">الموظفين</TabsTrigger>
          <TabsTrigger value="payroll" className="data-[state=active]:bg-white/10 data-[state=active]:text-white px-6">مسيرات الرواتب</TabsTrigger>
          <TabsTrigger value="departments" className="data-[state=active]:bg-white/10 data-[state=active]:text-white px-6">تحليل الأقسام</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-white/5 text-muted-foreground border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 font-medium">الاسم</th>
                    <th className="px-4 py-3 font-medium">المنصب / القسم</th>
                    <th className="px-4 py-3 font-medium">رقم الإقامة</th>
                    <th className="px-4 py-3 font-medium">الجنسية</th>
                    <th className="px-4 py-3 font-medium text-center">تاريخ الانضمام</th>
                    <th className="px-4 py-3 font-medium text-center">الحالة</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {employees?.map((emp) => {
                    const status = getStatusConfig(emp.status);
                    return (
                      <tr key={emp.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold uppercase">
                              {emp.nameAr.substring(0, 2)}
                            </div>
                            <span className="font-medium text-white">{emp.nameAr}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-white">{emp.position}</div>
                          <div className="text-xs text-muted-foreground">{emp.department}</div>
                        </td>
                        <td className="px-4 py-4 font-mono text-muted-foreground">{emp.iqamaNumber || '-'}</td>
                        <td className="px-4 py-4 text-muted-foreground">{emp.nationality}</td>
                        <td className="px-4 py-4 font-mono text-center text-muted-foreground">{new Date(emp.joinDate).toLocaleDateString('en-GB')}</td>
                        <td className="px-4 py-4 text-center">
                          <Badge variant="outline" className={`border ${status.color} px-2 py-0.5`}>
                            {status.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-left">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {(!employees || employees.length === 0) && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">لا توجد بيانات موظفين</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="payroll">
          <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-semibold text-white">سجل مسيرات الرواتب</h3>
              <Button variant="outline" className="bg-white/5 border-white/10 h-9">
                <Plus className="w-4 h-4 ml-2" /> إنشاء مسير جديد
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-white/5 text-muted-foreground border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 font-medium">الشهر / السنة</th>
                    <th className="px-4 py-3 font-medium text-center">عدد الموظفين</th>
                    <th className="px-4 py-3 font-medium text-left">إجمالي الرواتب</th>
                    <th className="px-4 py-3 font-medium text-left">الاستقطاعات</th>
                    <th className="px-4 py-3 font-medium text-left">الصافي للدفع</th>
                    <th className="px-4 py-3 font-medium text-center">الحالة</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {payroll?.map((run) => {
                    const status = getPayrollStatusConfig(run.status);
                    return (
                      <tr key={run.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-4 py-4 font-bold text-white">
                          {run.month.toString().padStart(2, '0')} / {run.year}
                        </td>
                        <td className="px-4 py-4 text-center text-muted-foreground">{run.employeeCount}</td>
                        <td className="px-4 py-4 font-mono text-left text-muted-foreground" dir="ltr">
                          {new Intl.NumberFormat('ar-SA').format(run.totalGross)}
                        </td>
                        <td className="px-4 py-4 font-mono text-left text-destructive" dir="ltr">
                          {run.totalDeductions > 0 ? `(${new Intl.NumberFormat('ar-SA').format(run.totalDeductions)})` : '-'}
                        </td>
                        <td className="px-4 py-4 font-mono font-bold text-left text-white" dir="ltr">
                          {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(run.totalNet)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Badge variant="outline" className={`border ${status.color} px-2 py-0.5`}>
                            {status.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-left">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <FileText className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {(!payroll || payroll.length === 0) && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">لا يوجد سجل لمسيرات الرواتب</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="departments">
          <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">توزيع الموظفين حسب الأقسام</CardTitle>
            </CardHeader>
            <CardContent>
              {summary && summary.departmentBreakdown && summary.departmentBreakdown.length > 0 ? (
                <div className="h-[400px] w-full mt-4" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={summary.departmentBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={140}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="department"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                      >
                        {summary.departmentBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  لا توجد بيانات كافية لعرض الرسم البياني
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
