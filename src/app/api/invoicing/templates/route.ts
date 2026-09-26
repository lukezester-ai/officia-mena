import { NextRequest, NextResponse } from 'next/server';
import { requireTenant, requireRole } from '@/lib/auth';
import {
  createInvoiceTemplate,
  getInvoiceTemplates,
  getDefaultTemplate,
  setDefaultTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  applyTemplateToInvoice,
  getTemplateUsageStats,
  getDefaultLayout,
} from '@/lib/invoicing';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'list') {
      const templates = await getInvoiceTemplates(tenant.id);
      return NextResponse.json({ success: true, data: templates });
    }

    if (action === 'default') {
      const template = await getDefaultTemplate(tenant.id);
      return NextResponse.json({ success: true, data: template });
    }

    if (action === 'default-layout') {
      const layout = getDefaultLayout();
      return NextResponse.json({ success: true, data: layout });
    }

    if (action === 'usage-stats') {
      const stats = await getTemplateUsageStats(tenant.id);
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
      const { name, description, templateType, layout, defaultVatRate, paymentTerms, currency } = body;
      const userId = (await requireTenant()).id; // Would need actual user ID

      const template = await createInvoiceTemplate({
        tenantId: tenant.id,
        name,
        description,
        templateType,
        layout,
        defaultVatRate,
        paymentTerms,
        currency,
        userId,
      });

      return NextResponse.json({ success: true, data: template });
    }

    if (action === 'set-default') {
      const { templateId } = body;

      const template = await setDefaultTemplate(templateId, tenant.id);
      return NextResponse.json({ success: true, data: template });
    }

    if (action === 'duplicate') {
      const { templateId, newName } = body;

      const template = await duplicateTemplate(templateId, tenant.id, newName);
      return NextResponse.json({ success: true, data: template });
    }

    if (action === 'apply-to-invoice') {
      const { templateId, invoiceId } = body;

      const result = await applyTemplateToInvoice(invoiceId, templateId);
      return NextResponse.json({ success: true, data: result });
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
      const { templateId, updates } = body;

      const template = await updateTemplate(templateId, tenant.id, updates);
      return NextResponse.json({ success: true, data: template });
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
    const templateId = searchParams.get('templateId');

    if (!templateId) {
      return NextResponse.json({ success: false, error: 'Template ID is required' }, { status: 400 });
    }

    await deleteTemplate(templateId, tenant.id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
