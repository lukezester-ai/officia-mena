import { Router, type IRouter } from "express";
import healthRouter    from "./health";
import dashboardRouter from "./dashboard";
import productsRouter  from "./products";
import tanksRouter     from "./tanks";
import stockRouter     from "./stock";
import invoicesRouter  from "./invoices";
import accountingRouter from "./accounting";
import contactsRouter  from "./contacts";
import hrRouter        from "./hr";
import vatRouter       from "./vat";
import reportsRouter   from "./reports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(productsRouter);
router.use(tanksRouter);
router.use(stockRouter);
router.use(invoicesRouter);
router.use(accountingRouter);
router.use(contactsRouter);
router.use(hrRouter);
router.use(vatRouter);
router.use(reportsRouter);

export default router;
