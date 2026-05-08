const express = require("express");
const AdminService = require("./admin-service");
const { requireAuth, requireAdmin } = require("../middleware/jwt-auth");

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
    const order = AdminService.getById(stores, req.params.id);
    if (!order) return res.status(404).json({ error: { message: "Order doesn't exist" } });
    res.locals.order = order;
    next();
  })
  .get((req, res) => {
    res.json(res.locals.order);
  })
  .delete(async (req, res, next) => {
    try {
      const stores = req.app.locals.stores;
      await AdminService.deleteOrder(stores, res.locals.order.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

module.exports = adminRouter;
