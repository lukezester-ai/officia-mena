/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle, XCircle, Clock, AlertTriangle, FileText, Loader2, Search } from 'lucide-react';
import { getApprovals, getApprovalsSummary, updateApprovalStatus } from './approval-actions';

interface Approval {
  id: string;
  type: string;
  referenceNumber: string;
  referenceAmount: string;
  description: string;
  status: string;
  requestedBy: string;
  approvedBy: string | null;
  notes: string | null;
  createdAt: string;
}

interface Summary {
  pending: number;
  approved: number;
  rejected: number;
  pendingAmount: number;
}

const TYPE_LABELS: Record<string, string> = { purchase_order: 'أمر شراء', invoice: 'فاتورة', quotation: 'عرض سعر' };
const TYPE_COLORS: Record<string, string> = { purchase_order: 'bg-amber-500/20 text-amber-400', invoice: 'bg-blue-500/20 text-blue-400', quotation: 'bg-purple-500/20 text-purple-400' };

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  
  // Action state
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [appRes, sumRes] = await Promise.all([
      getApprovals(filter),
      getApprovalsSummary()
    ]);
    if (appRes.success && appRes.data) setApprovals(appRes.data as any);
    if (sumRes.success && sumRes.summary) setSummary(sumRes.summary as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const handleAction = async () => {
    if (!actionId || !actionType) return;
    if (actionType === 'reject' && !notes) {
      alert('يرجى كتابة سبب الرفض');
      return;
    }
    
    setIsSubmitting(true);
    const mappedStatus = actionType === 'approve' ? 'approved' : 'rejected';
    const res = await updateApprovalStatus(actionId, mappedStatus, notes);
    
    if (res.success) {
      setActionId(null);
      setActionType(null);
      setNotes('');
      fetchData(); // Refresh list and summary
    } else {
      alert('حدث خطأ: ' + res.error);
    }
    setIsSubmitting(false);
  };

  const formatMoney = (val: string | number) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(typeof val === 'string' ? parseFloat(val) : val);
  };

  return (
    <div className="space-y-6 pb-12" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="text-primary" size={32} />
            سير الموافقات (Approvals)
          </h1>
          <p className="text-muted-foreground mt-1">الموافقة على المعاملات المالية عالية القيمة</p>
        </div>
        {(summary?.pending ?? 0) > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-lg shadow-amber-500/5">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span className="text-sm text-amber-400 font-bold">{summary?.pending} طلب في انتظار الموافقة</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'في الانتظار', value: summary?.pending ?? 0, color: 'text-amber-400', icon: Clock },
          { label: 'تمت الموافقة', value: summary?.approved ?? 0, color: 'text-emerald-400', icon: CheckCircle },
          { label: 'مرفوضة', value: summary?.rejected ?? 0, color: 'text-destructive', icon: XCircle },
          { label: 'مبلغ تحت الموافقة', value: formatMoney(summary?.pendingAmount ?? 0), color: 'text-primary', icon: ShieldCheck, big: true },
        ].map(({ label, value, color, icon: Icon, big }) => (
          <div key={label} className="bg-card/50 border border-white/5 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Icon size={80} className={color} />
            </div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-sm font-bold text-muted-foreground">{label}</span>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className={`font-bold font-mono ${big ? 'text-lg md:text-xl' : 'text-3xl'} ${color} relative z-10`}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin opacity-50" /> : value}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-black/40 rounded-xl p-1 border border-white/5 w-full md:w-auto overflow-x-auto">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${filter === f ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
          >
            {{ all: 'الكل', pending: 'في الانتظار', approved: 'مُوافَق', rejected: 'مرفوض' }[f]}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-card rounded-2xl border border-white/5 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : approvals.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground flex flex-col items-center">
            <ShieldCheck className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-bold text-white/50">{filter === 'pending' ? 'لا توجد طلبات في انتظار الموافقة' : 'لا توجد بيانات'}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {approvals.map(a => (
              <div key={a.id} className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6 hover:bg-white/[0.02] transition-colors group">
                <div className={`p-4 rounded-xl ${TYPE_COLORS[a.type] || 'bg-white/10 text-white'}`}>
                  <FileText className="w-6 h-6" />
                </div>
                
                <div className="flex-1 min-w-0 space-y-2 w-full">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-lg text-white font-mono">{a.referenceNumber}</span>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${TYPE_COLORS[a.type] || 'bg-white/10 text-white'}`}>
                      {TYPE_LABELS[a.type] || a.type}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      a.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                      a.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      'bg-destructive/10 text-destructive border-destructive/20'
                    }`}>
                      {{ pending: 'في الانتظار', approved: 'مُوافَق عليه', rejected: 'مرفوض' }[a.status]}
                    </span>
                  </div>
                  
                  <p className="text-white/80">{a.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground bg-black/20 p-2 rounded-lg w-fit border border-white/5">
                    <span className="flex items-center gap-1">طلب من: <span className="font-bold text-white">{a.requestedBy}</span></span>
                    {a.approvedBy && <span className="flex items-center gap-1">قرار بواسطة: <span className="font-bold text-white">{a.approvedBy}</span></span>}
                    <span className="flex items-center gap-1"><Clock size={12}/> {new Date(a.createdAt).toLocaleString('ar-SA')}</span>
                  </div>
                  
                  {a.notes && (
                    <div className="text-xs bg-white/5 border-r-2 border-white/20 p-2 rounded-l-lg text-white/70 italic mt-2">
                      &quot;{a.notes}&quot;
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-3 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                  <div className="text-2xl font-bold text-white font-mono">{formatMoney(a.referenceAmount)}</div>
                  {a.status === 'pending' && (
                    <div className="flex w-full md:w-auto gap-2">
                      <button
                        onClick={() => { setActionId(a.id); setActionType('approve'); }}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black font-bold transition-colors"
                      >
                        <CheckCircle className="w-5 h-5" /> موافقة
                      </button>
                      <button
                        onClick={() => { setActionId(a.id); setActionType('reject'); }}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-destructive/20 text-destructive hover:bg-destructive hover:text-white font-bold transition-colors"
                      >
                        <XCircle className="w-5 h-5" /> رفض
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Dialog Modal */}
      {actionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#07070F] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className={`p-6 border-b border-white/5 flex items-center gap-3 ${actionType === 'approve' ? 'text-emerald-400' : 'text-destructive'}`}>
              {actionType === 'approve' ? <CheckCircle size={28} /> : <XCircle size={28} />}
              <h3 className="text-xl font-bold">{actionType === 'approve' ? 'تأكيد الموافقة' : 'تأكيد الرفض'}</h3>
            </div>
            
            <div className="p-6 space-y-4 text-white">
              <p className="text-muted-foreground">
                {actionType === 'approve' 
                  ? 'هل أنت متأكد من الموافقة على هذه المعاملة؟ سيتم إشعار القسم المعني بالموافقة للاستمرار.' 
                  : 'يرجى كتابة سبب الرفض ليتم إشعار مقدم الطلب (إلزامي).'}
              </p>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">ملاحظات {actionType === 'reject' && '*'}</label>
                <textarea 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="أضف ملاحظة أو سبب الرفض..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-primary/50 resize-none h-32"
                />
              </div>
            </div>
            
            <div className="p-6 bg-white/5 border-t border-white/5 flex gap-3">
              <button 
                onClick={() => { setActionId(null); setActionType(null); setNotes(''); }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleAction}
                disabled={isSubmitting || (actionType === 'reject' && !notes.trim())}
                className={`flex-1 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
                  actionType === 'approve' 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-black' 
                    : 'bg-destructive hover:bg-destructive/90 text-white'
                }`}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : actionType === 'approve' ? 'تأكيد الموافقة' : 'تأكيد الرفض'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
