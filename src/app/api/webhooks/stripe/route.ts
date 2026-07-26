import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { db } from '@/lib/db/db';
import { subscriptions } from '@/lib/db/schema/subscriptions';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { getErrorMessage } from '@/lib/errors';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

function getCurrentPeriodEnd(subscription: Stripe.Subscription) {
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end;
  return currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null;
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature');

  if (!signature) {
    return new NextResponse('Missing Stripe signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: unknown) {
    return new NextResponse(`Webhook Error: ${getErrorMessage(error)}`, { status: 400 });
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
            currentPeriodEnd: getCurrentPeriodEnd(subscription),
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
          currentPeriodEnd: getCurrentPeriodEnd(subscription)
        });
      }

      // Send payment receipt email
      try {
        const amount = (session.amount_total || 0) / 100;
        const currency = (session.currency || 'EUR').toUpperCase();
        const invoiceNumber = `INV-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000)}`;
        const customerEmail = session.customer_details?.email || 'customer@example.com';
        
        await resend.emails.send({
          from: 'Agri Nexus Ltd <info@agrinexus.eu>',
          to: [customerEmail],
          subject: `Invoice for Officia MENA Subscription - ${invoiceNumber}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; direction: ltr;">
              <h1 style="color: #d4af37;">Officia MENA</h1>
              <p><strong>Invoice No:</strong> ${invoiceNumber}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
              <hr/>
              <div style="display: flex; justify-content: space-between;">
                <div>
                  <h3>Seller</h3>
                  <p><strong>Agri Nexus Ltd</strong></p>
                  <p>EIK: 208692862</p>
                  <p>8 Iskar St, Elin Pelin 2109, Bulgaria</p>
                  <p>Email: info@agrinexus.eu</p>
                </div>
                <div style="text-align: right;">
                  <h3>Buyer</h3>
                  <p>Customer ID: ${session.customer}</p>
                  <p>Tenant ID: ${tenantId}</p>
                </div>
              </div>
              <hr/>
              <table style="width: 100%; text-align: left; border-collapse: collapse;">
                <tr style="background: #f9f9f9;">
                  <th style="padding: 10px; border: 1px solid #ddd;">Description</th>
                  <th style="padding: 10px; border: 1px solid #ddd;">Amount</th>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">Officia MENA Subscription (${planId})</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${amount.toFixed(2)} ${currency}</td>
                </tr>
              </table>
              <div style="text-align: right; margin-top: 20px;">
                <p><strong>Total:</strong> ${amount.toFixed(2)} ${currency}</p>
                <p style="color: #666; font-size: 12px;">VAT not charged — EU reverse charge / Article 113(9) of Bulgarian VAT Act.</p>
              </div>
            </div>
          `,
        });
        console.log(`Invoice sent to ${customerEmail}`);
      } catch (err) {
        console.error("Failed to send invoice email", err);
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
          currentPeriodEnd: getCurrentPeriodEnd(subscription),
          updatedAt: new Date()
        })
        .where(eq(subscriptions.stripeCustomerId, subscription.customer as string));
    }
  }

  return new NextResponse('Webhook processed', { status: 200 });
}
