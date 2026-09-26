import { NextRequest, NextResponse } from 'next/server';
import { requireTenant, requireRole } from '@/lib/auth';
import {
  createCustomAccount,
  getCustomAccounts,
  getAllAccounts,
  getAccountHierarchy,
  updateAccount,
  deactivateAccount,
  validateAccountCode,
  getAccountByCode,
  importAccounts,
  exportAccounts,
  getAccountUsageStats,
} from '@/lib/accounting';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'list') {
      const accounts = await getAllAccounts(tenant.id);
      return NextResponse.json({ success: true, data: accounts });
    }

    if (action === 'custom') {
      const accounts = await getCustomAccounts(tenant.id);
      return NextResponse.json({ success: true, data: accounts });
    }

    if (action === 'hierarchy') {
      const hierarchy = await getAccountHierarchy(tenant.id);
      return NextResponse.json({ success: true, data: hierarchy });
    }

    if (action === 'validate-code') {
      const code = searchParams.get('code');
      const excludeId = searchParams.get('excludeId') || undefined;

      if (!code) {
        return NextResponse.json({ success: false, error: 'Account code is required' }, { status: 400 });
      }

      const isValid = await validateAccountCode(tenant.id, code, excludeId);
      return NextResponse.json({ success: true, data: { isValid } });
    }

    if (action === 'by-code') {
      const code = searchParams.get('code');

      if (!code) {
        return NextResponse.json({ success: false, error: 'Account code is required' }, { status: 400 });
      }

      const account = await getAccountByCode(tenant.id, code);
      return NextResponse.json({ success: true, data: account });
    }

    if (action === 'export') {
      const accounts = await exportAccounts(tenant.id);
      return NextResponse.json({ success: true, data: accounts });
    }

    if (action === 'usage-stats') {
      const stats = await getAccountUsageStats(tenant.id);
      return NextResponse.json({ success: true, data: stats });
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

    if (action === 'create') {
      const { code, name, type, normalBalance, description } = body;
      const userId = (await requireTenant()).id; // Would need actual user ID

      const account = await createCustomAccount({
        tenantId: tenant.id,
        code,
        name,
        type,
        normalBalance,
        description,
        userId,
      });

      return NextResponse.json({ success: true, data: account });
    }

    if (action === 'import') {
      const { accountsData } = body;
      const userId = (await requireTenant()).id; // Would need actual user ID

      const results = await importAccounts(tenant.id, accountsData, userId);
      return NextResponse.json({ success: true, data: results });
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

    if (action === 'update') {
      const { accountId, updates } = body;

      const account = await updateAccount(accountId, tenant.id, updates);
      return NextResponse.json({ success: true, data: account });
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
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json({ success: false, error: 'Account ID is required' }, { status: 400 });
    }

    await deactivateAccount(accountId, tenant.id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
