export type Role = "admin" | "user";

export interface User {
  id: number;
  phone_number: string;
  password_hash: string;
  role: Role | null;
  created_at?: string;
}

export interface Item {
  id: number;
  slug: string;
  name: string;
  blurb: string;
  icon: string;
  category: string;
  created_at?: string;
}

export interface OrderItemEntry {
  item_id: number;
  quantity: number;
}

export interface Order {
  id: number;
  user_id: number;
  location: string;
  note: string | null;
  status: OrderStatus;
  posted: string;
  items: OrderItemEntry[];
  created_at?: string;
}

export type OrderStatus = "open" | "fulfilled";

export interface JwtPayload {
  user_id: number;
  phone_number: string;
  role: Role | null;
}
