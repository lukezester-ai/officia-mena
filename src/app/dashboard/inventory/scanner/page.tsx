'use client';

import React, { useState, useEffect } from 'react';
import { Camera, X, ScanBarcode, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BarcodeScannerPage() {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  // Simulate scanning a barcode after 3 seconds
  useEffect(() => {
    if (!isScanning) return;
    
    const timer = setTimeout(() => {
      setScannedCode('884116362489'); // Mock barcode for Dell XPS
      setIsScanning(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isScanning]);

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-[var(--color-desert-950)] rounded-3xl overflow-hidden shadow-2xl relative text-white border-4 border-black">
        {/* Header */}
        <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/70 to-transparent">
          <Link href="/dashboard/inventory" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <ArrowRight size={20} />
          </Link>
          <span className="font-bold text-sm">مسح الباركود (Scan Barcode)</span>
          <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Camera Viewport (Simulated) */}
        <div className="h-[600px] bg-zinc-900 relative flex items-center justify-center">
          {/* Simulated Camera Feed Background */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8ed7453631?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
          
          {isScanning ? (
            <>
              {/* Scanner Frame */}
              <div className="relative w-64 h-40 z-10">
                {/* Corners */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[var(--color-gold-500)]"></div>
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[var(--color-gold-500)]"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[var(--color-gold-500)]"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[var(--color-gold-500)]"></div>
                
                {/* Scanning Laser */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[var(--color-gold-500)] shadow-[0_0_10px_var(--color-gold-500)] animate-pulse"></div>
              </div>
              <p className="absolute bottom-24 text-sm font-bold bg-black/50 px-4 py-2 rounded-full">
                وجه الكاميرا نحو الباركود...
              </p>
            </>
          ) : (
            <div className="z-10 flex flex-col items-center animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                <CheckCircle2 size={32} className="text-white" />
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
                <p className="text-emerald-400 font-bold mb-1">تم المسح بنجاح!</p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <ScanBarcode size={24} className="text-white/70" />
                  <span className="font-mono text-2xl tracking-widest">{scannedCode}</span>
                </div>
                
                <div className="bg-black/40 rounded-xl p-4 text-right mb-4">
                  <p className="text-xs text-white/50 mb-1">المنتج (Product)</p>
                  <p className="font-bold">لابتوب ديل XPS 15</p>
                  <p className="text-sm text-[var(--color-gold-400)]">SKU: ITM-001</p>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg font-bold text-sm transition-colors" onClick={() => setIsScanning(true)}>
                    مسح آخر
                  </button>
                  <Link href="/dashboard/inventory" className="flex-1 bg-[var(--color-gold-500)] hover:bg-[var(--color-gold-600)] text-black py-2 rounded-lg font-bold text-sm transition-colors block">
                    عرض في المخزون
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="absolute bottom-0 inset-x-0 p-6 flex justify-center z-10 bg-gradient-to-t from-black to-transparent">
          <button className={`w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center transition-all ${isScanning ? 'bg-white/20' : 'bg-transparent opacity-50'}`}>
            <Camera size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
