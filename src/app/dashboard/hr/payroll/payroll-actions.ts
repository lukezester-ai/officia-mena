/* eslint-disable @typescript-eslint/no-explicit-any */
 
'use server';

import { db } from '@/lib/db/db';
import { employees, payrollRuns } from '@/lib/db/schema/hr';
import { eq, and } from 'drizzle-orm';
import { requireTenant } from '@/lib/auth/get-tenant';
import { generateSifCsv, WPSEmployee } from '@/lib/hr/wps-generator';
import { postPayrollAccrual } from '@/lib/accounting/postings';
import { revalidatePath } from 'next/cache';

function employeePayrollTotal(employee: {
  basicSalary: string;
  housingAllowance: string | null;
  transportAllowance: string | null;
}) {
  return (
    Number(employee.basicSalary || 0) +
    Number(employee.housingAllowance || 0) +
    Number(employee.transportAllowance || 0)
  );
}

export async function downloadWpsSif(month: number, year: number): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const tenant = await requireTenant();

    // Fetch active employees
    const activeEmployees = await db
      .select({
        firstName: employees.firstName,
        lastName: employees.lastName,
        nationalIdNumber: employees.nationalIdNumber,
        bankIban: employees.bankIban,
        basicSalary: employees.basicSalary,
        housingAllowance: employees.housingAllowance,
        transportAllowance: employees.transportAllowance,
      })
      .from(employees)
      .where(
        and(
          eq(employees.tenantId, tenant.id),
          eq(employees.status, 'ACTIVE')
        )
      );

    if (activeEmployees.length === 0) {
      return { success: false, error: 'لا يوجد موظفين نشطين لإنشاء ملف.' };
    }

    // Generate SIF CSV
    // Using a dummy establishment ID for now
    const establishmentId = '7001234567';
    
    // The DB returns decimal types as strings, which maps perfectly to our WPSEmployee interface
    const csvData = generateSifCsv(activeEmployees as WPSEmployee[], establishmentId, month, year);
    const totalPayroll = activeEmployees.reduce((sum, employee) => sum + employeePayrollTotal(employee), 0);

    const existingRun = await db
      .select()
      .from(payrollRuns)
      .where(
        and(
          eq(payrollRuns.tenantId, tenant.id),
          eq(payrollRuns.periodMonth, month.toString()),
          eq(payrollRuns.periodYear, year.toString())
        )
      )
      .limit(1);

    const [payrollRun] = existingRun.length > 0
      ? await db
          .update(payrollRuns)
          .set({
            totalAmount: totalPayroll.toFixed(2),
            wpsStatus: 'GENERATED',
          })
          .where(eq(payrollRuns.id, existingRun[0].id))
          .returning()
      : await db
          .insert(payrollRuns)
          .values({
            tenantId: tenant.id,
            periodMonth: month.toString(),
            periodYear: year.toString(),
            totalAmount: totalPayroll.toFixed(2),
            wpsStatus: 'GENERATED',
          })
          .returning();

    await postPayrollAccrual({
      tenantId: tenant.id,
      payrollRunId: payrollRun.id,
      periodMonth: month,
      periodYear: year,
      amount: payrollRun.totalAmount,
      entryDate: new Date(year, month - 1, 1),
    });

    revalidatePath('/dashboard/accounting');
    revalidatePath('/dashboard/hr/payroll');

    return { success: true, data: csvData };
  } catch (error: any) {
    console.error('Error generating WPS file:', error);
    return { success: false, error: error.message || 'حدث خطأ غير متوقع.' };
  }
}
