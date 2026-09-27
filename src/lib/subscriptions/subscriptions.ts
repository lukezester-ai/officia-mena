import { db } from '@/lib/db/db';
import {
  subscriptionPlans,
  subscriptionAddOns,
  subscriptionAddOnEnrollments,
  subscriptionUsage,
  paymentMethods,
  subscriptionInvoices,
  subscriptionPayments,
  subscriptionEvents,
  discountCodes,
  discountRedemptions,
  subscriptionAnalytics,
} from '@/lib/db/schema/subscription_extensions';
import { eq, and, desc, gte, lte } from 'drizzle-orm';

export interface PlanInput {
  tenantId: string;
  name: string;
  description?: string;
  stripePriceId?: string;
  amount: number;
  currency?: string;
  interval: 'month' | 'year';
  intervalCount?: number;
  trialPeriodDays?: number;
  features?: string[];
  limits?: any;
  isPublic?: boolean;
  sortOrder?: number;
}

export async function createSubscriptionPlan(input: PlanInput) {
  const [plan] = await db
    .insert(subscriptionPlans)
    .values({
      tenantId: input.tenantId,
      name: input.name,
      description: input.description,
      stripePriceId: input.stripePriceId,
      amount: input.amount.toFixed(2),
      currency: input.currency || 'USD',
      interval: input.interval,
      intervalCount: input.intervalCount || 1,
      trialPeriodDays: input.trialPeriodDays || 0,
      features: input.features as any,
      limits: input.limits as any,
      isPublic: input.isPublic !== undefined ? input.isPublic : true,
      sortOrder: input.sortOrder || 0,
      isActive: true,
    })
    .returning();

  return plan;
}

export async function getSubscriptionPlans(tenantId: string, isPublic?: boolean) {
  const query = db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.tenantId, tenantId));

  if (isPublic !== undefined) {
    query.where(and(eq(subscriptionPlans.tenantId, tenantId), eq(subscriptionPlans.isPublic, isPublic)));
  }

  return query.orderBy(subscriptionPlans.sortOrder, subscriptionPlans.amount);
}

export async function updatePlan(planId: string, tenantId: string, updates: Partial<PlanInput & { isActive: boolean }>) {
  const [plan] = await db
    .update(subscriptionPlans)
    .set({
      ...updates,
      amount: updates.amount?.toFixed(2),
      features: updates.features as any,
      limits: updates.limits as any,
      updatedAt: new Date(),
    })
    .where(and(eq(subscriptionPlans.id, planId), eq(subscriptionPlans.tenantId, tenantId)))
    .returning();

  return plan;
}

export async function deletePlan(planId: string, tenantId: string) {
  await db
    .update(subscriptionPlans)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(subscriptionPlans.id, planId), eq(subscriptionPlans.tenantId, tenantId)));
}

export async function createAddOn(tenantId: string, name: string, description: string, stripePriceId: string, amount: number, interval: 'month' | 'year', features: string[]) {
  const [addOn] = await db
    .insert(subscriptionAddOns)
    .values({
      tenantId,
      name,
      description,
      stripePriceId,
      amount: amount.toFixed(2),
      currency: 'USD',
      interval,
      features: features as any,
      isActive: true,
    })
    .returning();

  return addOn;
}

export async function getAddOns(tenantId: string) {
  return db
    .select()
    .from(subscriptionAddOns)
    .where(and(eq(subscriptionAddOns.tenantId, tenantId), eq(subscriptionAddOns.isActive, true)))
    .orderBy(subscriptionAddOns.name);
}

export async function enrollAddOn(tenantId: string, subscriptionId: string, addOnId: string, stripeSubscriptionItemId: string) {
  const [enrollment] = await db
    .insert(subscriptionAddOnEnrollments)
    .values({
      tenantId,
      subscriptionId,
      addOnId,
      stripeSubscriptionItemId,
      isActive: true,
    })
    .returning();

  return enrollment;
}

export async function recordUsage(tenantId: string, subscriptionId: string, metricName: string, metricValue: number, unit: string, periodStart: Date, periodEnd: Date) {
  const [usage] = await db
    .insert(subscriptionUsage)
    .values({
      tenantId,
      subscriptionId,
      metricName,
      metricValue: metricValue.toFixed(2),
      unit,
      periodStart,
      periodEnd,
    })
    .returning();

  return usage;
}

export async function getUsage(tenantId: string, subscriptionId: string, metricName?: string, periodStart?: Date, periodEnd?: Date) {
  const query = db
    .select()
    .from(subscriptionUsage)
    .where(and(eq(subscriptionUsage.tenantId, tenantId), eq(subscriptionUsage.subscriptionId, subscriptionId)));

  if (metricName) {
    query.where(and(
      eq(subscriptionUsage.tenantId, tenantId),
      eq(subscriptionUsage.subscriptionId, subscriptionId),
      eq(subscriptionUsage.metricName, metricName)
    ));
  }

  if (periodStart && periodEnd) {
    query.where(and(
      eq(subscriptionUsage.tenantId, tenantId),
      eq(subscriptionUsage.subscriptionId, subscriptionId),
      gte(subscriptionUsage.periodStart, periodStart),
      lte(subscriptionUsage.periodEnd, periodEnd)
    ));
  }

  return query.orderBy(desc(subscriptionUsage.periodStart));
}

export async function addPaymentMethod(tenantId: string, userId: string, stripePaymentMethodId: string, type: 'card' | 'bank_account', last4: string, brand?: string, expiryMonth?: number, expiryYear?: number) {
  const [method] = await db
    .insert(paymentMethods)
    .values({
      tenantId,
      userId,
      stripePaymentMethodId,
      type,
      last4,
      brand,
      expiryMonth,
      expiryYear,
      isDefault: false,
      isActive: true,
    })
    .returning();

  return method;
}

export async function getPaymentMethods(tenantId: string, userId: string) {
  return db
    .select()
    .from(paymentMethods)
    .where(and(eq(paymentMethods.tenantId, tenantId), eq(paymentMethods.userId, userId), eq(paymentMethods.isActive, true)))
    .orderBy(desc(paymentMethods.isDefault), paymentMethods.createdAt);
}

export async function setDefaultPaymentMethod(methodId: string, tenantId: string) {
  // Remove default from all methods for this user
  await db
    .update(paymentMethods)
    .set({ isDefault: false, updatedAt: new Date() })
    .where(and(eq(paymentMethods.tenantId, tenantId), eq(paymentMethods.userId, (await db.select({ userId: paymentMethods.userId }).from(paymentMethods).where(eq(paymentMethods.id, methodId)).limit(1))[0]?.userId)));

  // Set new default
  const [method] = await db
    .update(paymentMethods)
    .set({ isDefault: true, updatedAt: new Date() })
    .where(eq(paymentMethods.id, methodId))
    .returning();

  return method;
}

export async function createDiscountCode(tenantId: string, code: string, description: string, discountType: 'percentage' | 'fixed_amount', discountValue: number, validFrom: Date, validUntil: Date, maxUses?: number, appliesTo?: string[]) {
  const [discount] = await db
    .insert(discountCodes)
    .values({
      tenantId,
      code,
      description,
      discountType,
      discountValue: discountValue.toFixed(2),
      appliesTo: appliesTo as any,
      maxUses,
      validFrom,
      validUntil,
      isActive: true,
    })
    .returning();

  return discount;
}

export async function validateDiscountCode(tenantId: string, code: string, planId?: string) {
  const [discount] = await db
    .select()
    .from(discountCodes)
    .where(and(
      eq(discountCodes.tenantId, tenantId),
      eq(discountCodes.code, code),
      eq(discountCodes.isActive, true)
    ))
    .limit(1);

  if (!discount) {
    return { valid: false, reason: 'Discount code not found or inactive' };
  }

  const now = new Date();
  if (now < discount.validFrom || now > discount.validUntil) {
    return { valid: false, reason: 'Discount code expired' };
  }

  if (discount.maxUses && discount.usedCount >= discount.maxUses) {
    return { valid: false, reason: 'Discount code usage limit reached' };
  }

  const appliesTo = discount.appliesTo as string[];
  if (appliesTo && !appliesTo.includes('all') && planId && !appliesTo.includes(planId)) {
    return { valid: false, reason: 'Discount code not applicable to this plan' };
  }

  return {
    valid: true,
    discount: {
      type: discount.discountType,
      value: Number(discount.discountValue),
      currency: discount.currency,
    },
  };
}

export async function redeemDiscountCode(tenantId: string, code: string, subscriptionId: string, discountAmount: number) {
  const [discount] = await db
    .select()
    .from(discountCodes)
    .where(and(
      eq(discountCodes.tenantId, tenantId),
      eq(discountCodes.code, code)
    ))
    .limit(1);

  if (!discount) {
    throw new Error('Discount code not found');
  }

  const [redemption] = await db
    .insert(discountRedemptions)
    .values({
      tenantId,
      discountCodeId: discount.id,
      subscriptionId,
      discountAmount: discountAmount.toFixed(2),
    })
    .returning();

  // Update usage count
  await db
    .update(discountCodes)
    .set({ usedCount: discount.usedCount + 1, updatedAt: new Date() })
    .where(eq(discountCodes.id, discount.id));

  return redemption;
}

export async function generateSubscriptionAnalytics(tenantId: string, periodType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual', periodStart: Date, periodEnd: Date) {
  // This would aggregate subscription data for the period
  const analyticsData = {
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    cancelledSubscriptions: 0,
    totalRevenue: 0,
    mrr: 0,
    arr: 0,
    churnRate: 0,
    byPlan: {} as Record<string, number>,
    byInterval: {} as Record<string, number>,
  };

  const [analytics] = await db
    .insert(subscriptionAnalytics)
    .values({
      tenantId,
      periodType,
      periodStart,
      periodEnd,
      totalSubscriptions: analyticsData.totalSubscriptions,
      activeSubscriptions: analyticsData.activeSubscriptions,
      cancelledSubscriptions: analyticsData.cancelledSubscriptions,
      totalRevenue: analyticsData.totalRevenue.toFixed(2),
      mrr: analyticsData.mrr.toFixed(2),
      arr: analyticsData.arr.toFixed(2),
      churnRate: analyticsData.churnRate.toFixed(2),
      data: analyticsData as any,
    })
    .returning();

  return analytics;
}

export async function getSubscriptionAnalytics(tenantId: string, limit = 12) {
  return db
    .select()
    .from(subscriptionAnalytics)
    .where(eq(subscriptionAnalytics.tenantId, tenantId))
    .orderBy(desc(subscriptionAnalytics.periodStart))
    .limit(limit);
}
