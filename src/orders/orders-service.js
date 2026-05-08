const xss = require("xss");

const VALID_STATUS = new Set(["open", "fulfilled"]);

const OrdersService = {
  validateNewOrder(body, stores) {
    if (!body.location || typeof body.location !== "string") {
      return "Missing 'location' in request body";
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return "Missing 'items' array in request body";
    }
    for (const entry of body.items) {
      if (!entry || typeof entry !== "object") return "Each item must be an object";
      const { item_id, quantity } = entry;
      if (!Number.isInteger(item_id)) return "Each item must include integer 'item_id'";
      if (!Number.isInteger(quantity) || quantity < 1) {
        return "Each item must include integer 'quantity' >= 1";
      }
      if (!stores.items.findById(item_id)) {
        return `item_id ${item_id} does not exist`;
      }
    }
    return null;
  },

  insertOrder(stores, { user_id, location, note, items }) {
    return stores.orders.insert({
      user_id,
      location,
      note: note || null,
      status: "open",
      posted: new Date().toISOString(),
      items: items.map(({ item_id, quantity }) => ({ item_id, quantity })),
    });
  },

  serialize(order, stores) {
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

  listForUser(stores, user_id) {
    return stores.orders.filter((o) => o.user_id === user_id);
  },

  getById(stores, id) {
    return stores.orders.findById(id);
  },

  validateStatus(status) {
    if (!VALID_STATUS.has(status)) {
      return `status must be one of: ${[...VALID_STATUS].join(", ")}`;
    }
    return null;
  },

  setStatus(stores, id, status) {
    return stores.orders.update(id, { status });
  },
};

module.exports = OrdersService;
