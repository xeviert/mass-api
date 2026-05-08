const path = require("path");
const JsonStore = require("./json-store");
const config = require("../config");

const dataDir = config.DATA_DIR;

const users = new JsonStore(path.join(dataDir, "users.json"));
const items = new JsonStore(path.join(dataDir, "items.json"));
const orders = new JsonStore(path.join(dataDir, "orders.json"));

async function init() {
  await Promise.all([users.load(), items.load(), orders.load()]);
}

module.exports = { users, items, orders, init };
