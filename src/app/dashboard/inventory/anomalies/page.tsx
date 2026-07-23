/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { detectStockAnomalies } from './actions';
import { ShieldAlert, Loader2, AlertTriangle, AlertOctagon, Info, PackageX, TrendingDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const fetchAnomalies = async () => {
    setLoading(true);
    const res = await detectStockAnomalies();
    if (res.success) {
      setAnomalies(res.data || []);
    } else {
      setError('error' in res && typeof res.error === 'string' ? res.error : 'Unknown error');
    }
    setLoading(false);
  };

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case 'high': return <AlertOctagon className="text-destructive w-6 h-6" />;
      case 'medium': return <AlertTriangle className="text-primary w-6 h-6" />;
      case 'low': return <Info className="text-[#00D4AA] w-6 h-6" />;
      default: return <Info className="text-white w-6 h-6" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'high': return 'bg-destructive/10 border-destructive/30 text-destructive';
      case 'medium': return 'bg-primary/10 border-primary/30 text-primary';
      case 'low': return 'bg-[#00D4AA]/10 border-[#00D4AA]/30 text-[#00D4AA]';
      default: return 'bg-white/5 border-white/10 text-white';
    }
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8" dir="rtl">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <ShieldAlert className="text-destructive w-8 h-8" />
            فحص المخزون الذكي (AI Anomalies)
          </h1>
          <p className="text-muted-foreground text-sm">
            نظام رصد آلي يحلل مستويات المخزون، الأسعار، ورأس المال المجمد لاكتشاف الأخطاء والفرص.
          </p>
        </div>
        
        <Link href="/dashboard/inventory" className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm font-medium border border-white/10 flex items-center gap-2">
          العودة للمستودع <ArrowRight size={16} />
        </Link>
      </div>

      {loading && (
        <div className="h-[300px] bg-card border border-white/5 rounded-3xl flex flex-col items-center justify-center text-primary shadow-xl">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="text-muted-foreground">جاري فحص المستودع باستخدام خوارزميات الذكاء الاصطناعي...</p>
        </div>
      )}

      {error && (
        <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive flex items-center gap-3">
          <AlertOctagon />
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && anomalies.length === 0 && (
        <div className="p-12 bg-[#00D4AA]/5 border border-[#00D4AA]/20 rounded-3xl text-center">
          <ShieldAlert className="w-16 h-16 text-[#00D4AA] mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-bold text-white mb-2">المخزون سليم 100%</h2>
          <p className="text-muted-foreground">لم يرصد الذكاء الاصطناعي أي تناقضات أو مخاطر في المستودع الحالي.</p>
        </div>
      )}

      {!loading && anomalies.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white mb-4">المخاطر المكتشفة ({anomalies.length})</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {anomalies.map((anomaly, idx) => (
              <div key={idx} className={`p-6 rounded-2xl border ${getSeverityColor(anomaly.severity)} backdrop-blur-sm relative overflow-hidden group hover:border-opacity-100 transition-all shadow-lg`}>
                
                {/* Background Decor */}
                <div className="absolute -left-10 -bottom-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                  <ShieldAlert className="w-40 h-40" />
                </div>

                <div className="flex items-start gap-4 relative z-10">
                  <div className="shrink-0 mt-1">
                    {getSeverityIcon(anomaly.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-lg leading-tight">{anomaly.issueType}</h3>
                      <span className="text-[10px] uppercase tracking-wider font-bold opacity-70 bg-black/20 px-2 py-0.5 rounded-full">
                        {anomaly.severity} RISK
                      </span>
                    </div>
                    
                    <p className="text-xs font-mono opacity-70 mb-3 flex items-center gap-2">
                      <PackageX size={12} /> {anomaly.productName} (SKU: {anomaly.sku})
                    </p>
                    
                    <p className="text-sm leading-relaxed mb-4 text-white/90">
                      {anomaly.description}
                    </p>
                    
                    {anomaly.capitalTiedUp && anomaly.capitalTiedUp > 0 && (
                      <div className="bg-black/30 border border-white/5 rounded-lg p-3 inline-flex items-center gap-3">
                        <TrendingDown className="w-5 h-5 opacity-70" />
                        <div>
                          <p className="text-[10px] opacity-70 uppercase tracking-wide">رأس المال المعطل</p>
                          <p className="font-mono font-bold">{formatMoney(anomaly.capitalTiedUp)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
