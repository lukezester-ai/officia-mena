import { Resend } from 'resend';
import { db } from '@/lib/db/db';
import { emailDeliveryEvents } from '@/lib/db/schema/ai_orchestration';

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_WEBHOOK_SECRET) {
    return Response.json({ error: 'Resend webhook is not configured.' }, { status: 503 });
  }
  const payload = await request.text();
  const providerEventId = request.headers.get('svix-id') || request.headers.get('webhook-id');
  const timestamp = request.headers.get('svix-timestamp') || request.headers.get('webhook-timestamp');
  const signature = request.headers.get('svix-signature') || request.headers.get('webhook-signature');
  if (!providerEventId || !timestamp || !signature) return Response.json({ error: 'Missing webhook signature.' }, { status: 400 });
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const event = resend.webhooks.verify({ payload, webhookSecret: process.env.RESEND_WEBHOOK_SECRET,
      headers: { id: providerEventId, timestamp, signature } });
    if (!event.type.startsWith('email.')) return Response.json({ received: true });
    const data = event.data as unknown as { email_id: string; created_at: string; [key: string]: unknown };
    const safeMetadata = event.type === 'email.failed' || event.type === 'email.bounced' || event.type === 'email.suppressed'
      ? { detail: 'Delivery provider reported a terminal delivery issue.' } : null;
    await db.insert(emailDeliveryEvents).values({ providerEventId, emailId: data.email_id, eventType: event.type,
      metadata: safeMetadata, occurredAt: new Date(data.created_at) }).onConflictDoNothing({ target: emailDeliveryEvents.providerEventId });
    return Response.json({ received: true });
  } catch (error) {
    console.error('Invalid Resend webhook:', error);
    return Response.json({ error: 'Invalid webhook signature.' }, { status: 400 });
  }
}
