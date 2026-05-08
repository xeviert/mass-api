import express from "express";
import InventoryService from "./inventory-service";
import { requireAuth, requireAdmin } from "../middleware/jwt-auth";

const inventoryRouter = express.Router();
const jsonBodyParser = express.json();

inventoryRouter.get("/", (req, res) => {
  const stores = req.app.locals.stores;
  res.json(InventoryService.list(stores));
});

inventoryRouter.get("/:item_id", (req, res) => {
  const stores = req.app.locals.stores;
  const itemId = parseInt(req.params.item_id!, 10);
  if (!Number.isFinite(itemId)) {
    res.status(400).json({ error: "Invalid item_id" });
    return;
  }
  if (!stores.items.findById(itemId)) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  const record = InventoryService.getByItemId(stores, itemId);
  if (!record) {
    res.json({ item_id: itemId, on_hand: 0, updated_at: null });
    return;
  }
  res.json(InventoryService.serialize(record, stores));
});

inventoryRouter.patch(
  "/:item_id",
  requireAuth,
  requireAdmin,
  jsonBodyParser,
  async (req, res, next) => {
    try {
      const stores = req.app.locals.stores;
      const itemId = parseInt(String(req.params.item_id), 10);
      if (!Number.isFinite(itemId)) {
        res.status(400).json({ error: "Invalid item_id" });
        return;
      }
      if (!stores.items.findById(itemId)) {
        res.status(404).json({ error: "Item not found" });
        return;
      }
      const { on_hand } = req.body ?? {};
      const validationError = InventoryService.validateOnHand(on_hand);
      if (validationError) {
        res.status(400).json({ error: validationError });
        return;
      }
      const record = await InventoryService.setOnHand(stores, itemId, on_hand as number);
      res.json(InventoryService.serialize(record, stores));
    } catch (error) {
      next(error);
    }
  },
);

export default inventoryRouter;
