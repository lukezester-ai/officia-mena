import { NextRequest, NextResponse } from 'next/server';
import { requireTenant, requireRole } from '@/lib/auth';
import {
  createBenefitPlan,
  getBenefitPlans,
  updateBenefitPlan,
  deleteBenefitPlan,
  enrollEmployeeInBenefit,
  getEmployeeBenefitEnrollments,
  updateBenefitEnrollment,
  suspendBenefitEnrollment,
  terminateBenefitEnrollment,
  reactivateBenefitEnrollment,
  deleteBenefitEnrollment,
  getEmployeeBenefitsSummary,
  getBenefitEnrollmentsByPlan,
  getExpiringBenefits,
  getBenefitPlanStatistics,
} from '@/lib/hr';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'benefit-plans') {
      const plans = await getBenefitPlans(tenant.id);
      return NextResponse.json({ success: true, data: plans });
    }

    if (action === 'employee-enrollments') {
      const employeeId = searchParams.get('employeeId');
      if (!employeeId) {
        return NextResponse.json({ success: false, error: 'Employee ID is required' }, { status: 400 });
      }

      const enrollments = await getEmployeeBenefitEnrollments(employeeId, tenant.id);
      return NextResponse.json({ success: true, data: enrollments });
    }

    if (action === 'benefits-summary') {
      const employeeId = searchParams.get('employeeId');
      if (!employeeId) {
        return NextResponse.json({ success: false, error: 'Employee ID is required' }, { status: 400 });
      }

      const summary = await getEmployeeBenefitsSummary(employeeId, tenant.id);
      return NextResponse.json({ success: true, data: summary });
    }

    if (action === 'plan-enrollments') {
      const benefitPlanId = searchParams.get('benefitPlanId');
      if (!benefitPlanId) {
        return NextResponse.json({ success: false, error: 'Benefit plan ID is required' }, { status: 400 });
      }

      const enrollments = await getBenefitEnrollmentsByPlan(benefitPlanId, tenant.id);
      return NextResponse.json({ success: true, data: enrollments });
    }

    if (action === 'expiring-benefits') {
      const days = Number(searchParams.get('days')) || 30;
      const plans = await getExpiringBenefits(tenant.id, days);
      return NextResponse.json({ success: true, data: plans });
    }

    if (action === 'plan-statistics') {
      const stats = await getBenefitPlanStatistics(tenant.id);
      return NextResponse.json({ success: true, data: stats });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole('admin', 'hr');
    const tenant = await requireTenant();
    const body = await request.json();
    const { action } = body;

    if (action === 'create-benefit-plan') {
      const { name, description, type, employerContribution, employeeContribution, effectiveDate, expiryDate } = body;

      const plan = await createBenefitPlan({
        tenantId: tenant.id,
        name,
        description,
        type,
        employerContribution,
        employeeContribution,
        effectiveDate: new Date(effectiveDate),
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      });

      return NextResponse.json({ success: true, data: plan });
    }

    if (action === 'enroll-employee') {
      const { employeeId, benefitPlanId, enrollmentDate, coverageLevel, dependents } = body;

      const enrollment = await enrollEmployeeInBenefit({
        tenantId: tenant.id,
        employeeId,
        benefitPlanId,
        enrollmentDate: new Date(enrollmentDate),
        coverageLevel,
        dependents,
      });

      return NextResponse.json({ success: true, data: enrollment });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireRole('admin', 'hr');
    const tenant = await requireTenant();
    const body = await request.json();
    const { action } = body;

    if (action === 'update-benefit-plan') {
      const { benefitPlanId, updates } = body;

      const plan = await updateBenefitPlan(benefitPlanId, tenant.id, updates);
      return NextResponse.json({ success: true, data: plan });
    }

    if (action === 'update-enrollment') {
      const { enrollmentId, updates } = body;

      const enrollment = await updateBenefitEnrollment(enrollmentId, tenant.id, updates);
      return NextResponse.json({ success: true, data: enrollment });
    }

    if (action === 'suspend-enrollment') {
      const { enrollmentId } = body;

      const enrollment = await suspendBenefitEnrollment(enrollmentId, tenant.id);
      return NextResponse.json({ success: true, data: enrollment });
    }

    if (action === 'terminate-enrollment') {
      const { enrollmentId } = body;

      const enrollment = await terminateBenefitEnrollment(enrollmentId, tenant.id);
      return NextResponse.json({ success: true, data: enrollment });
    }

    if (action === 'reactivate-enrollment') {
      const { enrollmentId } = body;

      const enrollment = await reactivateBenefitEnrollment(enrollmentId, tenant.id);
      return NextResponse.json({ success: true, data: enrollment });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireRole('admin', 'hr');
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'delete-benefit-plan') {
      const benefitPlanId = searchParams.get('benefitPlanId');
      if (!benefitPlanId) {
        return NextResponse.json({ success: false, error: 'Benefit plan ID is required' }, { status: 400 });
      }

      await deleteBenefitPlan(benefitPlanId, tenant.id);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete-enrollment') {
      const enrollmentId = searchParams.get('enrollmentId');
      if (!enrollmentId) {
        return NextResponse.json({ success: false, error: 'Enrollment ID is required' }, { status: 400 });
      }

      await deleteBenefitEnrollment(enrollmentId, tenant.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
