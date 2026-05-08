import express from "express";
import * as path from "path";
import OrdersService from "./orders-service";
import { requireAuth } from "../middleware/jwt-auth";
import type { OrderStatus } from "../types";

const ordersRouter = express.Router();
const jsonBodyParser = express.json();

ordersRouter
  .route("/")
  .get(requireAuth, (req, res) => {
    const stores = req.app.locals.stores;
    const user = req.user!;
    const mine = OrdersService.listForUser(stores, user.id);
    res.json(mine.map((o) => OrdersService.serialize(o, stores)));
  })
  .post(requireAuth, jsonBodyParser, async (req, res, next) => {
    try {
      const stores = req.app.locals.stores;
      const user = req.user!;
      const body = req.body ?? {};
      const validationError = OrdersService.validateNewOrder(body, stores);
      if (validationError) {
        res.status(400).json({ error: validationError });
        return;
      }

      const order = await OrdersService.insertOrder(stores, {
        user_id: user.id,
        location: body.location,
        note: body.note,
        items: body.items,
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
    const user = req.user!;
    const order = OrdersService.getById(stores, req.params.id!);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    if (order.user_id !== user.id && user.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    req.order = order;
    next();
  })
  .get((req, res) => {
    const stores = req.app.locals.stores;
    res.json(OrdersService.serialize(req.order!, stores));
  })
  .patch(jsonBodyParser, async (req, res, next) => {
    try {
      const stores = req.app.locals.stores;
      const order = req.order!;
      const { status } = req.body ?? {};
      if (status == null) {
        res.status(400).json({ error: "Missing 'status' in request body" });
        return;
      }
      const statusError = OrdersService.validateStatus(status);
      if (statusError) {
        res.status(400).json({ error: statusError });
        return;
      }

      const updated = await OrdersService.setStatus(stores, order.id, status as OrderStatus);
      if (!updated) {
        res.status(404).json({ error: "Order not found" });
        return;
      }
      res.json(OrdersService.serialize(updated, stores));
    } catch (error) {
      next(error);
    }
  });

export default ordersRouter;
