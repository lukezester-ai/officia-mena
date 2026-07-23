import { NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { expenses } from '@/lib/db/schema/expenses';
import { invoices } from '@/lib/db/schema/invoices';
import { generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { Resend } from 'resend';

// Vercel CRON Jobs require authorization in production if configured, but for simplicity here we just run it.
export async function GET(req: Request) {
  try {
    // 1. Fetch Data
    const allExpenses = await db.select().from(expenses);
    const allInvoices = await db.select().from(invoices);

    const totalExpenses = allExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const totalInvoices = allInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    const unpaidInvoices = allInvoices.filter(i => i.status !== 'paid');

    const dataSummary = `
      البيانات المالية الحالية:
      - إجمالي النفقات: ${totalExpenses} ريال
      - إجمالي الفواتير الصادرة (المبيعات): ${totalInvoices} ريال
      - عدد الفواتير غير المدفوعة: ${unpaidInvoices.length}

      تفاصيل النفقات:
      ${allExpenses.map(e => `- ${e.description}: ${e.amount} ريال (${e.category})`).join('\n')}
    `;

    // 2. Generate Analysis using Maestro
    const anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || 'fake-key'
    });

    // Fallback if no real key is present for demo
    let analysisText = '';
    if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.startsWith('sk-ant')) {
      const { text } = await generateText({
        model: anthropic('claude-3-5-sonnet-latest'),
        system: 'You are the Chief AI Officer (المايسترو) of Officia MENA. You analyze financial data proactively. Write a professional, concise email to the Director in Arabic, summarizing the financial status, highlighting any risks (like unpaid invoices or high expenses), and providing actionable recommendations. Format it nicely with bullet points.',
        prompt: `Here is the data for this week:\n${dataSummary}`
      });
      analysisText = text;
    } else {
      analysisText = `
مرحباً أيها المدير،

أنا المايسترو، الذكاء الاصطناعي لشركتك. 
أود إعلامك بأن إجمالي المصروفات بلغ ${totalExpenses} ريال مقارنة بالمبيعات التي بلغت ${totalInvoices} ريال.
يوجد ${unpaidInvoices.length} فاتورة غير مدفوعة تحتاج لمتابعة.

تحياتي،
المايسترو
      `;
    }

    // 3. Send Email
    const resend = new Resend(process.env.RESEND_API_KEY || 're_fake');
    
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Maestro AI <onboarding@resend.dev>', // Resend testing domain
        to: ['info@agrinexus.eu'],
        subject: 'التقرير المالي الأسبوعي من المايسترو (AI) 📊',
        html: `<div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                ${analysisText.replace(/\n/g, '<br>')}
               </div>`,
      });
    } else {
      console.log('Skipping real email send because RESEND_API_KEY is not configured. Email content:', analysisText);
    }

    return NextResponse.json({ success: true, message: 'Analysis generated and email queued.' });

  } catch (error: any) {
    console.error('Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
