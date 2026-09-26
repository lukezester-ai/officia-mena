import { db } from '@/lib/db/db';
import { invoiceTemplates, invoices } from '@/lib/db/schema/invoice_extensions';
import { eq, and, desc } from 'drizzle-orm';

export interface InvoiceTemplateInput {
  tenantId: string;
  name: string;
  description?: string | null;
  templateType: 'standard' | 'custom' | 'recurring';
  layout: any;
  defaultVatRate?: number;
  paymentTerms?: number;
  currency?: string;
  userId: string;
}

export interface TemplateLayout {
  header: {
    showLogo: boolean;
    showCompanyInfo: boolean;
    showDate: boolean;
    showInvoiceNumber: boolean;
  };
  clientSection: {
    showClientInfo: boolean;
    showContactDetails: boolean;
  };
  lineItems: {
    showDescription: boolean;
    showQuantity: boolean;
    showUnitPrice: boolean;
    showAmount: boolean;
    showTotal: boolean;
  };
  totals: {
    showSubtotal: boolean;
    showVat: boolean;
    showTotal: boolean;
    showBalanceDue: boolean;
  };
  footer: {
    showPaymentTerms: boolean;
    showNotes: boolean;
    showThankYou: boolean;
    customText?: string;
  };
  styling: {
    primaryColor: string;
    secondaryColor: string;
    font: string;
    logoPosition: 'left' | 'center' | 'right';
  };
}

export async function createInvoiceTemplate(input: InvoiceTemplateInput) {
  const [template] = await db
    .insert(invoiceTemplates)
    .values({
      tenantId: input.tenantId,
      name: input.name,
      description: input.description,
      templateType: input.templateType,
      layout: input.layout as any,
      defaultVatRate: input.defaultVatRate?.toFixed(2) || '15.00',
      paymentTerms: input.paymentTerms || 30,
      currency: input.currency || 'SAR',
      isDefault: false,
      createdByUserId: input.userId,
      isActive: true,
    })
    .returning();

  return template;
}

export async function getInvoiceTemplates(tenantId: string) {
  return db
    .select()
    .from(invoiceTemplates)
    .where(and(eq(invoiceTemplates.tenantId, tenantId), eq(invoiceTemplates.isActive, true)))
    .orderBy(desc(invoiceTemplates.isDefault), invoiceTemplates.name);
}

export async function getDefaultTemplate(tenantId: string) {
  const [template] = await db
    .select()
    .from(invoiceTemplates)
    .where(and(eq(invoiceTemplates.tenantId, tenantId), eq(invoiceTemplates.isDefault, true)))
    .limit(1);

  return template;
}

export async function setDefaultTemplate(templateId: string, tenantId: string) {
  // First, remove default from all templates
  await db
    .update(invoiceTemplates)
    .set({ isDefault: false, updatedAt: new Date() })
    .where(eq(invoiceTemplates.tenantId, tenantId));

  // Then set the new default
  const [template] = await db
    .update(invoiceTemplates)
    .set({ isDefault: true, updatedAt: new Date() })
    .where(and(eq(invoiceTemplates.id, templateId), eq(invoiceTemplates.tenantId, tenantId)))
    .returning();

  return template;
}

export async function updateTemplate(
  templateId: string,
  tenantId: string,
  updates: Partial<{
    name: string;
    description: string | null;
    layout: any;
    defaultVatRate: number;
    paymentTerms: number;
    currency: string;
  }>
) {
  const [template] = await db
    .update(invoiceTemplates)
    .set({
      ...updates,
      layout: updates.layout as any,
      defaultVatRate: updates.defaultVatRate?.toFixed(2),
      updatedAt: new Date(),
    })
    .where(and(eq(invoiceTemplates.id, templateId), eq(invoiceTemplates.tenantId, tenantId)))
    .returning();

  return template;
}

export async function deleteTemplate(templateId: string, tenantId: string) {
  await db
    .update(invoiceTemplates)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(invoiceTemplates.id, templateId), eq(invoiceTemplates.tenantId, tenantId)));
}

export async function duplicateTemplate(templateId: string, tenantId: string, newName: string) {
  const [original] = await db
    .select()
    .from(invoiceTemplates)
    .where(and(eq(invoiceTemplates.id, templateId), eq(invoiceTemplates.tenantId, tenantId)))
    .limit(1);

  if (!original) {
    throw new Error('Template not found');
  }

  const [duplicate] = await db
    .insert(invoiceTemplates)
    .values({
      tenantId: original.tenantId,
      name: newName,
      description: original.description,
      templateType: original.templateType,
      layout: original.layout,
      defaultVatRate: original.defaultVatRate,
      paymentTerms: original.paymentTerms,
      currency: original.currency,
      isDefault: false,
      createdByUserId: original.createdByUserId,
      isActive: true,
    })
    .returning();

  return duplicate;
}

export function getDefaultLayout(): TemplateLayout {
  return {
    header: {
      showLogo: true,
      showCompanyInfo: true,
      showDate: true,
      showInvoiceNumber: true,
    },
    clientSection: {
      showClientInfo: true,
      showContactDetails: true,
    },
    lineItems: {
      showDescription: true,
      showQuantity: true,
      showUnitPrice: true,
      showAmount: true,
      showTotal: true,
    },
    totals: {
      showSubtotal: true,
      showVat: true,
      showTotal: true,
      showBalanceDue: true,
    },
    footer: {
      showPaymentTerms: true,
      showNotes: true,
      showThankYou: true,
      customText: '',
    },
    styling: {
      primaryColor: '#1e40af',
      secondaryColor: '#3b82f6',
      font: 'Arial',
      logoPosition: 'left',
    },
  };
}

export async function applyTemplateToInvoice(invoiceId: string, templateId: string) {
  const [template] = await db
    .select()
    .from(invoiceTemplates)
    .where(eq(invoiceTemplates.id, templateId))
    .limit(1);

  if (!template) {
    throw new Error('Template not found');
  }

  // Update invoice with template settings
  const [invoice] = await db
    .update(invoices)
    .set({
      vatRate: template.defaultVatRate,
      currency: template.currency,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, invoiceId))
    .returning();

  return { invoice, template };
}

export async function getTemplateUsageStats(tenantId: string) {
  const templates = await getInvoiceTemplates(tenantId);

  const stats = await Promise.all(
    templates.map(async (template) => {
      // Count invoices using this template (would need template_id in invoices table)
      // For now, return basic info
      return {
        templateId: template.id,
        name: template.name,
        usageCount: 0, // Would count from invoices
        isDefault: template.isDefault,
      };
    })
  );

  return stats;
}
