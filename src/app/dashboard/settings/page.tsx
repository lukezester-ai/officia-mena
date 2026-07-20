import React from 'react';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto h-[80vh] flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 bg-[var(--color-desert-100)] rounded-full flex items-center justify-center mb-6">
        <Settings size={40} className="text-[var(--color-desert-500)]" />
      </div>
      <h1 className="text-3xl font-bold text-[var(--color-desert-900)] mb-4">الإعدادات (Settings)</h1>
      <p className="text-[var(--color-desert-600)] max-w-md mx-auto">
        هذه الصفحة قيد التطوير. ستتمكن هنا من إدارة معلومات الشركة، الضرائب، والمستخدمين.
      </p>
    </div>
  );
}
