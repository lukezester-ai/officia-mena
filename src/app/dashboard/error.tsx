'use client';
import { useEffect } from 'react';
export default function DashboardError({ error }: { error: Error & { digest?: string }; reset: () => void; }) {
  useEffect(() => { console.error('Dashboard Error Caught:', error); }, [error]);
  return (
    <div className="p-8 text-center" dir="rtl">
      <h2 className="text-2xl font-bold text-red-500 mb-4">حدث خطأ في لوحة التحكم!</h2>
      <div className="bg-red-50 text-red-900 p-4 rounded-md text-right font-mono overflow-auto max-w-2xl mx-auto border border-red-200">
        <p className="font-bold">رسالة الخطأ:</p><p>{error.message}</p>
        <p className="font-bold mt-2">التفاصيل:</p><pre className="text-xs whitespace-pre-wrap">{error.stack}</pre>
      </div>
    </div>
  );
}
