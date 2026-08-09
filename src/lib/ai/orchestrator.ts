export type MaestroSpecialist = 'executive' | 'finance' | 'tax' | 'hr' | 'inventory' | 'collections';

type Route = {
  specialist: MaestroSpecialist;
  intent: string;
  toolNames: string[];
  instructions: string;
};

const domains: Array<{ specialist: MaestroSpecialist; intent: string; pattern: RegExp }> = [
  { specialist: 'tax', intent: 'tax_compliance', pattern: /(vat|tax|zatca|trn|ubl|clearance|ддс|данък|затка|ضريبة|زاتكا|فاتورة إلكترونية)/iu },
  { specialist: 'hr', intent: 'people_compliance', pattern: /(employee|payroll|wps|iqama|visa|staff|служител|заплат|персонал|документ|موظف|رواتب|إقامة)/iu },
  { specialist: 'inventory', intent: 'inventory_operations', pattern: /(stock|inventory|warehouse|sku|product|purchase order|наличност|склад|продукт|поръчка|مخزون|مستودع|منتج|طلب شراء)/iu },
  { specialist: 'collections', intent: 'sales_collections', pattern: /(receivable|overdue|client|customer|collection|invoice|просроч|клиент|вземан|фактур|تحصيل|عميل|متأخر|فاتورة)/iu },
  { specialist: 'finance', intent: 'financial_control', pattern: /(finance|accounting|cash|expense|profit|loss|balance|ledger|bank|финанс|счетовод|разход|печалб|загуб|банка|مالية|محاسبة|مصروف|ربح|خسارة|بنك)/iu },
];

const specialistTools: Record<MaestroSpecialist, string[]> = {
  finance: ['getFinancialOverview', 'getRecentTransactions', 'getAssistantInbox', 'searchDocuments', 'proposeDraftExpense'],
  tax: ['getFinancialOverview', 'getRecentTransactions', 'searchZatcaRegulations', 'searchDocuments', 'getAssistantInbox', 'proposeZatcaSubmission'],
  hr: ['getExpiringEmployeeDocuments', 'getPayrollSummary', 'searchDocuments', 'getAssistantInbox'],
  inventory: ['getInventoryRisks', 'getRecentTransactions', 'searchDocuments', 'getAssistantInbox', 'proposeDraftPurchaseOrder'],
  collections: ['getReceivablesAging', 'getRecentTransactions', 'getFinancialOverview', 'searchDocuments', 'getAssistantInbox', 'proposeDraftInvoice', 'proposeEmailSend'],
  executive: ['getFinancialOverview', 'getReceivablesAging', 'getRecentTransactions', 'getExpiringEmployeeDocuments', 'getPayrollSummary', 'getInventoryRisks', 'getAssistantInbox', 'searchDocuments', 'searchZatcaRegulations', 'proposeDraftInvoice', 'proposeDraftExpense', 'proposeDraftPurchaseOrder', 'proposeEmailSend', 'proposeZatcaSubmission'],
};

const instructions: Record<MaestroSpecialist, string> = {
  finance: 'Act as a cautious financial controller. Use ledger-derived calculations and highlight control gaps; do not provide tax conclusions without regulation sources.',
  tax: 'Act as a MENA tax and ZATCA research specialist. Cite retrieved regulation passages, state jurisdiction, and clearly label uncertainty. Never present general guidance as a binding legal opinion.',
  hr: 'Act as an HR compliance assistant. Minimize personal data in responses and focus on deadlines, WPS status and concrete follow-up actions.',
  inventory: 'Act as an inventory planner. Separate observed stock facts from recommendations and never infer demand forecasts without sufficient history.',
  collections: 'Act as a receivables and collections specialist. Prioritize by age and amount while avoiding unsupported claims about customer intent.',
  executive: 'Act as an executive coordinator. Build a short cross-functional view, delegate reasoning by domain, and avoid combining unrelated figures into invented conclusions.',
};

export function routeMaestroRequest(text: string): Route {
  const matches = domains.filter((domain) => domain.pattern.test(text));
  const selected = matches.length === 1 ? matches[0] : null;
  const specialist: MaestroSpecialist = selected?.specialist || 'executive';
  return {
    specialist,
    intent: selected?.intent || (matches.length > 1 ? 'cross_functional' : 'general_business'),
    toolNames: [...specialistTools[specialist], 'rememberExplicitPreference', 'forgetExplicitMemory'],
    instructions: instructions[specialist],
  };
}

export function filterTools<T extends Record<string, unknown>>(tools: T, names: string[]): Partial<T> {
  const allowed = new Set(names);
  return Object.fromEntries(Object.entries(tools).filter(([name]) => allowed.has(name))) as Partial<T>;
}
