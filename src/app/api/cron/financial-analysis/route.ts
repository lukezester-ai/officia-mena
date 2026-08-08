import { NextResponse } from 'next/server';
import { and, eq, inArray } from 'drizzle-orm';
import { generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { Resend } from 'resend';
import { db } from '@/lib/db/db';
import { expenses } from '@/lib/db/schema/expenses';
import { invoices } from '@/lib/db/schema/invoices';
import { tenants } from '@/lib/db/schema/tenants';
import { users } from '@/lib/db/schema/users';
import { requireBearerSecret } from '@/lib/auth/api';
import { getErrorMessage } from '@/lib/errors';

export async function GET(request: Request) {
  const unauthorized = requireBearerSecret(request, 'CRON_SECRET');
  if (unauthorized) return unauthorized;

  try {
    const tenantRows = await db.select().from(tenants);
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
    const results: Array<{ tenantId: string; delivered: boolean }> = [];

    for (const tenant of tenantRows) {
      const [tenantExpenses, tenantInvoices, recipients] = await Promise.all([
        db.select().from(expenses).where(eq(expenses.tenantId, tenant.id)),
        db.select().from(invoices).where(eq(invoices.tenantId, tenant.id)),
        db.select({ email: users.email }).from(users).where(
          and(eq(users.tenantId, tenant.id), inArray(users.role, ['admin', 'finance']))
        ),
      ]);

      const totalExpenses = tenantExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      const totalInvoices = tenantInvoices.reduce((sum, invoice) => sum + Number(invoice.totalAmount), 0);
      const unpaidInvoices = tenantInvoices.filter((invoice) => invoice.status !== 'paid');
      const prompt = [
        `Tenant: ${tenant.name}`,
        `Total expenses: ${totalExpenses} SAR`,
        `Total invoiced: ${totalInvoices} SAR`,
        `Unpaid invoices: ${unpaidInvoices.length}`,
      ].join('\n');

      let analysisText = prompt;
      if (process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant')) {
        const generated = await generateText({
          model: anthropic('claude-3-5-sonnet-latest'),
          system: 'Write a concise Arabic weekly financial report with risks and actions. Never mix data between companies.',
          prompt,
        });
        analysisText = generated.text;
      }

      const recipientEmails = recipients.map(({ email }) => email);
      if (resend && recipientEmails.length > 0) {
        await resend.emails.send({
          from: process.env.REPORT_FROM_EMAIL || 'Officia MENA <onboarding@resend.dev>',
          to: recipientEmails,
          subject: `Officia MENA weekly financial report — ${tenant.name}`,
          html: `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.6">${analysisText.replace(/\n/g, '<br>')}</div>`,
        });
      }
      results.push({ tenantId: tenant.id, delivered: Boolean(resend && recipientEmails.length > 0) });
    }

    return NextResponse.json({ success: true, tenantsProcessed: results.length, results });
  } catch (error: unknown) {
    console.error('Cron Error:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
