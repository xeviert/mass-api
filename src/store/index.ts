import * as path from "path";
import { JsonStore } from "./json-store";
import config from "../config";
import type { User, Item, Order } from "../types";

const dataDir = config.DATA_DIR;

export const users = new JsonStore<User>(path.join(dataDir, "users.json"));
export const items = new JsonStore<Item>(path.join(dataDir, "items.json"));
export const orders = new JsonStore<Order>(path.join(dataDir, "orders.json"));

export async function init(): Promise<void> {
  await Promise.all([users.load(), items.load(), orders.load()]);
}

export interface Stores {
  users: JsonStore<User>;
  items: JsonStore<Item>;
  orders: JsonStore<Order>;
  init(): Promise<void>;
}

const stores: Stores = { users, items, orders, init };
export default stores;
