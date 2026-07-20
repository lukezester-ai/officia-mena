import { Router } from "express";
import { db } from "@workspace/db";
import { tanksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateTankBody, UpdateTankBody, UpdateTankParams } from "@workspace/api-zod";

const router = Router();

const ser = (r: typeof tanksTable.$inferSelect) => ({
  ...r,
  capacityLiters: Number(r.capacityLiters),
  currentLiters:  Number(r.currentLiters),
  createdAt: r.createdAt.toISOString(),
});

router.get("/tanks", async (req, res) => {
  try {
    const rows = await db.select().from(tanksTable).orderBy(tanksTable.name);
    res.json(rows.map(ser));
  } catch (e) { req.log.error(e); res.status(500).json({ error: "internal" }); }
});

router.post("/tanks", async (req, res) => {
  try {
    const body = CreateTankBody.parse(req.body);
    const [row] = await db.insert(tanksTable).values(body as any).returning();
    res.status(201).json(ser(row));
  } catch (e) { req.log.error(e); res.status(400).json({ error: String(e) }); }
});

router.patch("/tanks/:id", async (req, res) => {
  try {
    const { id } = UpdateTankParams.parse({ id: Number(req.params.id) });
    const body = UpdateTankBody.parse(req.body);
    const [row] = await db.update(tanksTable).set(body as any).where(eq(tanksTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "not found" });
    res.json(ser(row));
  } catch (e) { req.log.error(e); res.status(400).json({ error: String(e) }); }
});

export default router;
