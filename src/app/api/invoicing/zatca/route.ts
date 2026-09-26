import { NextRequest, NextResponse } from 'next/server';
import { requireTenant, requireRole } from '@/lib/auth';
import { createZatcaIntegration } from '@/lib/invoicing';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'connectivity') {
      const integration = createZatcaIntegration({
        apiUrl: process.env.ZATCA_API_URL || 'https://gw-fatoora.zatca.gov.sa',
        csid: process.env.ZATCA_CSID || '',
        csidSecret: process.env.ZATCA_CSID_SECRET || '',
        environment: (process.env.ZATCA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
      });

      const status = await integration.checkConnectivity();
      return NextResponse.json({ success: true, data: status });
    }

    if (action === 'compliance-status') {
      const invoiceHash = searchParams.get('invoiceHash');
      if (!invoiceHash) {
        return NextResponse.json({ success: false, error: 'Invoice hash is required' }, { status: 400 });
      }

      const integration = createZatcaIntegration({
        apiUrl: process.env.ZATCA_API_URL || 'https://gw-fatoora.zatca.gov.sa',
        csid: process.env.ZATCA_CSID || '',
        csidSecret: process.env.ZATCA_CSID_SECRET || '',
        environment: (process.env.ZATCA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
      });

      const status = await integration.getComplianceStatus(invoiceHash);
      return NextResponse.json({ success: true, data: status });
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

    if (action === 'validate') {
      const integration = createZatcaIntegration({
        apiUrl: process.env.ZATCA_API_URL || 'https://gw-fatoora.zatca.gov.sa',
        csid: process.env.ZATCA_CSID || '',
        csidSecret: process.env.ZATCA_CSID_SECRET || '',
        environment: (process.env.ZATCA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
      });

      const validation = await integration.validateInvoice(body.invoice);
      return NextResponse.json({ success: true, data: validation });
    }

    if (action === 'clearance') {
      const integration = createZatcaIntegration({
        apiUrl: process.env.ZATCA_API_URL || 'https://gw-fatoora.zatca.gov.sa',
        csid: process.env.ZATCA_CSID || '',
        csidSecret: process.env.ZATCA_CSID_SECRET || '',
        environment: (process.env.ZATCA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
      });

      const clearance = await integration.submitForClearance(body.invoice);
      return NextResponse.json({ success: true, data: clearance });
    }

    if (action === 'report') {
      const integration = createZatcaIntegration({
        apiUrl: process.env.ZATCA_API_URL || 'https://gw-fatoora.zatca.gov.sa',
        csid: process.env.ZATCA_CSID || '',
        csidSecret: process.env.ZATCA_CSID_SECRET || '',
        environment: (process.env.ZATCA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
      });

      const reporting = await integration.reportToZatca(body.invoice, body.clearanceResponse);
      return NextResponse.json({ success: true, data: reporting });
    }

    if (action === 'generate-compliant') {
      const integration = createZatcaIntegration({
        apiUrl: process.env.ZATCA_API_URL || 'https://gw-fatoora.zatca.gov.sa',
        csid: process.env.ZATCA_CSID || '',
        csidSecret: process.env.ZATCA_CSID_SECRET || '',
        environment: (process.env.ZATCA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
      });

      const compliant = await integration.generateCompliantInvoice(body.invoice);
      return NextResponse.json({ success: true, data: compliant });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
