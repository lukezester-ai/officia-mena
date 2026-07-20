/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { db } from '@/lib/db/db';
import { bankAccounts, bankTransactions } from '@/lib/db/schema/bank';
import { eq, desc } from 'drizzle-orm';
import { requireTenant } from '@/lib/auth/get-tenant';
import { revalidatePath } from 'next/cache';

export async function getBankAccounts() {
  try {
    const tenant = await requireTenant();
    
    // First, check if there are accounts, if not, create mock ones
    let accounts = await db
      .select({
        id: bankAccounts.id,
        bankName: bankAccounts.bankName,
        accountName: bankAccounts.accountName,
        iban: bankAccounts.iban,
        currency: bankAccounts.currency,
        currentBalance: bankAccounts.currentBalance,
      })
      .from(bankAccounts)
      .where(eq(bankAccounts.tenantId, tenant.id));
      
    if (accounts.length === 0) {
      // Mock Data Generation
      await db.insert(bankAccounts).values([
        {
          tenantId: tenant.id,
          bankName: 'Al Rajhi Bank',
          accountName: 'Officia Operating',
          iban: 'SA1280000000001234567890',
          currency: 'SAR',
          currentBalance: '145250.00'
        },
        {
          tenantId: tenant.id,
          bankName: 'Saudi National Bank',
          accountName: 'Officia Payroll',
          iban: 'SA9810000000000987654321',
          currency: 'SAR',
          currentBalance: '485200.00'
        }
      ]);
      
      accounts = await db
        .select({
          id: bankAccounts.id,
          bankName: bankAccounts.bankName,
          accountName: bankAccounts.accountName,
          iban: bankAccounts.iban,
          currency: bankAccounts.currency,
          currentBalance: bankAccounts.currentBalance,
        })
        .from(bankAccounts)
        .where(eq(bankAccounts.tenantId, tenant.id));
        
      // Add some mock transactions for the first account
      if (accounts.length > 0) {
        await db.insert(bankTransactions).values([
          {
            tenantId: tenant.id,
            accountId: accounts[0].id,
            transactionDate: new Date(),
            description: 'Stripe Payout',
            amount: '12500.00',
            type: 'IN',
            status: 'pending'
          },
          {
            tenantId: tenant.id,
            accountId: accounts[0].id,
            transactionDate: new Date(Date.now() - 86400000 * 2), // 2 days ago
            description: 'AWS Cloud Services',
            amount: '850.50',
            type: 'OUT',
            status: 'pending'
          },
          {
            tenantId: tenant.id,
            accountId: accounts[0].id,
            transactionDate: new Date(Date.now() - 86400000 * 5),
            description: 'Office Supplies - Jarir',
            amount: '1200.00',
            type: 'OUT',
            status: 'reconciled'
          }
        ]);
      }
    }
      
    return { success: true, data: accounts };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getBankTransactions(accountId?: string) {
  try {
    const tenant = await requireTenant();
    
    // In a real app we would filter by accountId
    const data = await db
      .select({
        id: bankTransactions.id,
        transactionDate: bankTransactions.transactionDate,
        description: bankTransactions.description,
        amount: bankTransactions.amount,
        type: bankTransactions.type,
        status: bankTransactions.status,
      })
      .from(bankTransactions)
      .where(eq(bankTransactions.tenantId, tenant.id))
      .orderBy(desc(bankTransactions.transactionDate))
      .limit(50);
      
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
