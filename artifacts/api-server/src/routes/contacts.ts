import { Router } from "express";
import { db } from "@workspace/db";
import { contactsTable } from "@workspace/db";
import { eq, ilike, and, sql } from "drizzle-orm";
import {
  CreateContactBody, UpdateContactBody, UpdateContactParams,
  DeleteContactParams, GetContactParams, ListContactsQueryParams,
} from "@workspace/api-zod";

const router = Router();

const ser = (r: typeof contactsTable.$inferSelect) => ({
  ...r, balance: Number(r.balance), createdAt: r.createdAt.toISOString(),
});

router.get("/contacts", async (req, res) => {
  try {
    const parsed = ListContactsQueryParams.safeParse(req.query);
    const { type, search } = parsed.success ? parsed.data : {};
    const conds = [];
    if (type && type !== "both") conds.push(eq(contactsTable.type, type as any));
    if (search) conds.push(ilike(contactsTable.name, `%${search}%`));
    const rows = await db.select().from(contactsTable)
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(contactsTable.name);
    res.json(rows.map(ser));
  } catch (e) { req.log.error(e); res.status(500).json({ error: "internal" }); }
});

router.post("/contacts", async (req, res) => {
  try {
    const body = CreateContactBody.parse(req.body);
    const [row] = await db.insert(contactsTable).values(body as any).returning();
    res.status(201).json(ser(row));
  } catch (e) { req.log.error(e); res.status(400).json({ error: String(e) }); }
});

router.get("/contacts/:id", async (req, res) => {
  try {
    const { id } = GetContactParams.parse({ id: Number(req.params.id) });
    const [row] = await db.select().from(contactsTable).where(eq(contactsTable.id, id));
    if (!row) return res.status(404).json({ error: "not found" });
    res.json(ser(row));
  } catch (e) { req.log.error(e); res.status(400).json({ error: String(e) }); }
});

router.patch("/contacts/:id", async (req, res) => {
  try {
    const { id } = UpdateContactParams.parse({ id: Number(req.params.id) });
    const body = UpdateContactBody.parse(req.body);
    const [row] = await db.update(contactsTable).set(body as any).where(eq(contactsTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "not found" });
    res.json(ser(row));
  } catch (e) { req.log.error(e); res.status(400).json({ error: String(e) }); }
});

router.delete("/contacts/:id", async (req, res) => {
  try {
    const { id } = DeleteContactParams.parse({ id: Number(req.params.id) });
    await db.delete(contactsTable).where(eq(contactsTable.id, id));
    res.status(204).send();
  } catch (e) { req.log.error(e); res.status(400).json({ error: String(e) }); }
});

export default router;
