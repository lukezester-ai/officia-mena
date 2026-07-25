import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { db } from '@/lib/db/db';
import { subscriptions } from '@/lib/db/schema/subscriptions';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';
import { generateZatcaQr } from '@/lib/billing/generate-zatca-invoice';
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

      // Generate ZATCA QR Code and Send Invoice Email
      try {
        const amount = (session.amount_total || 0) / 100; // in SAR/EUR
        const currency = (session.currency || 'SAR').toUpperCase();
        const vatRate = 0.15; // 15% KSA VAT
        const subtotal = amount / (1 + vatRate);
        const vatAmount = amount - subtotal;
        
        const invoiceNumber = `INV-${Math.floor(Math.random() * 1000000)}`;
        const timestamp = new Date().toISOString();
        
        // Agri Nexus Ltd details
        const sellerName = "Agri Nexus Ltd";
        const sellerVat = "300000000000003"; // Placeholder or real VAT
        
        const zatcaQr = generateZatcaQr(
          sellerName,
          sellerVat,
          timestamp,
          amount.toFixed(2),
          vatAmount.toFixed(2)
        );

        const customerEmail = session.customer_details?.email || 'customer@example.com';
        
        // Send email via Resend
        await resend.emails.send({
          from: 'Officia MENA <info@agrinexus.eu>',
          to: [customerEmail],
          subject: `Your Subscription Invoice - ${invoiceNumber}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-w-2xl; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
              <h1 style="color: #d4af37;">Officia MENA - Tax Invoice</h1>
              <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
              <hr/>
              <div style="display: flex; justify-content: space-between;">
                <div>
                  <h3 style="margin-bottom: 5px;">Seller</h3>
                  <p style="margin: 0;"><strong>${sellerName}</strong></p>
                  <p style="margin: 0;">VAT Number: ${sellerVat}</p>
                  <p style="margin: 0;">Email: info@agrinexus.eu</p>
                </div>
                <div style="text-align: right;">
                  <h3 style="margin-bottom: 5px;">Buyer</h3>
                  <p style="margin: 0;">Customer ID: ${session.customer}</p>
                  <p style="margin: 0;">Tenant ID: ${tenantId}</p>
                </div>
              </div>
              <hr/>
              <table style="width: 100%; text-align: left; margin: 20px 0; border-collapse: collapse;">
                <tr style="background: #f9f9f9;">
                  <th style="padding: 10px; border: 1px solid #ddd;">Description</th>
                  <th style="padding: 10px; border: 1px solid #ddd;">Total</th>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">Officia MENA Subscription (${planId})</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${amount.toFixed(2)} ${currency}</td>
                </tr>
              </table>
              <div style="text-align: right; margin-top: 20px;">
                <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)} ${currency}</p>
                <p><strong>VAT (15%):</strong> ${vatAmount.toFixed(2)} ${currency}</p>
                <h2 style="color: #d4af37;">Total: ${amount.toFixed(2)} ${currency}</h2>
              </div>
              <div style="margin-top: 40px; text-align: center;">
                <p style="color: #666; font-size: 12px;">ZATCA E-Invoice QR Code:</p>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(zatcaQr)}" alt="ZATCA QR Code" />
              </div>
            </div>
          `,
        });
        console.log(`ZATCA Invoice sent to ${customerEmail}`);
      } catch (err) {
        console.error("Failed to generate/send ZATCA invoice", err);
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
