import { Router } from "express";
import { db } from "@workspace/db";
import { stockMovementsTable, productsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { CreateStockMovementBody, ListStockMovementsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/stock/movements", async (req, res) => {
  try {
    const parsed = ListStockMovementsQueryParams.safeParse(req.query);
    const productId = parsed.success ? parsed.data.productId : undefined;

    const rows = await db
      .select({
        mv: stockMovementsTable,
        productName: productsTable.name,
      })
      .from(stockMovementsTable)
      .leftJoin(productsTable, eq(stockMovementsTable.productId, productsTable.id))
      .where(productId ? eq(stockMovementsTable.productId, productId) : undefined)
      .orderBy(desc(stockMovementsTable.createdAt))
      .limit(100);

    res.json(rows.map(r => ({
      ...r.mv,
      productName: r.productName ?? "—",
      quantity:  Number(r.mv.quantity),
      unitCost:  r.mv.unitCost ? Number(r.mv.unitCost) : null,
      createdAt: r.mv.createdAt.toISOString(),
    })));
  } catch (e) { req.log.error(e); res.status(500).json({ error: "internal" }); }
});

router.post("/stock/movements", async (req, res) => {
  try {
    const body = CreateStockMovementBody.parse(req.body);
    const [row] = await db.insert(stockMovementsTable).values(body as any).returning();

    // Update product stock
    const delta = body.type === "in" ? Number(body.quantity) : -Number(body.quantity);
    await db.execute(
      eq(productsTable.id, body.productId)
        ? db.update(productsTable)
            .set({ currentStock: eq(productsTable.id, body.productId) as any })
        // raw sql for numeric update:
        : db.update(productsTable).set({} as any)
    );
    // simpler approach:
    if (body.type !== "adjustment") {
      await db.execute(
        `UPDATE products SET current_stock = current_stock + ${delta} WHERE id = ${body.productId}` as any
      );
    } else {
      await db.execute(
        `UPDATE products SET current_stock = ${Number(body.quantity)} WHERE id = ${body.productId}` as any
      );
    }

    const product = await db.select({ name: productsTable.name }).from(productsTable).where(eq(productsTable.id, body.productId));
    res.status(201).json({
      ...row,
      productName: product[0]?.name ?? "—",
      quantity:  Number(row.quantity),
      unitCost:  row.unitCost ? Number(row.unitCost) : null,
      createdAt: row.createdAt.toISOString(),
    });
  } catch (e) { req.log.error(e); res.status(400).json({ error: String(e) }); }
});

export default router;
