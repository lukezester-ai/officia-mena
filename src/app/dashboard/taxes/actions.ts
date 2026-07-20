/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { db } from '@/lib/db/db';
import { invoices } from '@/lib/db/schema/invoices';
import { expenses } from '@/lib/db/schema/expenses';
import { eq, and } from 'drizzle-orm';
import { requireTenant } from '@/lib/auth/get-tenant';

export async function generateVatReturn(month: number, year: number) {
  try {
    const tenant = await requireTenant();

    // In a real app we would filter by month/year using dates.
    // For this demo, we'll fetch all issued invoices and all expenses for the tenant to show the calculation.
    
    // 1. Get Sales (Invoices) - Outbound VAT
    const allInvoices = await db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenant.id),
          eq(invoices.status, 'issued')
        )
      );

    let totalSales = 0;
    let totalSalesVat = 0;
    
    allInvoices.forEach(inv => {
      totalSales += parseFloat(inv.subtotal || '0');
      totalSalesVat += parseFloat(inv.vatAmount || '0');
    });

    // 2. Get Purchases (Expenses) - Inbound VAT
    const allExpenses = await db
      .select()
      .from(expenses)
      .where(eq(expenses.tenantId, tenant.id));

    let totalPurchases = 0;
    let totalPurchasesVat = 0;

    allExpenses.forEach(exp => {
      const totalAmount = parseFloat(exp.amount || '0');
      // Assuming expenses are 15% VAT inclusive for this MENA demo
      const subtotal = totalAmount / 1.15;
      const vat = totalAmount - subtotal;
      
      totalPurchases += subtotal;
      totalPurchasesVat += vat;
    });

    // 3. Calculate VAT Liability
    // VAT Due = Output VAT (Sales) - Input VAT (Purchases)
    const netVatDue = totalSalesVat - totalPurchasesVat;

    return {
      success: true,
      data: {
        period: `${year}-${month.toString().padStart(2, '0')}`,
        sales: {
          total: totalSales,
          vat: totalSalesVat
        },
        purchases: {
          total: totalPurchases,
          vat: totalPurchasesVat
        },
        netVatDue: netVatDue
      }
    };

  } catch (error: any) {
    console.error('VAT Return Error:', error);
    return { success: false, error: error.message };
  }
}
