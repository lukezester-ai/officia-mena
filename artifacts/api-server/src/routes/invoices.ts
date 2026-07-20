import { Router } from "express";
import { db } from "@workspace/db";
import { invoicesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  CreateInvoiceBody, UpdateInvoiceBody, UpdateInvoiceParams, GetInvoiceParams,
  ListInvoicesQueryParams,
} from "@workspace/api-zod";

const router = Router();

const ser = (r: typeof invoicesTable.$inferSelect) => ({
  ...r,
  subtotal:  Number(r.subtotal),
  vatAmount: Number(r.vatAmount),
  total:     Number(r.total),
  lineItems: r.lineItems as any[],
  createdAt: r.createdAt.toISOString(),
});

router.get("/invoices", async (req, res) => {
  try {
    const parsed = ListInvoicesQueryParams.safeParse(req.query);
    const { status, type } = parsed.success ? parsed.data : {};
    let query = db.select().from(invoicesTable).$dynamic();
    if (status) query = query.where(eq(invoicesTable.status, status as any));
    if (type)   query = query.where(eq(invoicesTable.type,   type as any));
    const rows = await query.orderBy(sql`${invoicesTable.createdAt} desc`);
    res.json(rows.map(ser));
  } catch (e) { req.log.error(e); res.status(500).json({ error: "internal" }); }
});

router.post("/invoices", async (req, res) => {
  try {
    const body = CreateInvoiceBody.parse(req.body);
    const lineItems = (body.lineItems ?? []) as Array<{quantity:number;unitPrice:number;vatRate:number;discount?:number|null}>;
    const subtotal  = lineItems.reduce((s, l) => s + l.quantity * l.unitPrice * (1 - (l.discount ?? 0) / 100), 0);
    const vatAmount = lineItems.reduce((s, l) => s + l.quantity * l.unitPrice * (l.vatRate / 100), 0);
    const total     = subtotal + vatAmount;
    const count = await db.select({ cnt: sql<number>`count(*)` }).from(invoicesTable);
    const num   = `INV-${String(Number(count[0]?.cnt ?? 0) + 1).padStart(4, "0")}`;
    const contact = body as any;
    const [row] = await db.insert(invoicesTable).values({
      ...body,
      number:      num,
      contactName: contact.contactName ?? "—",
      subtotal:    subtotal.toFixed(2),
      vatAmount:   vatAmount.toFixed(2),
      total:       total.toFixed(2),
      lineItems:   body.lineItems ?? [],
    } as any).returning();
    res.status(201).json(ser(row));
  } catch (e) { req.log.error(e); res.status(400).json({ error: String(e) }); }
});

router.get("/invoices/summary", async (req, res) => {
  try {
    const [r] = await db.select({
      draft:            sql<number>`count(*) filter (where ${invoicesTable.status}='draft')`,
      issued:           sql<number>`count(*) filter (where ${invoicesTable.status}='issued')`,
      paid:             sql<number>`count(*) filter (where ${invoicesTable.status}='paid')`,
      overdue:          sql<number>`count(*) filter (where ${invoicesTable.status}='overdue')`,
      totalReceivable:  sql<number>`coalesce(sum(cast(${invoicesTable.total} as numeric)) filter (where ${invoicesTable.type}='sales'    and ${invoicesTable.status} in ('issued','overdue')),0)`,
      totalPayable:     sql<number>`coalesce(sum(cast(${invoicesTable.total} as numeric)) filter (where ${invoicesTable.type}='purchase' and ${invoicesTable.status} in ('issued','overdue')),0)`,
    }).from(invoicesTable);
    res.json({
      draft:           Number(r?.draft ?? 0),
      issued:          Number(r?.issued ?? 0),
      paid:            Number(r?.paid ?? 0),
      overdue:         Number(r?.overdue ?? 0),
      totalReceivable: Number(r?.totalReceivable ?? 0),
      totalPayable:    Number(r?.totalPayable ?? 0),
    });
  } catch (e) { req.log.error(e); res.status(500).json({ error: "internal" }); }
});

router.get("/invoices/:id", async (req, res) => {
  try {
    const { id } = GetInvoiceParams.parse({ id: Number(req.params.id) });
    const [row] = await db.select().from(invoicesTable).where(eq(invoicesTable.id, id));
    if (!row) return res.status(404).json({ error: "not found" });
    res.json(ser(row));
  } catch (e) { req.log.error(e); res.status(400).json({ error: String(e) }); }
});

router.patch("/invoices/:id", async (req, res) => {
  try {
    const { id } = UpdateInvoiceParams.parse({ id: Number(req.params.id) });
    const body = UpdateInvoiceBody.parse(req.body);
    const [row] = await db.update(invoicesTable).set(body as any).where(eq(invoicesTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "not found" });
    res.json(ser(row));
  } catch (e) { req.log.error(e); res.status(400).json({ error: String(e) }); }
});

export default router;
