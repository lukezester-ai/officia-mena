// @ts-nocheck
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { db } from '@/lib/db/db';
import { subscriptions } from '@/lib/db/schema/subscriptions';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === 'checkout.session.completed') {
    // Retrieve the subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    const tenantId = session.metadata?.tenantId;
    const planId = session.metadata?.planId;

    if (tenantId && planId) {
      // Create or update the subscription in our database
      const existingSub = await db.select().from(subscriptions).where(eq(subscriptions.tenantId, tenantId)).limit(1);
      
      if (existingSub.length > 0) {
        await db.update(subscriptions)
          .set({
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            planId: planId,
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            updatedAt: new Date()
          })
          .where(eq(subscriptions.tenantId, tenantId));
      } else {
        await db.insert(subscriptions).values({
          tenantId: tenantId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          planId: planId,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000)
        });
      }
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    
    // Find our subscription record by stripeCustomerId
    const existingSub = await db.select().from(subscriptions).where(eq(subscriptions.stripeCustomerId, subscription.customer as string)).limit(1);
    
    if (existingSub.length > 0) {
      await db.update(subscriptions)
        .set({
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          updatedAt: new Date()
        })
        .where(eq(subscriptions.stripeCustomerId, subscription.customer as string));
    }
  }

  return new NextResponse('Webhook processed', { status: 200 });
}
