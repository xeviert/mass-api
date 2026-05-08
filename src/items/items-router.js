const express = require("express");
const path = require("path");
const ItemsService = require("./items-service");
const { requireAuth, requireAdmin } = require("../middleware/jwt-auth");

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
      const validationError = ItemsService.validate(req.body);
      if (validationError) return res.status(400).json({ error: validationError });

      if (ItemsService.slugTaken(stores, req.body.slug)) {
        return res.status(400).json({ error: `slug '${req.body.slug}' already exists` });
      }

      const item = await ItemsService.insert(stores, req.body);
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
    const item = stores.items.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    req.item = item;
    next();
  })
  .get((req, res) => {
    res.json(ItemsService.serialize(req.item));
  })
  .patch(requireAuth, requireAdmin, jsonBodyParser, async (req, res, next) => {
    try {
      const stores = req.app.locals.stores;
      const validationError = ItemsService.validate(req.body, { partial: true });
      if (validationError) return res.status(400).json({ error: validationError });

      if (req.body.slug != null && ItemsService.slugTaken(stores, req.body.slug, req.item.id)) {
        return res.status(400).json({ error: `slug '${req.body.slug}' already exists` });
      }

      const updated = await ItemsService.update(stores, req.item.id, req.body);
      res.json(ItemsService.serialize(updated));
    } catch (error) {
      next(error);
    }
  })
  .delete(requireAuth, requireAdmin, async (req, res, next) => {
    try {
      const stores = req.app.locals.stores;
      await ItemsService.remove(stores, req.item.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

module.exports = itemsRouter;
