import xss from "xss";
import type { Stores } from "../store";
import type { Order, OrderStatus } from "../types";

const VALID_STATUS: ReadonlySet<OrderStatus> = new Set<OrderStatus>(["open", "fulfilled"]);

export interface SerializedOrder {
  id: number;
  user_id: number;
  location: string;
  note: string | null;
  status: OrderStatus;
  posted: string;
  items: Array<{
    item_id: number;
    quantity: number;
    slug: string | null;
    name: string | null;
  }>;
}

const OrdersService = {
  validateNewOrder(body: Record<string, unknown>, stores: Stores): string | null {
    if (!body.location || typeof body.location !== "string") {
      return "Missing 'location' in request body";
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return "Missing 'items' array in request body";
    }
    for (const entry of body.items) {
      if (!entry || typeof entry !== "object") return "Each item must be an object";
      const { item_id, quantity } = entry as { item_id: unknown; quantity: unknown };
      if (!Number.isInteger(item_id)) return "Each item must include integer 'item_id'";
      if (!Number.isInteger(quantity) || (quantity as number) < 1) {
        return "Each item must include integer 'quantity' >= 1";
      }
      if (!stores.items.findById(item_id as number)) {
        return `item_id ${item_id} does not exist`;
      }
    }
    return null;
  },

  insertOrder(
    stores: Stores,
    {
      user_id,
      location,
      note,
      items,
    }: {
      user_id: number;
      location: string;
      note?: string | null;
      items: Array<{ item_id: number; quantity: number }>;
    },
  ): Promise<Order> {
    return stores.orders.insert({
      user_id,
      location,
      note: note || null,
      status: "open",
      posted: new Date().toISOString(),
      items: items.map(({ item_id, quantity }) => ({ item_id, quantity })),
    });
  },

  serialize(order: Order, stores: Stores): SerializedOrder {
    return {
      id: order.id,
      user_id: order.user_id,
      location: xss(order.location),
      note: order.note ? xss(order.note) : null,
      status: order.status,
      posted: order.posted,
      items: order.items.map((entry) => {
        const item = stores.items.findById(entry.item_id);
        return {
          item_id: entry.item_id,
          quantity: entry.quantity,
          slug: item ? item.slug : null,
          name: item ? item.name : null,
        };
      }),
    };
  },

  listForUser(stores: Stores, user_id: number): Order[] {
    return stores.orders.filter((o) => o.user_id === user_id);
  },

  getById(stores: Stores, id: number | string): Order | null {
    return stores.orders.findById(id);
  },

  validateStatus(status: unknown): string | null {
    if (typeof status !== "string" || !VALID_STATUS.has(status as OrderStatus)) {
      return `status must be one of: ${[...VALID_STATUS].join(", ")}`;
    }
    return null;
  },

  setStatus(stores: Stores, id: number | string, status: OrderStatus): Promise<Order | null> {
    return stores.orders.update(id, { status });
  },
};

export default OrdersService;
