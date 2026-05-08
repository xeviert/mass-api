import type { Stores } from "../store";
import type { InventoryRecord } from "../types";

export interface SerializedInventory {
  item_id: number;
  slug: string | null;
  name: string | null;
  on_hand: number;
  updated_at: string;
}

const InventoryService = {
  serialize(record: InventoryRecord, stores: Stores): SerializedInventory {
    const item = stores.items.findById(record.item_id);
    return {
      item_id: record.item_id,
      slug: item ? item.slug : null,
      name: item ? item.name : null,
      on_hand: record.on_hand,
      updated_at: record.updated_at,
    };
  },

  list(stores: Stores): SerializedInventory[] {
    return stores.inventory.all().map((r) => InventoryService.serialize(r, stores));
  },

  getByItemId(stores: Stores, itemId: number): InventoryRecord | null {
    return stores.inventory.find((r) => r.item_id === itemId);
  },

  async setOnHand(stores: Stores, itemId: number, on_hand: number): Promise<InventoryRecord> {
    const updated_at = new Date().toISOString();
    const existing = InventoryService.getByItemId(stores, itemId);
    if (existing) {
      const updated = await stores.inventory.update(existing.id, { on_hand, updated_at });
      return updated!;
    }
    return stores.inventory.insert({ item_id: itemId, on_hand, updated_at });
  },

  async incrementOnHand(stores: Stores, itemId: number, delta: number): Promise<InventoryRecord> {
    const existing = InventoryService.getByItemId(stores, itemId);
    const current = existing?.on_hand ?? 0;
    return InventoryService.setOnHand(stores, itemId, current + delta);
  },

  validateOnHand(value: unknown): string | null {
    if (!Number.isInteger(value) || (value as number) < 0) {
      return "on_hand must be a non-negative integer";
    }
    return null;
  },
};

export default InventoryService;
