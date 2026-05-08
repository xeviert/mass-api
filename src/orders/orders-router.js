const express = require("express");
const path = require("path");
const OrdersService = require("./orders-service");
const { requireAuth } = require("../middleware/jwt-auth");

const ordersRouter = express.Router();
const jsonBodyParser = express.json();

ordersRouter
  .route("/")
  .get(requireAuth, (req, res) => {
    const stores = req.app.locals.stores;
    const mine = OrdersService.listForUser(stores, req.user.id);
    res.json(mine.map((o) => OrdersService.serialize(o, stores)));
  })
  .post(requireAuth, jsonBodyParser, async (req, res, next) => {
    try {
      const stores = req.app.locals.stores;
      const validationError = OrdersService.validateNewOrder(req.body, stores);
      if (validationError) return res.status(400).json({ error: validationError });

      const order = await OrdersService.insertOrder(stores, {
        user_id: req.user.id,
        location: req.body.location,
        note: req.body.note,
        items: req.body.items,
      });

      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${order.id}`))
        .json(OrdersService.serialize(order, stores));
    } catch (error) {
      next(error);
    }
  });

ordersRouter
  .route("/:id")
  .all(requireAuth, (req, res, next) => {
    const stores = req.app.locals.stores;
    const order = OrdersService.getById(stores, req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    req.order = order;
    next();
  })
  .get((req, res) => {
    const stores = req.app.locals.stores;
    res.json(OrdersService.serialize(req.order, stores));
  })
  .patch(jsonBodyParser, async (req, res, next) => {
    try {
      const stores = req.app.locals.stores;
      const { status } = req.body;
      if (status == null) {
        return res.status(400).json({ error: "Missing 'status' in request body" });
      }
      const statusError = OrdersService.validateStatus(status);
      if (statusError) return res.status(400).json({ error: statusError });

      const updated = await OrdersService.setStatus(stores, req.order.id, status);
      res.json(OrdersService.serialize(updated, stores));
    } catch (error) {
      next(error);
    }
  });

module.exports = ordersRouter;
