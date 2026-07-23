'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { X } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Create the scanner instance
    scannerRef.current = new Html5QrcodeScanner(
      "barcode-reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: true
      },
      false
    );

    // Render it
    scannerRef.current.render(
      (decodedText) => {
        // Success callback
        // Clean up scanner after successful scan
        if (scannerRef.current) {
           scannerRef.current.clear().catch(console.error);
        }
        onScan(decodedText);
      },
      (err) => {
        // Error callback (called frequently when no barcode is in frame)
        // We usually ignore this unless we want to show specific errors
      }
    );

    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative">
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
          <h3 className="font-bold text-white">مسح الباركود (Barcode Scan)</h3>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-rose-500/20 text-muted-foreground hover:text-rose-500 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 flex flex-col items-center">
          <div id="barcode-reader" className="w-full bg-black rounded-xl overflow-hidden [&_video]:w-full [&_video]:rounded-xl [&_#qr-shaded-region]:border-[var(--color-primary)]"></div>
          <p className="text-muted-foreground text-sm mt-4 text-center">
            قم بتوجيه الكاميرا نحو الباركود الخاص بالمنتج ليتم مسحه تلقائياً.
          </p>
          {error && <p className="text-rose-500 text-sm mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}
