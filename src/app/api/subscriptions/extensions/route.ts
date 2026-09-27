import { NextRequest, NextResponse } from 'next/server';
import { requireTenant, requireRole } from '@/lib/auth';
import {
  createSubscriptionPlan,
  getSubscriptionPlans,
  updatePlan,
  deletePlan,
  createAddOn,
  getAddOns,
  enrollAddOn,
  recordUsage,
  getUsage,
  addPaymentMethod,
  getPaymentMethods,
  setDefaultPaymentMethod,
  createDiscountCode,
  validateDiscountCode,
  redeemDiscountCode,
  generateSubscriptionAnalytics,
  getSubscriptionAnalytics,
} from '@/lib/subscriptions';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'plans') {
      const isPublic = searchParams.get('isPublic') === 'true';
      const plans = await getSubscriptionPlans(tenant.id, isPublic);
      return NextResponse.json({ success: true, data: plans });
    }

    if (action === 'add-ons') {
      const addOns = await getAddOns(tenant.id);
      return NextResponse.json({ success: true, data: addOns });
    }

    if (action === 'usage') {
      const subscriptionId = searchParams.get('subscriptionId');
      const metricName = searchParams.get('metricName') || undefined;
      const periodStart = searchParams.get('periodStart');
      const periodEnd = searchParams.get('periodEnd');

      if (!subscriptionId) {
        return NextResponse.json({ success: false, error: 'Subscription ID is required' }, { status: 400 });
      }

      const usage = await getUsage(
        tenant.id,
        subscriptionId,
        metricName,
        periodStart ? new Date(periodStart) : undefined,
        periodEnd ? new Date(periodEnd) : undefined
      );
      return NextResponse.json({ success: true, data: usage });
    }

    if (action === 'payment-methods') {
      const userId = searchParams.get('userId');
      if (!userId) {
        return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
      }

      const methods = await getPaymentMethods(tenant.id, userId);
      return NextResponse.json({ success: true, data: methods });
    }

    if (action === 'validate-discount') {
      const code = searchParams.get('code');
      const planId = searchParams.get('planId') || undefined;

      if (!code) {
        return NextResponse.json({ success: false, error: 'Discount code is required' }, { status: 400 });
      }

      const validation = await validateDiscountCode(tenant.id, code, planId);
      return NextResponse.json({ success: true, data: validation });
    }

    if (action === 'analytics') {
      const limit = Number(searchParams.get('limit')) || 12;
      const analytics = await getSubscriptionAnalytics(tenant.id, limit);
      return NextResponse.json({ success: true, data: analytics });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole('admin', 'finance');
    const tenant = await requireTenant();
    const body = await request.json();
    const { action } = body;

    if (action === 'create-plan') {
      const { name, description, stripePriceId, amount, currency, interval, intervalCount, trialPeriodDays, features, limits, isPublic, sortOrder } = body;

      const plan = await createSubscriptionPlan({
        tenantId: tenant.id,
        name,
        description,
        stripePriceId,
        amount,
        currency,
        interval,
        intervalCount,
        trialPeriodDays,
        features,
        limits,
        isPublic,
        sortOrder,
      });

      return NextResponse.json({ success: true, data: plan });
    }

    if (action === 'create-add-on') {
      const { name, description, stripePriceId, amount, interval, features } = body;

      const addOn = await createAddOn(tenant.id, name, description, stripePriceId, amount, interval, features);
      return NextResponse.json({ success: true, data: addOn });
    }

    if (action === 'enroll-add-on') {
      const { subscriptionId, addOnId, stripeSubscriptionItemId } = body;

      const enrollment = await enrollAddOn(tenant.id, subscriptionId, addOnId, stripeSubscriptionItemId);
      return NextResponse.json({ success: true, data: enrollment });
    }

    if (action === 'record-usage') {
      const { subscriptionId, metricName, metricValue, unit, periodStart, periodEnd } = body;

      const usage = await recordUsage(
        tenant.id,
        subscriptionId,
        metricName,
        metricValue,
        unit,
        new Date(periodStart),
        new Date(periodEnd)
      );
      return NextResponse.json({ success: true, data: usage });
    }

    if (action === 'add-payment-method') {
      const { userId, stripePaymentMethodId, type, last4, brand, expiryMonth, expiryYear } = body;

      const method = await addPaymentMethod(tenant.id, userId, stripePaymentMethodId, type, last4, brand, expiryMonth, expiryYear);
      return NextResponse.json({ success: true, data: method });
    }

    if (action === 'create-discount') {
      const { code, description, discountType, discountValue, validFrom, validUntil, maxUses, appliesTo } = body;

      const discount = await createDiscountCode(
        tenant.id,
        code,
        description,
        discountType,
        discountValue,
        new Date(validFrom),
        new Date(validUntil),
        maxUses,
        appliesTo
      );
      return NextResponse.json({ success: true, data: discount });
    }

    if (action === 'redeem-discount') {
      const { code, subscriptionId, discountAmount } = body;

      const redemption = await redeemDiscountCode(tenant.id, code, subscriptionId, discountAmount);
      return NextResponse.json({ success: true, data: redemption });
    }

    if (action === 'generate-analytics') {
      const { periodType, periodStart, periodEnd } = body;

      const analytics = await generateSubscriptionAnalytics(
        tenant.id,
        periodType,
        new Date(periodStart),
        new Date(periodEnd)
      );
      return NextResponse.json({ success: true, data: analytics });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireRole('admin', 'finance');
    const tenant = await requireTenant();
    const body = await request.json();
    const { action } = body;

    if (action === 'update-plan') {
      const { planId, updates } = body;

      const plan = await updatePlan(planId, tenant.id, updates);
      return NextResponse.json({ success: true, data: plan });
    }

    if (action === 'set-default-payment') {
      const { methodId } = body;

      const method = await setDefaultPaymentMethod(methodId, tenant.id);
      return NextResponse.json({ success: true, data: method });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireRole('admin', 'finance');
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'delete-plan') {
      const planId = searchParams.get('planId');
      if (!planId) {
        return NextResponse.json({ success: false, error: 'Plan ID is required' }, { status: 400 });
      }

      await deletePlan(planId, tenant.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
