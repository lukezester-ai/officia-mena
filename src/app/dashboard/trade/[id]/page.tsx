"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Droplets, 
  MapPin, 
  CheckCircle2, 
  Wallet,
  Shield,
  Activity,
  FileCheck,
  Ship,
  PackageCheck,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';

export default function TradeDashboard() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8" dir="rtl">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-4 text-sm font-medium">
          <ChevronLeft className="w-4 h-4" />
          Назад към всички сделки
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 text-xs font-mono border border-zinc-700">
                #AGR-4092
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                Активна сделка
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-1">
              Сушени кайсии, 12 тона
            </h1>
            <p className="text-zinc-400 flex items-center gap-2">
              <Shield className="w-4 h-4 text-zinc-500" />
              Проверена сделка чрез Смарт Договор
            </p>
          </div>
          
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-xl bg-zinc-900 text-white font-medium border border-zinc-800 hover:bg-zinc-800 transition-colors">
              Свържи се с продавача
            </button>
            <button className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              Документи (3)
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Main Stats) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Escrow Status Card - Glassmorphism */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 p-1"
          >
            {/* Animated gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-transparent opacity-50"></div>
            
            <div className="relative bg-zinc-950/80 rounded-xl p-6 md:p-8 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                <div>
                  <h2 className="text-sm font-medium text-zinc-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Ескроу Статус
                  </h2>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl md:text-5xl font-black text-white tracking-tight">38,400</span>
                    <span className="text-xl font-bold text-blue-400">USDC</span>
                  </div>
                  <p className="text-emerald-400 text-sm font-medium flex items-center gap-1.5 mt-2">
                    <ShieldCheck className="w-4 h-4" />
                    Заключени до потвърдена доставка
                  </p>
                </div>
                
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 min-w-[200px]">
                  <p className="text-xs text-zinc-500 mb-1">Смарт Договор (Polygon)</p>
                  <a href="#" className="text-sm font-mono text-blue-400 flex items-center gap-1.5 hover:text-blue-300 transition-colors">
                    0x71C...3E94
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <div className="w-full h-1 bg-zinc-800 rounded-full mt-3 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "66%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-400"
                    ></motion.div>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2 text-left">2 от 3 условия изпълнени</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Conditions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* SGS Inspection Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl bg-zinc-900/40 border border-zinc-800 p-6 backdrop-blur-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Независима инспекция</h3>
                    <p className="text-xs text-zinc-400">SGS Sofia, 14 юли</p>
                  </div>
                </div>
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              
              <div className="space-y-3 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Влажност</span>
                  <span className="text-sm font-bold text-white">18.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Съответствие</span>
                  <span className="text-xs font-medium px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md">Одобрено</span>
                </div>
              </div>
            </motion.div>

            {/* IoT Telemetry Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-2xl bg-zinc-900/40 border border-zinc-800 p-6 backdrop-blur-sm relative overflow-hidden"
            >
              {/* Radar pulse background effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl animate-pulse"></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Телеметрия на живо</h3>
                    <p className="text-xs text-zinc-400 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                      IoT Сензор #882
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 relative z-10">
                <div className="flex justify-between items-center bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-zinc-300">Влажност в контейнера</span>
                  </div>
                  <span className="text-sm font-bold text-white font-mono">14.0%</span>
                </div>
                <div className="flex justify-between items-center bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-zinc-300">Локация</span>
                  </div>
                  <span className="text-sm font-medium text-white">Порт Пирея</span>
                </div>
              </div>
            </motion.div>
            
          </div>
        </div>

        {/* Right Column (Timeline & Rep) */}
        <div className="space-y-6">
          
          {/* Timeline Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-2xl bg-zinc-900/40 border border-zinc-800 p-6 backdrop-blur-sm"
          >
            <h3 className="font-semibold text-white mb-6">Път на партидата</h3>
            
            <div className="relative border-r-2 border-zinc-800 pr-6 space-y-8">
              
              {/* Step 1 */}
              <div className="relative">
                <div className="absolute w-4 h-4 bg-emerald-500 rounded-full -right-[31px] top-1 border-4 border-zinc-900"></div>
                <h4 className="text-sm font-bold text-white">Сушене</h4>
                <p className="text-xs text-zinc-500 mt-1">Приключено на 10 юли</p>
              </div>
              
              {/* Step 2 */}
              <div className="relative">
                <div className="absolute w-4 h-4 bg-emerald-500 rounded-full -right-[31px] top-1 border-4 border-zinc-900"></div>
                <h4 className="text-sm font-bold text-white">Опаковане</h4>
                <p className="text-xs text-zinc-500 mt-1">Приключено на 12 юли</p>
              </div>
              
              {/* Step 3 */}
              <div className="relative">
                <div className="absolute w-4 h-4 bg-emerald-500 rounded-full -right-[31px] top-1 border-4 border-zinc-900"></div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">Инспекция (SGS)</h4>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>
                <p className="text-xs text-zinc-500 mt-1">Одобрено на 14 юли</p>
              </div>
              
              {/* Step 4 - Current */}
              <div className="relative">
                <div className="absolute w-4 h-4 bg-blue-500 rounded-full -right-[31px] top-1 border-4 border-zinc-900 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-blue-400">На път</h4>
                  <Ship className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-xs text-zinc-400 mt-1 bg-blue-500/10 px-2 py-1 rounded inline-block">В транзит (Пирея)</p>
              </div>
              
              {/* Step 5 - Pending */}
              <div className="relative opacity-50">
                <div className="absolute w-4 h-4 bg-zinc-800 rounded-full -right-[31px] top-1 border-4 border-zinc-900"></div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-zinc-400">Доставка</h4>
                  <PackageCheck className="w-4 h-4 text-zinc-500" />
                </div>
                <p className="text-xs text-zinc-500 mt-1">Очаква се на 22 юли</p>
              </div>
              
            </div>
          </motion.div>

          {/* Seller Reputation Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-2xl bg-zinc-900/40 border border-zinc-800 p-6 backdrop-blur-sm"
          >
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Информация за продавача</h3>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-xl font-bold text-zinc-400 border border-zinc-700">
                SF
              </div>
              <div>
                <h4 className="font-bold text-white">Sunfruit Bulgaria OOD</h4>
                <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Верифициран търговец
                </p>
              </div>
            </div>
            
            <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800/50 flex justify-around text-center">
              <div>
                <p className="text-xl font-bold text-white">47</p>
                <p className="text-xs text-zinc-500 mt-1">Успешни сделки</p>
              </div>
              <div className="w-px bg-zinc-800"></div>
              <div>
                <p className="text-xl font-bold text-emerald-400">0</p>
                <p className="text-xs text-zinc-500 mt-1">Спора</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
