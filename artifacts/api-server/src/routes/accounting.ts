import { Router } from "express";
import { db } from "@workspace/db";
import { accountsTable, journalEntriesTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import { CreateAccountBody, CreateJournalEntryBody } from "@workspace/api-zod";

const router = Router();

const serAccount = (r: typeof accountsTable.$inferSelect) => ({
  ...r, balance: Number(r.balance), createdAt: r.createdAt.toISOString(),
});
const serJE = (r: typeof journalEntriesTable.$inferSelect) => ({
  ...r, lines: r.lines as any[], createdAt: r.createdAt.toISOString(),
});

router.get("/accounts", async (req, res) => {
  try {
    const rows = await db.select().from(accountsTable).orderBy(accountsTable.code);
    res.json(rows.map(serAccount));
  } catch (e) { req.log.error(e); res.status(500).json({ error: "internal" }); }
});

router.post("/accounts", async (req, res) => {
  try {
    const body = CreateAccountBody.parse(req.body);
    const [row] = await db.insert(accountsTable).values(body as any).returning();
    res.status(201).json(serAccount(row));
  } catch (e) { req.log.error(e); res.status(400).json({ error: String(e) }); }
});

router.get("/journal-entries", async (req, res) => {
  try {
    const rows = await db.select().from(journalEntriesTable).orderBy(desc(journalEntriesTable.createdAt)).limit(50);
    res.json(rows.map(serJE));
  } catch (e) { req.log.error(e); res.status(500).json({ error: "internal" }); }
});

router.post("/journal-entries", async (req, res) => {
  try {
    const body = CreateJournalEntryBody.parse(req.body);
    const [row] = await db.insert(journalEntriesTable).values(body as any).returning();
    res.status(201).json(serJE(row));
  } catch (e) { req.log.error(e); res.status(400).json({ error: String(e) }); }
});

router.get("/accounting/trial-balance", async (req, res) => {
  try {
    const rows = await db.select().from(accountsTable).orderBy(accountsTable.code);
    res.json(rows.map(r => ({
      accountCode: r.code,
      accountName: r.nameAr ?? r.name,
      debit:  Number(r.balance) >= 0 ? Number(r.balance) : 0,
      credit: Number(r.balance) < 0  ? Math.abs(Number(r.balance)) : 0,
    })));
  } catch (e) { req.log.error(e); res.status(500).json({ error: "internal" }); }
});

export default router;
