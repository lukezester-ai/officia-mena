import { Router } from "express";
import { db } from "@workspace/db";
import { employeesTable, payrollRunsTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import {
  CreateEmployeeBody, UpdateEmployeeBody, UpdateEmployeeParams, GetEmployeeParams,
  CreatePayrollRunBody,
} from "@workspace/api-zod";

const router = Router();

const serEmp = (r: typeof employeesTable.$inferSelect) => ({
  ...r, salary: Number(r.salary), createdAt: r.createdAt.toISOString(),
});
const serPay = (r: typeof payrollRunsTable.$inferSelect) => ({
  ...r,
  totalGross:      Number(r.totalGross),
  totalDeductions: Number(r.totalDeductions),
  totalNet:        Number(r.totalNet),
  createdAt: r.createdAt.toISOString(),
});

router.get("/employees", async (req, res) => {
  try {
    const rows = await db.select().from(employeesTable).orderBy(employeesTable.name);
    res.json(rows.map(serEmp));
  } catch (e) { req.log.error(e); res.status(500).json({ error: "internal" }); }
});

router.post("/employees", async (req, res) => {
  try {
    const body = CreateEmployeeBody.parse(req.body);
    const [row] = await db.insert(employeesTable).values(body as any).returning();
    res.status(201).json(serEmp(row));
  } catch (e) { req.log.error(e); res.status(400).json({ error: String(e) }); }
});

router.get("/employees/:id", async (req, res) => {
  try {
    const { id } = GetEmployeeParams.parse({ id: Number(req.params.id) });
    const [row] = await db.select().from(employeesTable).where(eq(employeesTable.id, id));
    if (!row) return res.status(404).json({ error: "not found" });
    res.json(serEmp(row));
  } catch (e) { req.log.error(e); res.status(400).json({ error: String(e) }); }
});

router.patch("/employees/:id", async (req, res) => {
  try {
    const { id } = UpdateEmployeeParams.parse({ id: Number(req.params.id) });
    const body = UpdateEmployeeBody.parse(req.body);
    const [row] = await db.update(employeesTable).set(body as any).where(eq(employeesTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "not found" });
    res.json(serEmp(row));
  } catch (e) { req.log.error(e); res.status(400).json({ error: String(e) }); }
});

router.get("/payroll", async (req, res) => {
  try {
    const rows = await db.select().from(payrollRunsTable).orderBy(desc(payrollRunsTable.createdAt));
    res.json(rows.map(serPay));
  } catch (e) { req.log.error(e); res.status(500).json({ error: "internal" }); }
});

router.post("/payroll", async (req, res) => {
  try {
    const body = CreatePayrollRunBody.parse(req.body);
    const [totals] = await db.select({
      gross: sql<number>`coalesce(sum(cast(${employeesTable.salary} as numeric)),0)`,
      cnt:   sql<number>`count(*)`,
    }).from(employeesTable).where(eq(employeesTable.status, "active"));
    const gross = Number(totals?.gross ?? 0);
    const deductions = gross * 0.1;
    const net = gross - deductions;
    const [row] = await db.insert(payrollRunsTable).values({
      ...body,
      totalGross:      gross.toFixed(2),
      totalDeductions: deductions.toFixed(2),
      totalNet:        net.toFixed(2),
      employeeCount:   Number(totals?.cnt ?? 0),
    } as any).returning();
    res.status(201).json(serPay(row));
  } catch (e) { req.log.error(e); res.status(400).json({ error: String(e) }); }
});

router.get("/hr/summary", async (req, res) => {
  try {
    const [totals] = await db.select({
      total:   sql<number>`count(*)`,
      active:  sql<number>`count(*) filter (where ${employeesTable.status}='active')`,
      onLeave: sql<number>`count(*) filter (where ${employeesTable.status}='on_leave')`,
      payroll: sql<number>`coalesce(sum(cast(${employeesTable.salary} as numeric)) filter (where ${employeesTable.status}='active'),0)`,
    }).from(employeesTable);

    const depts = await db.select({
      department: employeesTable.department,
      count: sql<number>`count(*)`,
    }).from(employeesTable).groupBy(employeesTable.department);

    res.json({
      totalEmployees:      Number(totals?.total ?? 0),
      activeEmployees:     Number(totals?.active ?? 0),
      onLeave:             Number(totals?.onLeave ?? 0),
      monthlyPayroll:      Number(totals?.payroll ?? 0),
      departmentBreakdown: depts.map(d => ({ department: d.department, count: Number(d.count) })),
    });
  } catch (e) { req.log.error(e); res.status(500).json({ error: "internal" }); }
});

export default router;
