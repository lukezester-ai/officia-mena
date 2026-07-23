/* eslint-disable @typescript-eslint/no-explicit-any */
 
'use server';

import { db } from '@/lib/db/db';
import { employees } from '@/lib/db/schema/hr';
import { eq, and } from 'drizzle-orm';
import { requireTenant } from '@/lib/auth/get-tenant';
import { generateSifCsv, WPSEmployee } from '@/lib/hr/wps-generator';

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

    return { success: true, data: csvData };
  } catch (error: any) {
    console.error('Error generating WPS file:', error);
    return { success: false, error: error.message || 'حدث خطأ غير متوقع.' };
  }
}
