import express from "express";
import AdminService, { type HydratedOrder } from "./admin-service";
import { requireAuth, requireAdmin } from "../middleware/jwt-auth";

const adminRouter = express.Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.route("/orders").get((req, res, next) => {
  try {
    const stores = req.app.locals.stores;
    res.json(AdminService.getAllOrders(stores));
  } catch (error) {
    next(error);
  }
});

adminRouter
  .route("/orders/:id")
  .all((req, res, next) => {
    const stores = req.app.locals.stores;
    const order = AdminService.getById(stores, req.params.id!);
    if (!order) {
      res.status(404).json({ error: { message: "Order doesn't exist" } });
      return;
    }
    res.locals.order = order;
    next();
  })
  .get((_req, res) => {
    res.json(res.locals.order as HydratedOrder);
  })
  .delete(async (_req, res, next) => {
    try {
      const stores = res.locals.stores ?? res.req.app.locals.stores;
      const order = res.locals.order as HydratedOrder;
      await AdminService.deleteOrder(stores, order.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

export default adminRouter;
