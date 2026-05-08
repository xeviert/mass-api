const xss = require("xss");

const AdminService = {
  hydrateOrder(order, stores) {
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

  getAllOrders(stores) {
    return stores.orders.all().map((o) => AdminService.hydrateOrder(o, stores));
  },

  getById(stores, id) {
    const order = stores.orders.findById(id);
    return order ? AdminService.hydrateOrder(order, stores) : null;
  },

  deleteOrder(stores, id) {
    return stores.orders.remove(id);
  },
};

module.exports = AdminService;
