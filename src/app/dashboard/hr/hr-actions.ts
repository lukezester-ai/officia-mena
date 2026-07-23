'use server';

import { db } from '@/lib/db/db';
import { employees } from '@/lib/db/schema/hr';
import { requireTenant } from '@/lib/auth/get-tenant';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getErrorMessage, isNextRedirectError } from '@/lib/errors';

export async function getEmployees() {
  try {
    const tenant = await requireTenant();
    const data = await db
      .select()
      .from(employees)
      .where(eq(employees.tenantId, tenant.id))
      .orderBy(desc(employees.createdAt));
    
    return { success: true, data };
  } catch (error: unknown) {
    console.error('Failed to get employees:', error);
    
    if (isNextRedirectError(error)) {
      throw error;
    }
    
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function createEmployee(data: {
  firstName: string;
  lastName: string;
  nationality: string;
  nationalIdNumber: string;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
}) {
  try {
    const tenant = await requireTenant();
    
    // Generate a random internal employee ID like EMP-1024
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const employeeId = `EMP-${randomId}`;

    await db.insert(employees).values({
      tenantId: tenant.id,
      employeeId,
      firstName: data.firstName,
      lastName: data.lastName,
      nationality: data.nationality,
      nationalIdNumber: data.nationalIdNumber,
      basicSalary: data.basicSalary.toString(),
      housingAllowance: data.housingAllowance.toString(),
      transportAllowance: data.transportAllowance.toString(),
      joinDate: new Date().toISOString(), // Today
      status: 'ACTIVE'
    });

    revalidatePath('/dashboard/hr');
    revalidatePath('/dashboard/hr/payroll');
    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to create employee:', error);
    
    if (isNextRedirectError(error)) {
      throw error;
    }
    
    return { success: false, error: getErrorMessage(error) };
  }
}
