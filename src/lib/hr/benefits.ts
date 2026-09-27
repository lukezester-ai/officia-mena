import { db } from '@/lib/db/db';
import {
  benefitPlans,
  employeeBenefitEnrollments,
} from '@/lib/db/schema/hr_extensions';
import { eq, and, desc } from 'drizzle-orm';

export interface BenefitPlanInput {
  tenantId: string;
  name: string;
  description?: string;
  type: 'health' | 'dental' | 'vision' | 'life' | 'retirement' | 'other';
  employerContribution: number;
  employeeContribution: number;
  effectiveDate: Date;
  expiryDate?: Date;
}

export async function createBenefitPlan(input: BenefitPlanInput) {
  const [plan] = await db
    .insert(benefitPlans)
    .values({
      tenantId: input.tenantId,
      name: input.name,
      description: input.description,
      type: input.type,
      employerContribution: input.employerContribution.toFixed(2),
      employeeContribution: input.employeeContribution.toFixed(2),
      effectiveDate: input.effectiveDate,
      expiryDate: input.expiryDate,
      isActive: true,
    })
    .returning();

  return plan;
}

export async function getBenefitPlans(tenantId: string) {
  return db
    .select()
    .from(benefitPlans)
    .where(and(eq(benefitPlans.tenantId, tenantId), eq(benefitPlans.isActive, true)))
    .orderBy(benefitPlans.name);
}

export async function updateBenefitPlan(
  planId: string,
  tenantId: string,
  updates: Partial<BenefitPlanInput & { isActive: boolean }>
) {
  const [plan] = await db
    .update(benefitPlans)
    .set({
      ...updates,
      employerContribution: updates.employerContribution?.toFixed(2),
      employeeContribution: updates.employeeContribution?.toFixed(2),
      updatedAt: new Date(),
    })
    .where(and(eq(benefitPlans.id, planId), eq(benefitPlans.tenantId, tenantId)))
    .returning();

  return plan;
}

export async function deleteBenefitPlan(planId: string, tenantId: string) {
  await db
    .update(benefitPlans)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(benefitPlans.id, planId), eq(benefitPlans.tenantId, tenantId)));
}

export interface BenefitEnrollmentInput {
  tenantId: string;
  employeeId: string;
  benefitPlanId: string;
  enrollmentDate: Date;
  coverageLevel?: 'employee_only' | 'employee_spouse' | 'employee_family';
  dependents?: any;
}

export async function enrollEmployeeInBenefit(input: BenefitEnrollmentInput) {
  const [enrollment] = await db
    .insert(employeeBenefitEnrollments)
    .values({
      tenantId: input.tenantId,
      employeeId: input.employeeId,
      benefitPlanId: input.benefitPlanId,
      enrollmentDate: input.enrollmentDate,
      coverageLevel: input.coverageLevel || 'employee_only',
      dependents: input.dependents as any,
      status: 'active',
    })
    .returning();

  return enrollment;
}

export async function getEmployeeBenefitEnrollments(employeeId: string, tenantId: string) {
  return db
    .select()
    .from(employeeBenefitEnrollments)
    .where(and(eq(employeeBenefitEnrollments.employeeId, employeeId), eq(employeeBenefitEnrollments.tenantId, tenantId)))
    .orderBy(desc(employeeBenefitEnrollments.enrollmentDate));
}

export async function updateBenefitEnrollment(
  enrollmentId: string,
  tenantId: string,
  updates: Partial<BenefitEnrollmentInput & { status: string }>
) {
  const [enrollment] = await db
    .update(employeeBenefitEnrollments)
    .set({
      ...updates,
      dependents: updates.dependents as any,
      updatedAt: new Date(),
    })
    .where(and(eq(employeeBenefitEnrollments.id, enrollmentId), eq(employeeBenefitEnrollments.tenantId, tenantId)))
    .returning();

  return enrollment;
}

export async function suspendBenefitEnrollment(enrollmentId: string, tenantId: string) {
  const [enrollment] = await db
    .update(employeeBenefitEnrollments)
    .set({
      status: 'suspended',
      updatedAt: new Date(),
    })
    .where(and(eq(employeeBenefitEnrollments.id, enrollmentId), eq(employeeBenefitEnrollments.tenantId, tenantId)))
    .returning();

  return enrollment;
}

export async function terminateBenefitEnrollment(enrollmentId: string, tenantId: string) {
  const [enrollment] = await db
    .update(employeeBenefitEnrollments)
    .set({
      status: 'terminated',
      updatedAt: new Date(),
    })
    .where(and(eq(employeeBenefitEnrollments.id, enrollmentId), eq(employeeBenefitEnrollments.tenantId, tenantId)))
    .returning();

  return enrollment;
}

export async function reactivateBenefitEnrollment(enrollmentId: string, tenantId: string) {
  const [enrollment] = await db
    .update(employeeBenefitEnrollments)
    .set({
      status: 'active',
      updatedAt: new Date(),
    })
    .where(and(eq(employeeBenefitEnrollments.id, enrollmentId), eq(employeeBenefitEnrollments.tenantId, tenantId)))
    .returning();

  return enrollment;
}

export async function deleteBenefitEnrollment(enrollmentId: string, tenantId: string) {
  await db
    .delete(employeeBenefitEnrollments)
    .where(and(eq(employeeBenefitEnrollments.id, enrollmentId), eq(employeeBenefitEnrollments.tenantId, tenantId)));
}

export async function getEmployeeBenefitsSummary(employeeId: string, tenantId: string) {
  const enrollments = await getEmployeeBenefitEnrollments(employeeId, tenantId);

  const summary = {
    totalBenefits: enrollments.length,
    activeBenefits: enrollments.filter(e => e.status === 'active').length,
    suspendedBenefits: enrollments.filter(e => e.status === 'suspended').length,
    terminatedBenefits: enrollments.filter(e => e.status === 'terminated').length,
    totalMonthlyCost: 0,
    benefits: [],
  };

  for (const enrollment of enrollments) {
    const [plan] = await db
      .select()
      .from(benefitPlans)
      .where(eq(benefitPlans.id, enrollment.benefitPlanId))
      .limit(1);

    if (plan) {
      const monthlyCost = Number(plan.employerContribution) + Number(plan.employeeContribution);
      summary.totalMonthlyCost += monthlyCost;

      summary.benefits.push({
        planName: plan.name,
        type: plan.type,
        status: enrollment.status,
        coverageLevel: enrollment.coverageLevel,
        employerContribution: plan.employerContribution,
        employeeContribution: plan.employeeContribution,
        monthlyCost: monthlyCost.toFixed(2),
        enrollmentDate: enrollment.enrollmentDate,
      });
    }
  }

  summary.totalMonthlyCost = summary.totalMonthlyCost.toFixed(2) as any;

  return summary;
}

export async function getBenefitEnrollmentsByPlan(benefitPlanId: string, tenantId: string) {
  return db
    .select()
    .from(employeeBenefitEnrollments)
    .where(and(
      eq(employeeBenefitEnrollments.benefitPlanId, benefitPlanId),
      eq(employeeBenefitEnrollments.tenantId, tenantId)
    ))
    .orderBy(desc(employeeBenefitEnrollments.enrollmentDate));
}

export async function getExpiringBenefits(tenantId: string, daysThreshold = 30) {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

  const plans = await db
    .select()
    .from(benefitPlans)
    .where(and(
      eq(benefitPlans.tenantId, tenantId),
      eq(benefitPlans.isActive, true),
      lte(benefitPlans.expiryDate, thresholdDate)
    ))
    .orderBy(benefitPlans.expiryDate);

  return plans;
}

export async function getBenefitPlanStatistics(tenantId: string) {
  const plans = await getBenefitPlans(tenantId);

  const stats = {
    totalPlans: plans.length,
    byType: {} as Record<string, number>,
    totalEnrollments: 0,
    activeEnrollments: 0,
  };

  for (const plan of plans) {
    stats.byType[plan.type] = (stats.byType[plan.type] || 0) + 1;

    const enrollments = await getBenefitEnrollmentsByPlan(plan.id, tenantId);
    stats.totalEnrollments += enrollments.length;
    stats.activeEnrollments += enrollments.filter(e => e.status === 'active').length;
  }

  return stats;
}
