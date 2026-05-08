import xss from "xss";
import type { Stores } from "../store";
import type { Order } from "../types";

export interface HydratedOrder {
  id: number;
  posted: string;
  status: Order["status"];
  location: string;
  note: string | null;
  requester: { id: number; phone_number: string } | null;
  items: Array<{
    item_id: number;
    quantity: number;
    slug: string | null;
    name: string | null;
  }>;
}

const AdminService = {
  hydrateOrder(order: Order, stores: Stores): HydratedOrder {
    const requester = stores.users.findById(order.user_id);
    return {
      id: order.id,
      posted: order.posted,
      status: order.status,
      location: xss(order.location),
      note: order.note ? xss(order.note) : null,
      requester: requester
        ? { id: requester.id, phone_number: requester.phone_number }
        : null,
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

  getAllOrders(stores: Stores): HydratedOrder[] {
    return stores.orders.all().map((o) => AdminService.hydrateOrder(o, stores));
  },

  getById(stores: Stores, id: number | string): HydratedOrder | null {
    const order = stores.orders.findById(id);
    return order ? AdminService.hydrateOrder(order, stores) : null;
  },

  deleteOrder(stores: Stores, id: number | string): Promise<boolean> {
    return stores.orders.remove(id);
  },
};

export default AdminService;
