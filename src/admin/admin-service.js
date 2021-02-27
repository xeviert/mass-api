const AdminService = {
  getAllOrders(db) {
    return db
      .select("*")
      .from("order_items")
      .leftJoin("items", "order_items.item_id", "items.id")
      .innerJoin("orders", "order_items.order_id", "orders.id")
      .innerJoin("users", "users.id", "orders.user_id");
  },

  getById(db, id) {
    return db.from("orders").select("*").where("id", id).first();
  },

  deleteOrder(db, id) {
    return db("orders").where({ id }).delete();
  },
};

module.exports = AdminService;
