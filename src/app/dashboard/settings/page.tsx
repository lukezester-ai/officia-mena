'use client';

import React, { useState } from 'react';
import { Settings, Building2, CreditCard, Users, Globe, Save, Crown } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
  };

  const tabs = [
    { id: 'company', label: 'معلومات الشركة', icon: Building2 },
    { id: 'tax', label: 'الضرائب والزكاة', icon: CreditCard },
    { id: 'users', label: 'المستخدمين', icon: Users },
    { id: 'preferences', label: 'التفضيلات', icon: Globe },
    { id: 'subscription', label: 'الاشتراك', icon: Crown },
  ];

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-[var(--color-gold-500)]/20 rounded-xl flex items-center justify-center">
          <Settings className="text-[var(--color-gold-500)]" size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">الإعدادات</h1>
          <p className="text-zinc-400">إدارة معلومات الشركة، الضرائب، والمستخدمين</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-background font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
          {activeTab === 'company' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">معلومات الشركة</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">اسم الشركة</label>
                  <input
                    type="text"
                    defaultValue="Officia MENA Corp"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-gold-500)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">السجل التجاري</label>
                  <input
                    type="text"
                    defaultValue="1010123456"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-gold-500)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">الرقم الضريبي (VAT)</label>
                  <input
                    type="text"
                    defaultValue="300000000000003"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-gold-500)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">الدولة</label>
                  <select className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-gold-500)]">
                    <option>السعودية</option>
                    <option>الإمارات</option>
                    <option>قطر</option>
                    <option>الكويت</option>
                    <option>البحرين</option>
                    <option>عمان</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-400 mb-2">العنوان</label>
                  <input
                    type="text"
                    defaultValue="الرياض، المملكة العربية السعودية"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-gold-500)]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-400 mb-2">الشعار (URL)</label>
                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-gold-500)]"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tax' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">الضرائب والزكاة</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">نسبة ضريبة القيمة المضافة (VAT)</label>
                  <input
                    type="number"
                    defaultValue="15"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-gold-500)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">العملة الافتراضية</label>
                  <select className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-gold-500)]">
                    <option>SAR - الريال السعودي</option>
                    <option>AED - الدرهم الإماراتي</option>
                    <option>QAR - الريال القطري</option>
                    <option>KWD - الدينار الكويتي</option>
                    <option>BHD - الدينار البحريني</option>
                    <option>OMR - الريال العماني</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-400 mb-2">معرف ZATCA (CSID)</label>
                  <input
                    type="text"
                    placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-gold-500)]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-400 mb-2">السنة الهجرية للزكاة</label>
                  <select className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-gold-500)]">
                    <option>السنة الهجرية الحالية</option>
                    <option>تاريخ مخصص</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">المستخدمون والصلاحيات</h2>
              <div className="space-y-4">
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-background font-bold">
                        A
                      </div>
                      <div>
                        <div className="font-bold text-white">أحمد عبدالله</div>
                        <div className="text-sm text-zinc-400">أحمد@example.com</div>
                      </div>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-bold">مدير</span>
                  </div>
                </div>
                <button className="w-full py-3 border border-dashed border-zinc-700 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors">
                  + إضافة مستخدم جديد
                </button>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">التفضيلات</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                  <div>
                    <div className="font-bold text-white">اللغة الافتراضية</div>
                    <div className="text-sm text-zinc-400">لغة واجهة النظام</div>
                  </div>
                  <select className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white">
                    <option>العربية</option>
                    <option>English</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                  <div>
                    <div className="font-bold text-white">إشعارات البريد الإلكتروني</div>
                    <div className="text-sm text-zinc-400">تلقي إشعارات مهمة</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                  <div>
                    <div className="font-bold text-white">النموذج التلقائي للفواتير</div>
                    <div className="text-sm text-zinc-400">استخدام معلومات العميل للملء التلقائي</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">الاشتراك</h2>
              <div className="space-y-4">
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl font-bold text-white">Free</div>
                      <div className="text-sm text-zinc-400">الخطة المجانية</div>
                    </div>
                    <span className="bg-zinc-700 text-zinc-300 px-3 py-1 rounded-full text-sm font-bold">الحالي</span>
                  </div>
                  <div className="space-y-2 text-sm text-zinc-400">
                    <div>• 5 مستخدمين</div>
                    <div>• الفوترة الأساسية</div>
                    <div>• المخزون الأساسي</div>
                  </div>
                </div>
                <button className="w-full py-3 bg-primary hover:bg-amber-300 text-background rounded-xl font-bold transition-colors">
                  ترقية إلى Pro
                </button>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-6 border-t border-zinc-800 flex justify-end gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-primary hover:bg-amber-300 text-background px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  جاري الحفظ...
                </>
              ) : saved ? (
                <>
                  <span className="text-lg">✓</span>
                  تم الحفظ
                </>
              ) : (
                <>
                  <Save size={18} />
                  حفظ التغييرات
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
