import { tool } from 'ai';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/db';
import { requireTenant } from '@/lib/auth/get-tenant';
import { bankAccounts, bankTransactions } from '@/lib/db/schema/bank';
import { expenses } from '@/lib/db/schema/expenses';
import { employees, employeeDocuments, payrollRuns } from '@/lib/db/schema/hr';
import { installments } from '@/lib/db/schema/installments';
import { inventoryLevels, products, warehouses } from '@/lib/db/schema/inventory';
import { invoices } from '@/lib/db/schema/invoices';

type KnowledgeDomain = 'finance' | 'inventory' | 'hr' | 'banking' | 'all';

type KnowledgeRecord = {
  id: string;
  domain: Exclude<KnowledgeDomain, 'all'>;
  title: string;
  summary: string;
  metadata?: Record<string, string | number | boolean | null>;
};

const money = (value: string | number | null | undefined) => Number.parseFloat(String(value ?? '0')) || 0;

const toDate = (value: string | Date | null | undefined) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const daysUntil = (value: string | Date | null | undefined) => {
  const date = toDate(value);
  if (!date) return null;
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((date.getTime() - Date.now()) / msPerDay);
};

const isoDate = (value: string | Date | null | undefined) => {
  const date = toDate(value);
  return date ? date.toISOString().slice(0, 10) : null;
};

const textScore = (record: KnowledgeRecord, query: string) => {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length === 0) return 1;

  const haystack = `${record.domain} ${record.title} ${record.summary} ${JSON.stringify(record.metadata ?? {})}`.toLowerCase();
  return tokens.reduce((score, token) => score + (haystack.includes(token) ? 1 : 0), 0);
};

async function getTenantRecords(domains: KnowledgeDomain[] = ['all']) {
  const tenant = await requireTenant();
  const includeAll = domains.includes('all') || domains.length === 0;
  const include = (domain: KnowledgeDomain) => includeAll || domains.includes(domain);
  const records: KnowledgeRecord[] = [];

  if (include('finance')) {
    const [invoiceRows, expenseRows, installmentRows] = await Promise.all([
      db.select().from(invoices).where(eq(invoices.tenantId, tenant.id)),
      db.select().from(expenses).where(eq(expenses.tenantId, tenant.id)),
      db.select().from(installments).where(eq(installments.tenantId, tenant.id)),
    ]);

    records.push(
      ...invoiceRows.map((invoice) => ({
        id: invoice.id,
        domain: 'finance' as const,
        title: `Invoice ${invoice.invoiceNumber} - ${invoice.clientName}`,
        summary: [
          `Status: ${invoice.status ?? 'unknown'}`,
          `Total: ${money(invoice.totalAmount)} ${invoice.currency ?? 'SAR'}`,
          `VAT: ${money(invoice.vatAmount)} at ${money(invoice.vatRate)}%`,
          `Issue date: ${isoDate(invoice.issueDate) ?? 'unknown'}`,
          `Due date: ${isoDate(invoice.dueDate) ?? 'not set'}`,
          `ZATCA reported: ${invoice.isZatcaReported ? 'yes' : 'no'}`,
        ].join('. '),
        metadata: {
          sourceTable: 'invoices',
          clientName: invoice.clientName,
          status: invoice.status,
          totalAmount: money(invoice.totalAmount),
          currency: invoice.currency,
        },
      })),
      ...expenseRows.map((expense) => ({
        id: expense.id,
        domain: 'finance' as const,
        title: `Expense - ${expense.description}`,
        summary: [
          `Status: ${expense.status ?? 'unknown'}`,
          `Amount: ${money(expense.amount)} ${expense.currency ?? 'SAR'}`,
          `Category: ${expense.category ?? 'uncategorized'}`,
          `Date: ${isoDate(expense.expenseDate) ?? 'unknown'}`,
        ].join('. '),
        metadata: {
          sourceTable: 'expenses',
          status: expense.status,
          amount: money(expense.amount),
          category: expense.category,
        },
      })),
      ...installmentRows.map((installment) => ({
        id: installment.id,
        domain: 'finance' as const,
        title: `Installment ${installment.id}`,
        summary: [
          `Invoice ID: ${installment.invoiceId}`,
          `Status: ${installment.status ?? 'unknown'}`,
          `Amount: ${money(installment.amount)} SAR`,
          `Due date: ${isoDate(installment.dueDate) ?? 'unknown'}`,
        ].join('. '),
        metadata: {
          sourceTable: 'installments',
          invoiceId: installment.invoiceId,
          status: installment.status,
          amount: money(installment.amount),
        },
      })),
    );
  }

  if (include('inventory')) {
    const [productRows, levelRows, warehouseRows] = await Promise.all([
      db.select().from(products).where(eq(products.tenantId, tenant.id)),
      db.select().from(inventoryLevels).where(eq(inventoryLevels.tenantId, tenant.id)),
      db.select().from(warehouses).where(eq(warehouses.tenantId, tenant.id)),
    ]);

    records.push(
      ...productRows.map((product) => {
        const relatedLevels = levelRows.filter((level) => level.productId === product.id);
        const totalQuantity = relatedLevels.reduce((sum, level) => sum + level.quantity, 0);
        const warehouseNames = relatedLevels
          .map((level) => warehouseRows.find((warehouse) => warehouse.id === level.warehouseId)?.name)
          .filter(Boolean)
          .join(', ');

        return {
          id: product.id,
          domain: 'inventory' as const,
          title: `${product.name} (${product.sku})`,
          summary: [
            `Category: ${product.category ?? 'uncategorized'}`,
            `Stock quantity: ${totalQuantity}`,
            `Minimum stock level: ${product.minStockLevel ?? 0}`,
            `Unit price: ${money(product.unitPrice)} SAR`,
            `Cost price: ${money(product.costPrice)} SAR`,
            `Warehouses: ${warehouseNames || 'none'}`,
            `Halal certified: ${product.isHalalCertified ? 'yes' : 'no'}`,
            `Halal expiry: ${isoDate(product.halalExpiryDate) ?? 'not set'}`,
            `Fertilizer: ${product.isFertilizer ? 'yes' : 'no'}`,
            `Security clearance expiry: ${isoDate(product.securityClearanceExpiry) ?? 'not set'}`,
          ].join('. '),
          metadata: {
            sourceTable: 'products',
            sku: product.sku,
            totalQuantity,
            minStockLevel: product.minStockLevel,
            margin: money(product.unitPrice) - money(product.costPrice),
          },
        };
      }),
    );
  }

  if (include('hr')) {
    const [employeeRows, documentRows, payrollRows] = await Promise.all([
      db.select().from(employees).where(eq(employees.tenantId, tenant.id)),
      db.select().from(employeeDocuments).where(eq(employeeDocuments.tenantId, tenant.id)),
      db.select().from(payrollRuns).where(eq(payrollRuns.tenantId, tenant.id)),
    ]);

    records.push(
      ...employeeRows.map((employee) => ({
        id: employee.id,
        domain: 'hr' as const,
        title: `${employee.firstName} ${employee.lastName}`,
        summary: [
          `Employee ID: ${employee.employeeId}`,
          `Nationality: ${employee.nationality ?? 'unknown'}`,
          `Status: ${employee.status ?? 'unknown'}`,
          `Basic salary: ${money(employee.basicSalary)} SAR`,
          `Join date: ${isoDate(employee.joinDate) ?? 'unknown'}`,
        ].join('. '),
        metadata: {
          sourceTable: 'employees',
          employeeId: employee.employeeId,
          status: employee.status,
          salary: money(employee.basicSalary),
        },
      })),
      ...documentRows.map((document) => ({
        id: document.id,
        domain: 'hr' as const,
        title: `${document.documentType} document`,
        summary: [
          `Employee record ID: ${document.employeeId}`,
          `Document number: ${document.documentNumber ?? 'not set'}`,
          `Expiry date: ${isoDate(document.expiryDate) ?? 'unknown'}`,
          `Days until expiry: ${daysUntil(document.expiryDate) ?? 'unknown'}`,
        ].join('. '),
        metadata: {
          sourceTable: 'employee_documents',
          employeeId: document.employeeId,
          documentType: document.documentType,
          daysUntilExpiry: daysUntil(document.expiryDate),
        },
      })),
      ...payrollRows.map((payroll) => ({
        id: payroll.id,
        domain: 'hr' as const,
        title: `Payroll ${payroll.periodMonth}/${payroll.periodYear}`,
        summary: [
          `Total amount: ${money(payroll.totalAmount)} SAR`,
          `WPS status: ${payroll.wpsStatus ?? 'unknown'}`,
          `Created: ${isoDate(payroll.createdAt) ?? 'unknown'}`,
        ].join('. '),
        metadata: {
          sourceTable: 'payroll_runs',
          periodMonth: money(payroll.periodMonth),
          periodYear: money(payroll.periodYear),
          wpsStatus: payroll.wpsStatus,
          totalAmount: money(payroll.totalAmount),
        },
      })),
    );
  }

  if (include('banking')) {
    const [accountRows, transactionRows] = await Promise.all([
      db.select().from(bankAccounts).where(eq(bankAccounts.tenantId, tenant.id)),
      db.select().from(bankTransactions).where(eq(bankTransactions.tenantId, tenant.id)),
    ]);

    records.push(
      ...accountRows.map((account) => ({
        id: account.id,
        domain: 'banking' as const,
        title: `${account.bankName} - ${account.accountName}`,
        summary: [
          `IBAN: ${account.iban}`,
          `Balance: ${money(account.currentBalance)} ${account.currency ?? 'SAR'}`,
          `Status: ${account.status ?? 'unknown'}`,
        ].join('. '),
        metadata: {
          sourceTable: 'bank_accounts',
          bankName: account.bankName,
          balance: money(account.currentBalance),
          currency: account.currency,
          status: account.status,
        },
      })),
      ...transactionRows.map((transaction) => ({
        id: transaction.id,
        domain: 'banking' as const,
        title: `Bank transaction - ${transaction.description}`,
        summary: [
          `Type: ${transaction.type}`,
          `Amount: ${money(transaction.amount)} SAR`,
          `Status: ${transaction.status ?? 'unknown'}`,
          `Date: ${isoDate(transaction.transactionDate) ?? 'unknown'}`,
          `Reference: ${transaction.reference ?? 'none'}`,
        ].join('. '),
        metadata: {
          sourceTable: 'bank_transactions',
          type: transaction.type,
          amount: money(transaction.amount),
          status: transaction.status,
        },
      })),
    );
  }

  return { tenant, records };
}

export const hrTools = {
  getExpiringIqamas: tool({
    description: 'Fetch real employee documents whose Iqama or residency documents are expired or expiring soon.',
    inputSchema: z.object({
      withinDays: z.number().int().min(1).max(365).default(60).describe('Expiry window in days.'),
    }),
    execute: async ({ withinDays }) => {
      const tenant = await requireTenant();
      const [employeeRows, documentRows] = await Promise.all([
        db.select().from(employees).where(eq(employees.tenantId, tenant.id)),
        db.select().from(employeeDocuments).where(eq(employeeDocuments.tenantId, tenant.id)),
      ]);

      const employeeById = new Map(employeeRows.map((employee) => [employee.id, employee]));
      const expiringDocuments = documentRows
        .map((document) => {
          const remainingDays = daysUntil(document.expiryDate);
          const employee = employeeById.get(document.employeeId);
          return {
            employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown employee',
            employeeId: employee?.employeeId ?? document.employeeId,
            documentType: document.documentType,
            documentNumber: document.documentNumber,
            expiryDate: isoDate(document.expiryDate),
            daysUntilExpiry: remainingDays,
            status: remainingDays === null
              ? 'unknown'
              : remainingDays < 0
                ? 'expired'
                : remainingDays <= withinDays
                  ? 'expiring_soon'
                  : 'valid',
          };
        })
        .filter((document) => document.daysUntilExpiry !== null && document.daysUntilExpiry <= withinDays)
        .sort((a, b) => (a.daysUntilExpiry ?? 0) - (b.daysUntilExpiry ?? 0));

      return {
        tenantId: tenant.id,
        totalActiveEmployees: employeeRows.filter((employee) => employee.status === 'ACTIVE').length,
        withinDays,
        expiringDocuments,
      };
    },
  }),

  getPayrollSummary: tool({
    description: 'Fetch real payroll run totals and WPS status from the database.',
    inputSchema: z.object({
      year: z.number().int().optional().describe('Filter by payroll year.'),
      month: z.number().int().min(1).max(12).optional().describe('Filter by payroll month.'),
    }),
    execute: async ({ year, month }) => {
      const tenant = await requireTenant();
      const [employeeRows, payrollRows] = await Promise.all([
        db.select().from(employees).where(eq(employees.tenantId, tenant.id)),
        db.select().from(payrollRuns).where(eq(payrollRuns.tenantId, tenant.id)),
      ]);

      const filteredRuns = payrollRows.filter((run) => {
        const runYear = money(run.periodYear);
        const runMonth = money(run.periodMonth);
        return (year ? runYear === year : true) && (month ? runMonth === month : true);
      });

      return {
        tenantId: tenant.id,
        activeEmployees: employeeRows.filter((employee) => employee.status === 'ACTIVE').length,
        totalMonthlyBaseSalary: employeeRows
          .filter((employee) => employee.status === 'ACTIVE')
          .reduce((sum, employee) => sum + money(employee.basicSalary), 0),
        payrollRuns: filteredRuns.map((run) => ({
          id: run.id,
          periodMonth: money(run.periodMonth),
          periodYear: money(run.periodYear),
          totalAmount: money(run.totalAmount),
          wpsStatus: run.wpsStatus,
          createdAt: isoDate(run.createdAt),
        })),
      };
    },
  }),
};

export const inventoryTools = {
  getComplianceRisks: tool({
    description: 'Check real inventory for MENA compliance risks such as expired Halal certificates, expired security clearances, low stock, and negative margins.',
    inputSchema: z.object({
      includeLowStock: z.boolean().default(true),
    }),
    execute: async ({ includeLowStock }) => {
      const tenant = await requireTenant();
      const [productRows, levelRows] = await Promise.all([
        db.select().from(products).where(eq(products.tenantId, tenant.id)),
        db.select().from(inventoryLevels).where(eq(inventoryLevels.tenantId, tenant.id)),
      ]);

      const complianceRisks = productRows.flatMap((product) => {
        const totalQuantity = levelRows
          .filter((level) => level.productId === product.id)
          .reduce((sum, level) => sum + level.quantity, 0);
        const risks = [];
        const halalDays = daysUntil(product.halalExpiryDate);
        const clearanceDays = daysUntil(product.securityClearanceExpiry);
        const margin = money(product.unitPrice) - money(product.costPrice);

        if (product.isHalalCertified && halalDays !== null && halalDays <= 30) {
          risks.push({
            sku: product.sku,
            productName: product.name,
            severity: halalDays < 0 ? 'high' : 'medium',
            issue: halalDays < 0 ? 'Halal certificate expired' : 'Halal certificate expiring soon',
            actionRequired: 'Renew certificate before selling regulated food products.',
            expiryDate: isoDate(product.halalExpiryDate),
          });
        }

        if (product.isFertilizer && clearanceDays !== null && clearanceDays <= 30) {
          risks.push({
            sku: product.sku,
            productName: product.name,
            severity: clearanceDays < 0 ? 'high' : 'medium',
            issue: clearanceDays < 0 ? 'Security clearance expired' : 'Security clearance expiring soon',
            actionRequired: 'Pause sales until Ministry clearance is renewed.',
            expiryDate: isoDate(product.securityClearanceExpiry),
          });
        }

        if (includeLowStock && totalQuantity <= (product.minStockLevel ?? 0)) {
          risks.push({
            sku: product.sku,
            productName: product.name,
            severity: totalQuantity === 0 ? 'high' : 'medium',
            issue: 'Low stock',
            actionRequired: 'Create a purchase order or transfer stock from another warehouse.',
            currentQuantity: totalQuantity,
            minStockLevel: product.minStockLevel,
          });
        }

        if (product.costPrice && margin < 0) {
          risks.push({
            sku: product.sku,
            productName: product.name,
            severity: 'high',
            issue: 'Negative margin',
            actionRequired: 'Correct pricing before issuing new invoices.',
            unitPrice: money(product.unitPrice),
            costPrice: money(product.costPrice),
          });
        }

        return risks;
      });

      return {
        tenantId: tenant.id,
        checkedProducts: productRows.length,
        complianceRisks,
      };
    },
  }),
};

export const financeTools = {
  getExecutiveSnapshot: tool({
    description: 'Fetch a real executive snapshot across invoices, expenses, receivables, bank balances, HR, and inventory.',
    inputSchema: z.object({}),
    execute: async () => {
      const tenant = await requireTenant();
      const [
        invoiceRows,
        expenseRows,
        installmentRows,
        accountRows,
        employeeRows,
        productRows,
        levelRows,
      ] = await Promise.all([
        db.select().from(invoices).where(eq(invoices.tenantId, tenant.id)),
        db.select().from(expenses).where(eq(expenses.tenantId, tenant.id)),
        db.select().from(installments).where(eq(installments.tenantId, tenant.id)),
        db.select().from(bankAccounts).where(eq(bankAccounts.tenantId, tenant.id)),
        db.select().from(employees).where(eq(employees.tenantId, tenant.id)),
        db.select().from(products).where(eq(products.tenantId, tenant.id)),
        db.select().from(inventoryLevels).where(eq(inventoryLevels.tenantId, tenant.id)),
      ]);

      const revenue = invoiceRows.reduce((sum, invoice) => sum + money(invoice.totalAmount), 0);
      const totalExpenses = expenseRows.reduce((sum, expense) => sum + money(expense.amount), 0);
      const receivables = installmentRows
        .filter((installment) => installment.status === 'pending')
        .reduce((sum, installment) => sum + money(installment.amount), 0);
      const bankBalance = accountRows.reduce((sum, account) => sum + money(account.currentBalance), 0);
      const stockUnits = levelRows.reduce((sum, level) => sum + level.quantity, 0);
      const lowStockProducts = productRows.filter((product) => {
        const totalQuantity = levelRows
          .filter((level) => level.productId === product.id)
          .reduce((sum, level) => sum + level.quantity, 0);
        return totalQuantity <= (product.minStockLevel ?? 0);
      }).length;

      return {
        tenantId: tenant.id,
        finance: {
          invoiceCount: invoiceRows.length,
          revenue,
          totalExpenses,
          netOperatingCash: revenue - totalExpenses,
          pendingReceivables: receivables,
          bankBalance,
        },
        inventory: {
          productCount: productRows.length,
          stockUnits,
          lowStockProducts,
        },
        hr: {
          employeeCount: employeeRows.length,
          activeEmployees: employeeRows.filter((employee) => employee.status === 'ACTIVE').length,
          monthlyBaseSalary: employeeRows.reduce((sum, employee) => sum + money(employee.basicSalary), 0),
        },
      };
    },
  }),
};

export const knowledgeTools = {
  searchBusinessKnowledge: tool({
    description: 'Lightweight RAG retrieval over the tenant business database. Use before answering questions that need company-specific context.',
    inputSchema: z.object({
      query: z.string().describe('Natural language search query.'),
      domains: z.array(z.enum(['finance', 'inventory', 'hr', 'banking', 'all'])).default(['all']),
      limit: z.number().int().min(1).max(12).default(6),
    }),
    execute: async ({ query, domains, limit }) => {
      const { tenant, records } = await getTenantRecords(domains);
      const results = records
        .map((record) => ({ ...record, score: textScore(record, query) }))
        .filter((record) => record.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return {
        tenantId: tenant.id,
        query,
        retrievalMode: 'structured_keyword_rag',
        resultCount: results.length,
        results,
      };
    },
  }),
};

export const maestroTools = {
  ...hrTools,
  ...inventoryTools,
  ...financeTools,
  ...knowledgeTools,
};
