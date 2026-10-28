'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Check, AlertCircle, Crown, Sparkles } from 'lucide-react';

type Subscription = {
  id: string;
  planId: string;
  status: string;
  currentPeriodEnd: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
};

type Plan = {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
};

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'SAR',
    interval: 'monthly',
    features: [
      'Up to 5 users',
      'Basic invoicing',
      'Basic inventory',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 299,
    currency: 'SAR',
    interval: 'monthly',
    features: [
      'Up to 25 users',
      'Advanced invoicing',
      'Advanced inventory',
      'HR management',
      'AI features',
      'Priority support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 999,
    currency: 'SAR',
    interval: 'monthly',
    features: [
      'Unlimited users',
      'All Pro features',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
      'On-premise option',
    ],
  },
];

export default function SubscriptionsPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

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
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchSubscription();
  }, []);

  const handleUpgrade = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowUpgradeModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
            <Check size={12} />
            Active
          </span>
        );
      case 'past_due':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs font-bold text-rose-300">
            <AlertCircle size={12} />
            Past Due
          </span>
        );
      case 'canceled':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-400/20 bg-gray-400/10 px-3 py-1 text-xs font-bold text-gray-300">
            Canceled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-desert-900)] mb-2 flex items-center gap-3">
          <Crown className="text-[var(--color-gold-600)] size={32} />
          Subscriptions
        </h1>
        <p className="text-[var(--color-desert-600)]">Manage your subscription and billing</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--color-desert-500)]">Loading...</div>
      ) : (
        <>
          {/* Current Subscription */}
          {subscription && (
            <div className="bg-white border border-[var(--color-desert-200)] rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-[var(--color-desert-900)] mb-4">Current Plan</h2>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black text-[var(--color-desert-900)] capitalize">
                    {subscription.planId}
                  </div>
                  <div className="text-sm text-[var(--color-desert-600)] mt-1">
                    Status: {getStatusBadge(subscription.status)}
                  </div>
                  {subscription.currentPeriodEnd && (
                    <div className="text-sm text-[var(--color-desert-600)] mt-1">
                      Renews: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <button className="bg-[var(--color-gold-500)] hover:bg-[var(--color-gold-600)] text-black font-bold py-2 px-6 rounded-xl transition-colors shadow-sm">
                  Manage Subscription
                </button>
              </div>
            </div>
          )}

          {/* Plans */}
          <div>
            <h2 className="text-xl font-bold text-[var(--color-desert-900)] mb-4">Available Plans</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white border-2 rounded-2xl shadow-sm p-6 transition-all ${
                    subscription?.planId === plan.id
                      ? 'border-[var(--color-gold-500)] ring-4 ring-[var(--color-gold-500)]/10'
                      : 'border-[var(--color-desert-200)] hover:border-[var(--color-desert-300)]'
                  }`}
                >
                  {plan.id === 'enterprise' && (
                    <div className="flex items-center gap-2 text-[var(--color-gold-600)] font-bold mb-4">
                      <Sparkles size={16} />
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-black text-[var(--color-desert-900)] mb-2">{plan.name}</h3>
                  <div className="text-3xl font-black text-[var(--color-desert-900)] mb-4">
                    {plan.price === 0 ? 'Free' : `${plan.price} ${plan.currency}`}
                    {plan.price > 0 && <span className="text-sm font-normal text-[var(--color-desert-600)]">/{plan.interval}</span>}
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-[var(--color-desert-700)]">
                        <Check size={16} className="text-emerald-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleUpgrade(plan)}
                    disabled={subscription?.planId === plan.id}
                    className={`w-full font-bold py-3 rounded-xl transition-colors ${
                      subscription?.planId === plan.id
                        ? 'bg-[var(--color-desert-100)] text-[var(--color-desert-500)] cursor-not-allowed'
                        : 'bg-[var(--color-desert-900)] hover:bg-black text-white'
                    }`}
                  >
                    {subscription?.planId === plan.id ? 'Current Plan' : 'Upgrade'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[var(--color-desert-200)] bg-[var(--color-desert-50)] flex justify-between items-center">
              <h3 className="text-xl font-bold text-[var(--color-desert-900)]">Upgrade to {selectedPlan.name}</h3>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-[var(--color-desert-500)] hover:text-black"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-4xl font-black text-[var(--color-desert-900)]">
                  {selectedPlan.price} {selectedPlan.currency}
                </div>
                <div className="text-sm text-[var(--color-desert-600)]">per {selectedPlan.interval}</div>
              </div>
              <p className="text-[var(--color-desert-600)] text-center mb-6">
                You will be redirected to Stripe to complete your subscription.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 bg-white border border-[var(--color-desert-200)] text-[var(--color-desert-700)] font-bold py-3 rounded-xl hover:bg-[var(--color-desert-50)] transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 bg-[var(--color-gold-500)] hover:bg-[var(--color-gold-600)] text-black font-bold py-3 rounded-xl transition-colors">
                  Continue to Stripe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
