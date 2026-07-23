'use server';

import { stripe } from '@/lib/stripe/server';
import { db } from '@/lib/db/db';
import { subscriptions } from '@/lib/db/schema/subscriptions';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { requireTenant } from '@/lib/auth/get-tenant';

export async function createCheckoutSession(planId: string) {
  const tenant = await requireTenant();

  const prices: Record<string, string> = {
    'pro': process.env.STRIPE_PRO_PRICE_ID!,
    'enterprise': process.env.STRIPE_ENTERPRISE_PRICE_ID!
  };

  const priceId = prices[planId];
  if (!priceId) throw new Error('Invalid plan');

  // See if tenant already has a stripe customer id in subscriptions
  const subResult = await db.select().from(subscriptions).where(eq(subscriptions.tenantId, tenant.id)).limit(1);
  let customerId = subResult[0]?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      name: tenant.name,
      metadata: { tenantId: tenant.id }
    });
    customerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/settings/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/settings/billing?canceled=true`,
    metadata: { tenantId: tenant.id, planId }
  });

  if (session.url) {
    redirect(session.url);
  }
}

export async function createPortalSession() {
  const tenant = await requireTenant();

  const subResult = await db.select().from(subscriptions).where(eq(subscriptions.tenantId, tenant.id)).limit(1);
  const customerId = subResult[0]?.stripeCustomerId;

  if (!customerId) throw new Error('No billing account found');

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/settings/billing`,
  });

  if (session.url) {
    redirect(session.url);
  }
}
