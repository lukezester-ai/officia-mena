/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { db } from '@/lib/db/db';
import { expenses } from '@/lib/db/schema/expenses';
import { eq, desc } from 'drizzle-orm';
import { requireTenant } from '@/lib/auth/get-tenant';
import { revalidatePath } from 'next/cache';

export async function getExpenses() {
  try {
    const tenant = await requireTenant();
    
    const data = await db
      .select({
        id: expenses.id,
        description: expenses.description,
        amount: expenses.amount,
        currency: expenses.currency,
        expenseDate: expenses.expenseDate,
        category: expenses.category,
        status: expenses.status,
      })
      .from(expenses)
      .where(eq(expenses.tenantId, tenant.id))
      .orderBy(desc(expenses.createdAt))
      .limit(50);
      
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createExpense(data: {
  description: string;
  amount: number;
  category: string;
  expenseDate: string; // ISO string
}) {
  try {
    const tenant = await requireTenant();
    
    await db.insert(expenses).values({
      tenantId: tenant.id,
      description: data.description,
      amount: data.amount.toString(),
      category: data.category,
      expenseDate: new Date(data.expenseDate),
      status: 'pending',
    });
    
    revalidatePath('/dashboard/expenses');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
