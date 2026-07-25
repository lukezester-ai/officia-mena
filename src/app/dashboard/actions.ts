'use server';

import { db } from '@/lib/db/db';
import { invoices } from '@/lib/db/schema/invoices';
import { expenses } from '@/lib/db/schema/expenses';
import { aiInboxItems } from '@/lib/db/schema/ai_inbox';
import { eq, sum, count } from 'drizzle-orm';
import { requireTenant } from '@/lib/auth/get-tenant';
import { getErrorMessage, isNextRedirectError } from '@/lib/errors';

export async function getDashboardStats() {
  try {
    const tenant = await requireTenant();

    // 1. Total Revenue (from issued invoices)
    const revenueQuery = await db
      .select({ total: sum(invoices.totalAmount) })
      .from(invoices)
      .where(
        eq(invoices.tenantId, tenant.id)
      );

    const rawRevenue = revenueQuery[0]?.total || '0';
    const totalRevenue = parseFloat(rawRevenue as string);

    // 2. VAT Liability (from issued invoices)
    const vatQuery = await db
      .select({ total: sum(invoices.vatAmount) })
      .from(invoices)
      .where(
        eq(invoices.tenantId, tenant.id)
      );
      
    const rawVat = vatQuery[0]?.total || '0';
    const totalVat = parseFloat(rawVat as string);

    // 3. Total Expenses (from expenses table)
    const expensesQuery = await db
      .select({ total: sum(expenses.amount) })
      .from(expenses)
      .where(
        eq(expenses.tenantId, tenant.id)
      );
      
    const rawExpenses = expensesQuery[0]?.total || '0';
    const totalExpenses = parseFloat(rawExpenses as string);

    // 4. AI Alerts (unread)
    const alertsQuery = await db
      .select({ count: count() })
      .from(aiInboxItems)
      .where(
        eq(aiInboxItems.tenantId, tenant.id)
      );
      
    const alertsCount = alertsQuery[0]?.count || 0;

    // Calculate Cash Balance (Revenue - Expenses)
    // Note: In real accounting, cash balance comes from Bank feeds, but we'll approximate here
    const cashBalance = totalRevenue - totalExpenses;

    return {
      success: true,
      data: {
        cashBalance,
        totalRevenue,
        totalVat,
        totalExpenses,
        alertsCount
      }
    };
  } catch (error: unknown) {
    console.error('Error fetching dashboard stats:', error);
    
    // IMPORTANT: Let Next.js handle redirect errors (thrown by requireTenant)
    if (isNextRedirectError(error)) {
      throw error;
    }
    
    return {
      success: false,
      error: getErrorMessage(error)
    };
  }
}
