import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { eq, sql, ilike, and } from "drizzle-orm";
import {
  CreateProductBody, UpdateProductBody, UpdateProductParams, DeleteProductParams,
  GetProductParams, ListProductsQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/products", async (req, res) => {
  try {
    const parsed = ListProductsQueryParams.safeParse(req.query);
    const { category, search } = parsed.success ? parsed.data : {};
    const conditions = [];
    if (category) conditions.push(eq(productsTable.category, category as "petroleum"|"fertilizer"|"general"));
    if (search)   conditions.push(ilike(productsTable.name, `%${search}%`));
    const rows = await db.select().from(productsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(productsTable.name);
    res.json(rows.map(serializeProduct));
  } catch (e) { req.log.error(e); res.status(500).json({ error: "internal" }); }
});

router.post("/products", async (req, res) => {
  try {
    const body = CreateProductBody.parse(req.body);
    const [row] = await db.insert(productsTable).values(body as any).returning();
    res.status(201).json(serializeProduct(row));
  } catch (e) { req.log.error(e); res.status(400).json({ error: String(e) }); }
});

router.get("/products/warehouse-stats", async (req, res) => {
  try {
    const [stats] = await db.select({
      total:      sql<number>`count(*)`,
      petroleum:  sql<number>`count(*) filter (where ${productsTable.category}='petroleum')`,
      fertilizer: sql<number>`count(*) filter (where ${productsTable.category}='fertilizer')`,
      general:    sql<number>`count(*) filter (where ${productsTable.category}='general')`,
      lowStock:   sql<number>`count(*) filter (where cast(${productsTable.currentStock} as numeric) <= cast(${productsTable.reorderLevel} as numeric))`,
      totalValue: sql<number>`coalesce(sum(cast(${productsTable.currentStock} as numeric)*cast(${productsTable.unitCost} as numeric)),0)`,
      petLiters:  sql<number>`coalesce(sum(case when ${productsTable.category}='petroleum' then cast(${productsTable.currentStock} as numeric) else 0 end),0)`,
      fertTons:   sql<number>`coalesce(sum(case when ${productsTable.category}='fertilizer' then cast(${productsTable.currentStock} as numeric) else 0 end),0)`,
    }).from(productsTable);
    res.json({
      totalProducts:      Number(stats?.total ?? 0),
      petroleumProducts:  Number(stats?.petroleum ?? 0),
      fertilizerProducts: Number(stats?.fertilizer ?? 0),
      generalProducts:    Number(stats?.general ?? 0),
      lowStockCount:      Number(stats?.lowStock ?? 0),
      totalStockValue:    Number(stats?.totalValue ?? 0),
      petroleumLiters:    Number(stats?.petLiters ?? 0),
      fertilizerTons:     Number(stats?.fertTons ?? 0),
    });
  } catch (e) { req.log.error(e); res.status(500).json({ error: "internal" }); }
});

router.get("/products/:id", async (req, res) => {
  try {
    const { id } = GetProductParams.parse({ id: Number(req.params.id) });
    const [row] = await db.select().from(productsTable).where(eq(productsTable.id, id));
    if (!row) return res.status(404).json({ error: "not found" });
    res.json(serializeProduct(row));
  } catch (e) { req.log.error(e); res.status(400).json({ error: String(e) }); }
});

router.patch("/products/:id", async (req, res) => {
  try {
    const { id } = UpdateProductParams.parse({ id: Number(req.params.id) });
    const body = UpdateProductBody.parse(req.body);
    const [row] = await db.update(productsTable).set(body as any).where(eq(productsTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "not found" });
    res.json(serializeProduct(row));
  } catch (e) { req.log.error(e); res.status(400).json({ error: String(e) }); }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const { id } = DeleteProductParams.parse({ id: Number(req.params.id) });
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.status(204).send();
  } catch (e) { req.log.error(e); res.status(400).json({ error: String(e) }); }
});

function serializeProduct(r: typeof productsTable.$inferSelect) {
  return {
    ...r,
    currentStock: Number(r.currentStock),
    unitCost:     Number(r.unitCost),
    reorderLevel: Number(r.reorderLevel),
    density:      r.density    ? Number(r.density)    : null,
    flashPoint:   r.flashPoint ? Number(r.flashPoint) : null,
    sulphurPct:   r.sulphurPct ? Number(r.sulphurPct) : null,
    npkN: r.npkN ? Number(r.npkN) : null,
    npkP: r.npkP ? Number(r.npkP) : null,
    npkK: r.npkK ? Number(r.npkK) : null,
    bagWeight: r.bagWeight ? Number(r.bagWeight) : null,
    createdAt: r.createdAt.toISOString(),
  };
}

export default router;
