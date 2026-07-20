import { Router } from "express";
import { db } from "@workspace/db";
import { vatTransactionsTable, vatDeclarationsTable } from "@workspace/db";
import { sql, desc } from "drizzle-orm";
import { CreateVatDeclarationBody } from "@workspace/api-zod";

const router = Router();

const serTx  = (r: typeof vatTransactionsTable.$inferSelect)  => ({ ...r, vatAmount: Number(r.vatAmount), vatRate: Number(r.vatRate), createdAt: r.createdAt.toISOString() });
const serDec = (r: typeof vatDeclarationsTable.$inferSelect) => ({ ...r, outputVat: Number(r.outputVat), inputVat: Number(r.inputVat), netVat: Number(r.netVat), createdAt: r.createdAt.toISOString() });

router.get("/vat/transactions", async (req, res) => {
  try {
    const rows = await db.select().from(vatTransactionsTable).orderBy(desc(vatTransactionsTable.createdAt)).limit(100);
    res.json(rows.map(serTx));
  } catch (e) { req.log.error(e); res.status(500).json({ error: "internal" }); }
});

router.get("/vat/declarations", async (req, res) => {
  try {
    const rows = await db.select().from(vatDeclarationsTable).orderBy(desc(vatDeclarationsTable.createdAt));
    res.json(rows.map(serDec));
  } catch (e) { req.log.error(e); res.status(500).json({ error: "internal" }); }
});

router.post("/vat/declarations", async (req, res) => {
  try {
    const body = CreateVatDeclarationBody.parse(req.body);
    const [totals] = await db.select({
      output: sql<number>`coalesce(sum(cast(${vatTransactionsTable.vatAmount} as numeric)) filter (where ${vatTransactionsTable.type}='output'),0)`,
      input:  sql<number>`coalesce(sum(cast(${vatTransactionsTable.vatAmount} as numeric)) filter (where ${vatTransactionsTable.type}='input'),0)`,
    }).from(vatTransactionsTable);
    const output = Number(totals?.output ?? 0);
    const input  = Number(totals?.input  ?? 0);
    const net    = output - input;
    const [row] = await db.insert(vatDeclarationsTable).values({
      ...body,
      outputVat: output.toFixed(2),
      inputVat:  input.toFixed(2),
      netVat:    net.toFixed(2),
    } as any).returning();
    res.status(201).json(serDec(row));
  } catch (e) { req.log.error(e); res.status(400).json({ error: String(e) }); }
});

router.get("/vat/summary", async (req, res) => {
  try {
    const [r] = await db.select({
      output: sql<number>`coalesce(sum(cast(${vatTransactionsTable.vatAmount} as numeric)) filter (where ${vatTransactionsTable.type}='output'),0)`,
      input:  sql<number>`coalesce(sum(cast(${vatTransactionsTable.vatAmount} as numeric)) filter (where ${vatTransactionsTable.type}='input'),0)`,
    }).from(vatTransactionsTable);
    const output = Number(r?.output ?? 0);
    const input  = Number(r?.input  ?? 0);
    res.json({
      currentPeriod: "Q3-2026",
      outputVat: output,
      inputVat:  input,
      netVat:    output - input,
      dueDate:   "2026-07-30",
    });
  } catch (e) { req.log.error(e); res.status(500).json({ error: "internal" }); }
});

export default router;
