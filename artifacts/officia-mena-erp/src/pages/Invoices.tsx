import { useState } from 'react';
import { useListInvoices, useGetInvoiceSummary } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Search, Filter, Download, ChevronLeft, CreditCard, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function Invoices() {
  const { data: summary } = useGetInvoiceSummary();
  const { data: invoices } = useListInvoices();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'paid': return { color: 'text-secondary bg-secondary/10 border-secondary/20', icon: CheckCircle2, label: 'مدفوعة' };
      case 'issued': return { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: Clock, label: 'مصدرة' };
      case 'overdue': return { color: 'text-destructive bg-destructive/10 border-destructive/20', icon: AlertCircle, label: 'متأخرة' };
      case 'draft': return { color: 'text-muted-foreground bg-white/10 border-white/20', icon: FileText, label: 'مسودة' };
      case 'cancelled': return { color: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20', icon: AlertCircle, label: 'ملغاة' };
      default: return { color: 'text-white bg-white/10 border-white/20', icon: FileText, label: status };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">الفواتير</h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة فواتير المبيعات والمشتريات</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
            <Download className="w-4 h-4 ml-2" /> تصدير
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 ml-2" /> فاتورة جديدة
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">إجمالي المستحقات (مبيعات)</p>
            <div className="text-2xl font-bold text-white mb-1">
              {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(summary?.totalReceivable || 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">إجمالي المدفوعات (مشتريات)</p>
            <div className="text-2xl font-bold text-white mb-1">
              {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(summary?.totalPayable || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">الفواتير المتأخرة</p>
            <div className="text-2xl font-bold text-destructive mb-1">{summary?.overdue || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">فواتير مصدرة وغير مدفوعة</p>
            <div className="text-2xl font-bold text-blue-400 mb-1">{summary?.issued || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="بحث برقم الفاتورة أو العميل..." 
              className="pl-4 pr-9 bg-white/5 border-white/10"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto bg-white/5 border-white/10">
              <Filter className="w-4 h-4 ml-2" /> تصفية
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-white/5 text-muted-foreground border-b border-white/10">
              <tr>
                <th className="px-4 py-3 font-medium">رقم الفاتورة</th>
                <th className="px-4 py-3 font-medium">النوع</th>
                <th className="px-4 py-3 font-medium">العميل / المورد</th>
                <th className="px-4 py-3 font-medium">تاريخ الإصدار</th>
                <th className="px-4 py-3 font-medium">تاريخ الاستحقاق</th>
                <th className="px-4 py-3 font-medium">المبلغ</th>
                <th className="px-4 py-3 font-medium text-center">الحالة</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices?.map((invoice) => {
                const status = getStatusConfig(invoice.status);
                const StatusIcon = status.icon;
                
                return (
                  <tr key={invoice.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-4 py-4 font-mono font-medium text-white">{invoice.number}</td>
                    <td className="px-4 py-4">
                      {invoice.type === 'sales' ? 
                        <span className="text-secondary bg-secondary/10 px-2 py-0.5 rounded text-xs">مبيعات</span> : 
                        <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded text-xs">مشتريات</span>
                      }
                    </td>
                    <td className="px-4 py-4 font-medium text-white">{invoice.contactName}</td>
                    <td className="px-4 py-4 font-mono text-muted-foreground">{new Date(invoice.issueDate).toLocaleDateString('en-GB')}</td>
                    <td className="px-4 py-4 font-mono text-muted-foreground">{new Date(invoice.dueDate).toLocaleDateString('en-GB')}</td>
                    <td className="px-4 py-4 font-mono font-bold text-white">
                      {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: invoice.currency }).format(invoice.total)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge variant="outline" className={`border ${status.color} px-2 py-1 justify-center gap-1.5`}>
                        <StatusIcon className="w-3 h-3" />
                        <span>{status.label}</span>
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
              
              {(!invoices || invoices.length === 0) && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    لا توجد فواتير
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
