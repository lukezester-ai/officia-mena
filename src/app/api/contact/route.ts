import { createHash } from 'node:crypto';
import { z } from 'zod';
import { sendIntegrationEmail } from '@/lib/integrations/connectors';

const contactSchema = z.object({ name: z.string().trim().min(2).max(120), email: z.string().trim().email().max(255),
  company: z.string().trim().max(160).optional().default(''), message: z.string().trim().min(10).max(5_000),
  website: z.string().max(0).optional().default('') });

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!);
}

export async function POST(request: Request) {
  const parsed = contactSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'بيانات النموذج غير صالحة.' }, { status: 400 });
  if (parsed.data.website) return Response.json({ success: true });
  const { name, email, company, message } = parsed.data;
  const bucket = new Date().toISOString().slice(0, 13);
  const idempotencyKey = createHash('sha256').update(`contact:${email}:${message}:${bucket}`).digest('hex');
  const text = [`New Officia MENA enquiry`, `Name: ${name}`, `Email: ${email}`, `Company: ${company || '—'}`, '', message].join('\n');
  try {
    await sendIntegrationEmail({ to: process.env.CONTACT_TO_EMAIL || 'info@agrinexus.eu', replyTo: email,
      subject: `Officia MENA enquiry — ${name}`, text,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>Officia MENA enquiry</h2><p><b>Name:</b> ${escapeHtml(name)}</p><p><b>Email:</b> ${escapeHtml(email)}</p><p><b>Company:</b> ${escapeHtml(company || '—')}</p><hr><p>${escapeHtml(message).replace(/\n/g, '<br>')}</p></div>`,
      idempotencyKey });
    return Response.json({ success: true });
  } catch (error) {
    console.error('Contact email failed:', error);
    return Response.json({ error: 'تعذر إرسال الرسالة حالياً. يرجى المحاولة لاحقاً.' }, { status: 503 });
  }
}
