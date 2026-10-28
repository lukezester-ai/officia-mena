'use client';

import React, { useState, useEffect } from 'react';
import { Crown, Check } from 'lucide-react';

type Subscription = {
  id: string;
  planId: string;
  status: string;
  currentPeriodEnd: Date;
};

export default function SubscriptionsPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/subscriptions/extensions');
        const res = await response.json();
        if (res.success && res.data) {
          setSubscription(res.data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchSubscription();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-desert-900)] mb-2 flex items-center gap-3">
          <Crown className="text-[var(--color-gold-600)] size={32} />
          Subscriptions
        </h1>
        <p className="text-[var(--color-desert-600)]">Manage your subscription</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--color-desert-500)]">Loading...</div>
      ) : (
        <div className="bg-white border border-[var(--color-desert-200)] rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-[var(--color-desert-900)] mb-4">Current Plan</h2>
          {subscription ? (
            <div>
              <div className="text-2xl font-black text-[var(--color-desert-900)] capitalize">
                {subscription.planId}
              </div>
              <div className="text-sm text-[var(--color-desert-600)] mt-1">
                Status: {subscription.status}
              </div>
            </div>
          ) : (
            <div className="text-[var(--color-desert-500)]">No active subscription</div>
          )}
        </div>
      )}
    </div>
  );
}
