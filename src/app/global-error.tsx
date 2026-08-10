'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    void fetch('/api/client-errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: error.message, stack: error.stack, digest: error.digest, path: window.location.pathname }),
      keepalive: true,
    }).catch(() => undefined);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
        <main className="max-w-lg rounded-3xl border border-amber-500/30 bg-zinc-900 p-8 text-center">
          <h1 className="text-2xl font-black">حدث خطأ مؤقت</h1>
          <p className="mt-3 text-zinc-400">تم تسجيل الخطأ بأمان. أعد المحاولة للمتابعة.</p>
          <button type="button" onClick={reset} className="mt-6 rounded-xl bg-amber-500 px-6 py-3 font-bold text-black">
            إعادة المحاولة
          </button>
        </main>
      </body>
    </html>
  );
}
