import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/lib/db/db';
import { subscriptions } from '@/lib/db/schema/subscriptions';
import { tenants } from '@/lib/db/schema/tenants';
import { eq } from 'drizzle-orm';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import { createCheckoutSession, createPortalSession } from './actions';

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const tenantResult = await db.select().from(tenants).where(eq(tenants.ownerId, user.id)).limit(1);
  const tenant = tenantResult[0];

  const subResult = await db.select().from(subscriptions).where(eq(subscriptions.tenantId, tenant.id)).limit(1);
  const subscription = subResult[0];

  const currentPlan = subscription?.planId || 'free';
  const isActive = subscription?.status === 'active';

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-desert-900)] mb-2">الفواتير والاشتراكات</h1>
        <p className="text-[var(--color-desert-600)]">إدارة خطة الاشتراك وطرق الدفع الخاصة بشركتك.</p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-[var(--color-desert-200)] mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-desert-900)] mb-1">الخطة الحالية</h2>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-[var(--color-gold-600)] capitalize">{currentPlan}</span>
              {isActive && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">نشط</span>
              )}
            </div>
          </div>
          
          <form action={createPortalSession}>
            <button 
              type="submit"
              disabled={!subscription?.stripeCustomerId}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <CreditCard size={18} />
              إدارة الفواتير
            </button>
          </form>
        </div>

        <p className="text-gray-600 mb-8 border-b border-gray-100 pb-8">
          أنت حالياً على خطة {currentPlan}. للوصول إلى ميزات الذكاء الاصطناعي والمستخدمين غير المحدودين، قم بالترقية إلى خطة Pro.
        </p>

        <h3 className="font-bold text-lg mb-4">ترقية الاشتراك</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-xl border-2 ${currentPlan === 'pro' ? 'border-[var(--color-gold-500)] bg-[var(--color-gold-50)]' : 'border-gray-200 hover:border-gray-300'}`}>
            <h4 className="font-bold text-xl mb-2">خطة Pro</h4>
            <div className="mb-4">
              <span className="text-2xl font-black">€99</span> <span className="text-gray-500">/ شهرياً</span>
            </div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle2 size={16} className="text-[var(--color-gold-500)]"/> الذكاء الاصطناعي (Maestro)</li>
              <li className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle2 size={16} className="text-[var(--color-gold-500)]"/> مستخدمين غير محدودين</li>
              <li className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle2 size={16} className="text-[var(--color-gold-500)]"/> قراءة الفواتير ذكياً</li>
            </ul>
            
            {currentPlan === 'pro' ? (
               <button disabled className="w-full py-2 bg-[var(--color-gold-500)] text-white rounded-lg font-bold opacity-50">خطتك الحالية</button>
            ) : (
              <form action={createCheckoutSession.bind(null, 'pro')}>
                <button type="submit" className="w-full py-2 bg-[var(--color-gold-500)] hover:bg-[var(--color-gold-600)] text-white rounded-lg font-bold transition-colors">
                  ترقية الآن
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
