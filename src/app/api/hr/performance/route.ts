import { NextRequest, NextResponse } from 'next/server';
import { requireTenant, requireRole } from '@/lib/auth';
import {
  createPerformanceReview,
  getPerformanceReviews,
  updatePerformanceReview,
  submitPerformanceReview,
  completePerformanceReview,
  deletePerformanceReview,
  createPerformanceGoal,
  getPerformanceGoals,
  updatePerformanceGoal,
  updateGoalProgress,
  completePerformanceGoal,
  cancelPerformanceGoal,
  deletePerformanceGoal,
  getOverdueGoals,
  getGoalStatistics,
  getPerformanceTrend,
} from '@/lib/hr';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'reviews') {
      const employeeId = searchParams.get('employeeId');
      if (!employeeId) {
        return NextResponse.json({ success: false, error: 'Employee ID is required' }, { status: 400 });
      }

      const reviews = await getPerformanceReviews(employeeId, tenant.id);
      return NextResponse.json({ success: true, data: reviews });
    }

    if (action === 'goals') {
      const employeeId = searchParams.get('employeeId');
      if (!employeeId) {
        return NextResponse.json({ success: false, error: 'Employee ID is required' }, { status: 400 });
      }

      const goals = await getPerformanceGoals(employeeId, tenant.id);
      return NextResponse.json({ success: true, data: goals });
    }

    if (action === 'overdue-goals') {
      const goals = await getOverdueGoals(tenant.id);
      return NextResponse.json({ success: true, data: goals });
    }

    if (action === 'goal-statistics') {
      const employeeId = searchParams.get('employeeId');
      if (!employeeId) {
        return NextResponse.json({ success: false, error: 'Employee ID is required' }, { status: 400 });
      }

      const stats = await getGoalStatistics(employeeId, tenant.id);
      return NextResponse.json({ success: true, data: stats });
    }

    if (action === 'performance-trend') {
      const employeeId = searchParams.get('employeeId');
      if (!employeeId) {
        return NextResponse.json({ success: false, error: 'Employee ID is required' }, { status: 400 });
      }

      const trend = await getPerformanceTrend(employeeId, tenant.id);
      return NextResponse.json({ success: true, data: trend });
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

    if (action === 'create-review') {
      const { employeeId, reviewerId, reviewPeriod, reviewDate, overallRating, strengths, areasForImprovement, goals, comments } = body;

      const review = await createPerformanceReview({
        tenantId: tenant.id,
        employeeId,
        reviewerId,
        reviewPeriod,
        reviewDate: new Date(reviewDate),
        overallRating,
        strengths,
        areasForImprovement,
        goals,
        comments,
      });

      return NextResponse.json({ success: true, data: review });
    }

    if (action === 'create-goal') {
      const { employeeId, title, description, category, targetDate, priority, weight } = body;

      const goal = await createPerformanceGoal({
        tenantId: tenant.id,
        employeeId,
        title,
        description,
        category,
        targetDate: new Date(targetDate),
        priority,
        weight,
      });

      return NextResponse.json({ success: true, data: goal });
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

    if (action === 'update-review') {
      const { reviewId, updates } = body;

      const review = await updatePerformanceReview(reviewId, tenant.id, updates);
      return NextResponse.json({ success: true, data: review });
    }

    if (action === 'submit-review') {
      const { reviewId } = body;

      const review = await submitPerformanceReview(reviewId, tenant.id);
      return NextResponse.json({ success: true, data: review });
    }

    if (action === 'complete-review') {
      const { reviewId } = body;

      const review = await completePerformanceReview(reviewId, tenant.id);
      return NextResponse.json({ success: true, data: review });
    }

    if (action === 'update-goal') {
      const { goalId, updates } = body;

      const goal = await updatePerformanceGoal(goalId, tenant.id, updates);
      return NextResponse.json({ success: true, data: goal });
    }

    if (action === 'update-goal-progress') {
      const { goalId, progress } = body;

      const goal = await updateGoalProgress(goalId, tenant.id, progress);
      return NextResponse.json({ success: true, data: goal });
    }

    if (action === 'complete-goal') {
      const { goalId } = body;

      const goal = await completePerformanceGoal(goalId, tenant.id);
      return NextResponse.json({ success: true, data: goal });
    }

    if (action === 'cancel-goal') {
      const { goalId } = body;

      const goal = await cancelPerformanceGoal(goalId, tenant.id);
      return NextResponse.json({ success: true, data: goal });
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

    if (action === 'delete-review') {
      const reviewId = searchParams.get('reviewId');
      if (!reviewId) {
        return NextResponse.json({ success: false, error: 'Review ID is required' }, { status: 400 });
      }

      await deletePerformanceReview(reviewId, tenant.id);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete-goal') {
      const goalId = searchParams.get('goalId');
      if (!goalId) {
        return NextResponse.json({ success: false, error: 'Goal ID is required' }, { status: 400 });
      }

      await deletePerformanceGoal(goalId, tenant.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
