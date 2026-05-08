import express from "express";
import * as path from "path";
import ItemsService from "./items-service";
import { requireAuth, requireAdmin } from "../middleware/jwt-auth";

const itemsRouter = express.Router();
const jsonBodyParser = express.json();

itemsRouter
  .route("/")
  .get((req, res) => {
    const stores = req.app.locals.stores;
    res.json(ItemsService.list(stores));
  })
  .post(requireAuth, requireAdmin, jsonBodyParser, async (req, res, next) => {
    try {
      const stores = req.app.locals.stores;
      const body = req.body ?? {};
      const validationError = ItemsService.validate(body);
      if (validationError) {
        res.status(400).json({ error: validationError });
        return;
      }

      if (ItemsService.slugTaken(stores, body.slug)) {
        res.status(400).json({ error: `slug '${body.slug}' already exists` });
        return;
      }

      const item = await ItemsService.insert(stores, body);
      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${item.id}`))
        .json(ItemsService.serialize(item));
    } catch (error) {
      next(error);
    }
  });

itemsRouter
  .route("/:id")
  .all((req, res, next) => {
    const stores = req.app.locals.stores;
    const item = stores.items.findById(req.params.id!);
    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }
    req.item = item;
    next();
  })
  .get((req, res) => {
    res.json(ItemsService.serialize(req.item!));
  })
  .patch(requireAuth, requireAdmin, jsonBodyParser, async (req, res, next) => {
    try {
      const stores = req.app.locals.stores;
      const body = req.body ?? {};
      const item = req.item!;
      const validationError = ItemsService.validate(body, { partial: true });
      if (validationError) {
        res.status(400).json({ error: validationError });
        return;
      }

      if (body.slug != null && ItemsService.slugTaken(stores, body.slug, item.id)) {
        res.status(400).json({ error: `slug '${body.slug}' already exists` });
        return;
      }

      const updated = await ItemsService.update(stores, item.id, body);
      if (!updated) {
        res.status(404).json({ error: "Item not found" });
        return;
      }
      res.json(ItemsService.serialize(updated));
    } catch (error) {
      next(error);
    }
  })
  .delete(requireAuth, requireAdmin, async (req, res, next) => {
    try {
      const stores = req.app.locals.stores;
      await ItemsService.remove(stores, req.item!.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

export default itemsRouter;
