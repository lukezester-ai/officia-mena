import { db } from '@/lib/db/db';
import {
  performanceReviews,
  performanceGoals,
} from '@/lib/db/schema/hr_extensions';
import { eq, and, desc } from 'drizzle-orm';

const toDateString = (date: Date) => date.toISOString().slice(0, 10);

export interface PerformanceReviewInput {
  tenantId: string;
  employeeId: string;
  reviewerId: string;
  reviewPeriod: string;
  reviewDate: Date;
  overallRating: number;
  strengths?: string;
  areasForImprovement?: string;
  goals?: string;
  comments?: string;
}

export async function createPerformanceReview(input: PerformanceReviewInput) {
  const [review] = await db
    .insert(performanceReviews)
    .values({
      tenantId: input.tenantId,
      employeeId: input.employeeId,
      reviewerId: input.reviewerId,
      reviewPeriod: input.reviewPeriod,
      reviewDate: toDateString(input.reviewDate),
      overallRating: input.overallRating.toFixed(1),
      strengths: input.strengths,
      areasForImprovement: input.areasForImprovement,
      goals: input.goals,
      comments: input.comments,
      status: 'draft',
    })
    .returning();

  return review;
}

export async function getPerformanceReviews(employeeId: string, tenantId: string) {
  return db
    .select()
    .from(performanceReviews)
    .where(and(eq(performanceReviews.employeeId, employeeId), eq(performanceReviews.tenantId, tenantId)))
    .orderBy(desc(performanceReviews.reviewDate));
}

export async function updatePerformanceReview(
  reviewId: string,
  tenantId: string,
  updates: Partial<PerformanceReviewInput & { status: string }>
) {
  const [review] = await db
    .update(performanceReviews)
    .set({
      reviewPeriod: updates.reviewPeriod,
      reviewDate: updates.reviewDate ? toDateString(updates.reviewDate) : undefined,
      overallRating: updates.overallRating?.toFixed(1),
      strengths: updates.strengths,
      areasForImprovement: updates.areasForImprovement,
      goals: updates.goals,
      comments: updates.comments,
      status: updates.status,
      updatedAt: new Date(),
    })
    .where(and(eq(performanceReviews.id, reviewId), eq(performanceReviews.tenantId, tenantId)))
    .returning();

  return review;
}

export async function submitPerformanceReview(reviewId: string, tenantId: string) {
  const [review] = await db
    .update(performanceReviews)
    .set({
      status: 'submitted',
      updatedAt: new Date(),
    })
    .where(and(eq(performanceReviews.id, reviewId), eq(performanceReviews.tenantId, tenantId)))
    .returning();

  return review;
}

export async function completePerformanceReview(reviewId: string, tenantId: string) {
  const [review] = await db
    .update(performanceReviews)
    .set({
      status: 'reviewed',
      updatedAt: new Date(),
    })
    .where(and(eq(performanceReviews.id, reviewId), eq(performanceReviews.tenantId, tenantId)))
    .returning();

  return review;
}

export async function deletePerformanceReview(reviewId: string, tenantId: string) {
  await db
    .delete(performanceReviews)
    .where(and(eq(performanceReviews.id, reviewId), eq(performanceReviews.tenantId, tenantId)));
}

export interface PerformanceGoalInput {
  tenantId: string;
  employeeId: string;
  title: string;
  description?: string;
  category: 'professional' | 'personal' | 'team';
  targetDate: Date;
  priority?: 'low' | 'medium' | 'high';
  weight?: number;
}

export async function createPerformanceGoal(input: PerformanceGoalInput) {
  const [goal] = await db
    .insert(performanceGoals)
    .values({
      tenantId: input.tenantId,
      employeeId: input.employeeId,
      title: input.title,
      description: input.description,
      category: input.category,
      targetDate: toDateString(input.targetDate),
      priority: input.priority || 'medium',
      weight: input.weight?.toFixed(2) || '1.00',
      progress: 0,
      status: 'active',
    })
    .returning();

  return goal;
}

export async function getPerformanceGoals(employeeId: string, tenantId: string) {
  return db
    .select()
    .from(performanceGoals)
    .where(and(eq(performanceGoals.employeeId, employeeId), eq(performanceGoals.tenantId, tenantId)))
    .orderBy(performanceGoals.targetDate);
}

export async function updatePerformanceGoal(
  goalId: string,
  tenantId: string,
  updates: Partial<PerformanceGoalInput & { progress: number; status: string }>
) {
  const [goal] = await db
    .update(performanceGoals)
    .set({
      title: updates.title,
      description: updates.description,
      category: updates.category,
      targetDate: updates.targetDate ? toDateString(updates.targetDate) : undefined,
      priority: updates.priority,
      weight: updates.weight?.toFixed(2),
      progress: updates.progress,
      status: updates.status,
      updatedAt: new Date(),
    })
    .where(and(eq(performanceGoals.id, goalId), eq(performanceGoals.tenantId, tenantId)))
    .returning();

  return goal;
}

export async function updateGoalProgress(goalId: string, tenantId: string, progress: number) {
  const [goal] = await db
    .update(performanceGoals)
    .set({
      progress,
      status: progress >= 100 ? 'completed' : 'active',
      updatedAt: new Date(),
    })
    .where(and(eq(performanceGoals.id, goalId), eq(performanceGoals.tenantId, tenantId)))
    .returning();

  return goal;
}

export async function completePerformanceGoal(goalId: string, tenantId: string) {
  const [goal] = await db
    .update(performanceGoals)
    .set({
      progress: 100,
      status: 'completed',
      updatedAt: new Date(),
    })
    .where(and(eq(performanceGoals.id, goalId), eq(performanceGoals.tenantId, tenantId)))
    .returning();

  return goal;
}

export async function cancelPerformanceGoal(goalId: string, tenantId: string) {
  const [goal] = await db
    .update(performanceGoals)
    .set({
      status: 'cancelled',
      updatedAt: new Date(),
    })
    .where(and(eq(performanceGoals.id, goalId), eq(performanceGoals.tenantId, tenantId)))
    .returning();

  return goal;
}

export async function deletePerformanceGoal(goalId: string, tenantId: string) {
  await db
    .delete(performanceGoals)
    .where(and(eq(performanceGoals.id, goalId), eq(performanceGoals.tenantId, tenantId)));
}

export async function getOverdueGoals(tenantId: string) {
  const today = new Date();

  const goals = await db
    .select()
    .from(performanceGoals)
    .where(and(
      eq(performanceGoals.tenantId, tenantId),
      eq(performanceGoals.status, 'active')
    ))
    .orderBy(performanceGoals.targetDate);

  const overdue = goals.filter(goal => new Date(goal.targetDate) < today);

  return overdue;
}

export async function getGoalStatistics(employeeId: string, tenantId: string) {
  const goals = await getPerformanceGoals(employeeId, tenantId);

  const stats = {
    total: goals.length,
    active: goals.filter(g => g.status === 'active').length,
    completed: goals.filter(g => g.status === 'completed').length,
    cancelled: goals.filter(g => g.status === 'cancelled').length,
    averageProgress: goals.length > 0
      ? goals.reduce((sum, g) => sum + (g.progress ?? 0), 0) / goals.length
      : 0,
    byCategory: {} as Record<string, number>,
    byPriority: {} as Record<string, number>,
  };

  for (const goal of goals) {
    stats.byCategory[goal.category] = (stats.byCategory[goal.category] || 0) + 1;
    const priority = goal.priority ?? 'medium';
    stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
  }

  return stats;
}

export async function getPerformanceTrend(employeeId: string, tenantId: string) {
  const reviews = await getPerformanceReviews(employeeId, tenantId);

  const trend = reviews
    .filter(r => r.status === 'reviewed')
    .map(r => ({
      period: r.reviewPeriod,
      rating: Number(r.overallRating),
      date: r.reviewDate,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return trend;
}
