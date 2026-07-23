'use client';
import { useEffect } from 'react';
export default function DashboardError({ error }: { error: Error & { digest?: string }; reset: () => void; }) {
  useEffect(() => { console.error('Dashboard Error Caught:', error); }, [error]);
  return (
    <div className="p-8 text-center" dir="ltr">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Dashboard Crashed!</h2>
      <div className="bg-red-50 text-red-900 p-4 rounded-md text-left font-mono overflow-auto max-w-2xl mx-auto border border-red-200">
        <p className="font-bold">Error Message:</p><p>{error.message}</p>
        <p className="font-bold mt-2">Stack:</p><pre className="text-xs whitespace-pre-wrap">{error.stack}</pre>
      </div>
    </div>
  );
}
