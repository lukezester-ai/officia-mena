// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { generateCashflowForecast } from './actions';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BrainCircuit, LineChart, Loader2, AlertCircle, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import Link from 'next/link';

export default function ForecastPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchForecast();
  }, []);

  const fetchForecast = async () => {
    setLoading(true);
    const res = await generateCashflowForecast();
    if (res.success) {
      setData(res.data);
    } else {
      setError(res.error || 'Unknown error');
    }
    setLoading(false);
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(val);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f0f1a] border border-white/10 p-4 rounded-xl shadow-2xl" dir="rtl">
          <p className="text-white font-bold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm mb-1">
              <span style={{ color: entry.color }}>{entry.name}</span>
              <span className="font-mono text-white font-bold">{formatMoney(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <BrainCircuit className="text-primary w-8 h-8" />
            توقعات التدفق النقدي بالذكاء الاصطناعي
          </h1>
          <p className="text-muted-foreground text-sm">
            تحليل تنبؤي للمداخيل والمصروفات باستخدام نموذج Gemini 1.5
          </p>
        </div>
        
        <Link href="/dashboard" className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm font-medium border border-white/10">
          العودة للرئيسية
        </Link>
      </div>

      {loading && (
        <div className="h-[400px] bg-card border border-white/5 rounded-2xl flex flex-col items-center justify-center text-primary">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="text-muted-foreground animate-pulse">جاري تحليل البيانات المالية وإنشاء التوقعات...</p>
        </div>
      )}

      {error && (
        <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive flex items-center gap-3">
          <AlertCircle />
          <p>{error}</p>
        </div>
      )}

      {data && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart Area */}
          <div className="lg:col-span-2 bg-card border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
            
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <LineChart className="text-primary" /> توقعات الـ 3 أشهر القادمة
            </h2>
            
            <div className="h-[350px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.forecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00D4AA" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF4D6D" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FF4D6D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" name="المدخول المتوقع" dataKey="income" stroke="#00D4AA" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" name="المصروف المتوقع" dataKey="expense" stroke="#FF4D6D" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Insights Area */}
          <div className="flex flex-col gap-6">
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-3xl p-6 shadow-xl relative overflow-hidden h-full">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
              
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <BrainCircuit className="text-primary" /> نصائح AI المالية
              </h2>
              
              <div className="space-y-4 relative z-10">
                {data.insights.map((insight: string, idx: number) => (
                  <div key={idx} className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/5 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-xs font-bold">{idx + 1}</span>
                    </div>
                    <p className="text-sm text-white/90 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Quick Stats Box */}
            {data.forecastData && data.forecastData.length > 0 && (
              <div className="bg-card border border-white/5 rounded-3xl p-6 shadow-xl">
                <p className="text-sm text-muted-foreground mb-1">صافي النقد المتوقع للشهر القادم</p>
                <div className="flex items-center gap-3 mb-2">
                  <Wallet className="text-primary w-6 h-6" />
                  <span className="text-3xl font-mono font-bold text-white">
                    {formatMoney(data.forecastData[0].netCash)}
                  </span>
                </div>
                {data.forecastData[0].netCash > 0 ? (
                  <p className="text-xs text-[#00D4AA] flex items-center gap-1"><ArrowUpRight size={14}/> تدفق نقدي إيجابي</p>
                ) : (
                  <p className="text-xs text-[#FF4D6D] flex items-center gap-1"><ArrowDownRight size={14}/> عجز متوقع</p>
                )}
              </div>
            )}
          </div>
          
        </div>
      )}
    </div>
  );
}
