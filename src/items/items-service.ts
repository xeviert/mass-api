import xss from "xss";
import type { Stores } from "../store";
import type { Item } from "../types";

const REQUIRED_FIELDS = ["slug", "name", "blurb", "icon", "category"] as const;
type RequiredField = (typeof REQUIRED_FIELDS)[number];

export interface SerializedItem {
  id: number;
  slug: string;
  name: string;
  blurb: string;
  icon: string;
  category: string;
}

const ItemsService = {
  serialize(item: Item): SerializedItem {
    return {
      id: item.id,
      slug: xss(item.slug),
      name: xss(item.name),
      blurb: xss(item.blurb),
      icon: xss(item.icon),
      category: xss(item.category),
    };
  },

  list(stores: Stores): SerializedItem[] {
    return stores.items.all().map(ItemsService.serialize);
  },

  getById(stores: Stores, id: number | string): SerializedItem | null {
    const item = stores.items.findById(id);
    return item ? ItemsService.serialize(item) : null;
  },

  validate(body: Record<string, unknown>, { partial = false }: { partial?: boolean } = {}): string | null {
    if (!partial) {
      for (const field of REQUIRED_FIELDS) {
        const v = body[field];
        if (v == null || v === "") {
          return `Missing '${field}' in request body`;
        }
      }
    }
    if (body.slug != null && !/^[a-z0-9-]+$/.test(String(body.slug))) {
      return "slug must be lowercase letters, numbers, and dashes";
    }
    return null;
  },

  slugTaken(stores: Stores, slug: string, excludeId?: number): boolean {
    const existing = stores.items.find((i) => i.slug === slug);
    if (!existing) return false;
    return excludeId == null || existing.id !== excludeId;
  },

  insert(stores: Stores, body: Record<string, unknown>): Promise<Item> {
    const record = {} as Record<RequiredField, string>;
    for (const f of REQUIRED_FIELDS) record[f] = String(body[f]);
    return stores.items.insert(record as Omit<Item, "id" | "created_at">);
  },

  update(stores: Stores, id: number | string, patch: Record<string, unknown>): Promise<Item | null> {
    const filtered: Partial<Item> = {};
    for (const f of REQUIRED_FIELDS) {
      if (patch[f] != null) filtered[f] = String(patch[f]);
    }
    return stores.items.update(id, filtered);
  },

  remove(stores: Stores, id: number | string): Promise<boolean> {
    return stores.items.remove(id);
  },
};

export default ItemsService;
