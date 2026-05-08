import type { User, Item, Order } from "../types";
import type { Stores } from "../store";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      item?: Item;
      order?: Order;
    }
    interface Locals {
      stores: Stores;
    }
  }
}

export {};
