'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard rendering failed', error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center p-6" dir="rtl">
      <section className="w-full max-w-lg rounded-3xl border border-amber-500/30 bg-zinc-900 p-8 text-center shadow-2xl">
        <AlertTriangle className="mx-auto h-12 w-12 text-amber-400" />
        <h1 className="mt-5 text-2xl font-black text-white">تعذر تحميل لوحة التحكم</h1>
        <p className="mt-3 text-sm leading-7 text-zinc-400">
          حدث خطأ مؤقت أثناء تحميل البيانات. أعد المحاولة أو ارجع إلى الصفحة الرئيسية.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-zinc-500">Reference: {error.digest}</p>
        )}
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 font-bold text-black"
          >
            <RefreshCw className="h-4 w-4" />
            إعادة المحاولة
          </button>
          <Link href="/" className="rounded-xl border border-zinc-700 px-5 py-3 font-bold text-white">
            الصفحة الرئيسية
          </Link>
        </div>
      </section>
    </main>
  );
}
