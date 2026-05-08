import bcrypt from "bcrypt";
import type { JsonStore } from "./json-store";
import type {
  Item,
  MoneyDonation,
  Order,
  SuppliesDonation,
  User,
  InventoryRecord,
} from "../types";
import type { Stores } from "./index";
import type config from "../config";

type Config = typeof config;
const DEMO_PASSWORD = "demo";
const DEMO_REQUESTER_PHONE = "5555551111";
const DEMO_ADMIN_PHONE = "5555550000";

export const ITEM_SEED: Omit<Item, "id" | "created_at">[] = [
  { slug: "snack-kit", name: "Snack Kit", blurb: "Granola bars, nuts, water", icon: "Cookie", category: "Food" },
  { slug: "socks-underwear", name: "Socks & Underwear", blurb: "Fresh basics", icon: "Shirt", category: "Clothing & Warmth" },
  { slug: "walking-shoes", name: "Walking Shoes", blurb: "Sturdy, comfortable", icon: "Footprints", category: "Clothing & Warmth" },
  { slug: "pads-tampons", name: "Pads & Tampons", blurb: "Period care", icon: "Droplets", category: "Hygiene" },
  { slug: "first-aid", name: "First Aid Kit", blurb: "Bandages & basics", icon: "Bandage", category: "Health & Safety" },
  { slug: "dental", name: "Dental Care Kit", blurb: "Toothbrush, paste, floss", icon: "Smile", category: "Hygiene" },
  { slug: "deodorant-soap", name: "Deodorant & Soap", blurb: "Daily hygiene", icon: "Sparkles", category: "Hygiene" },
  { slug: "earplugs", name: "Earplugs", blurb: "For rest", icon: "EarOff", category: "Clothing & Warmth" },
  { slug: "ppe", name: "Mask, Sanitizer, Gloves", blurb: "Personal protection", icon: "ShieldPlus", category: "Health & Safety" },
  { slug: "blanket", name: "Blanket", blurb: "Warm & soft", icon: "BedDouble", category: "Clothing & Warmth" },
  { slug: "diapers", name: "Diapers, Wipes, Baby Clothes", blurb: "Baby essentials", icon: "Baby", category: "Baby" },
  { slug: "formula", name: "Baby Formula", blurb: "Infant nutrition", icon: "Milk", category: "Baby" },
  { slug: "school", name: "School Supplies", blurb: "Backpack basics", icon: "GraduationCap", category: "School & Stationery" },
  { slug: "notepad", name: "Notepad & Pens", blurb: "For notes & journaling", icon: "NotebookPen", category: "School & Stationery" },
  { slug: "hat-gloves-scarf", name: "Hat, Gloves, Scarf", blurb: "Cold-weather set", icon: "Snowflake", category: "Clothing & Warmth" },
  { slug: "jacket", name: "Sweater / Jacket", blurb: "Outer layer", icon: "Shirt", category: "Clothing & Warmth" },
  { slug: "naloxone", name: "Naloxone (Narcan)", blurb: "Opioid overdose reversal", icon: "HeartPulse", category: "Harm Reduction" },
];

async function seedItems(itemsStore: JsonStore<Item>): Promise<void> {
  if (itemsStore.all().length > 0) return;
  for (const item of ITEM_SEED) {
    await itemsStore.insert(item);
  }
}

async function seedAdmin(usersStore: JsonStore<User>, adminPhone: string | null): Promise<void> {
  if (!adminPhone) return;
  const existing = usersStore.find((u) => u.phone_number === adminPhone);
  if (existing) {
    if (existing.role !== "admin") {
      await usersStore.update(existing.id, { role: "admin" });
      console.log(`Promoted user ${adminPhone} to admin.`);
    }
    return;
  }
  console.log(
    `SEED_ADMIN_PHONE=${adminPhone} is set, but no user with that phone exists yet. ` +
      `Register that phone via POST /api/user and it will be promoted on next startup.`,
  );
}

async function seedDemoUsers(usersStore: JsonStore<User>): Promise<void> {
  if (usersStore.all().length > 0) return;
  const password_hash = await bcrypt.hash(DEMO_PASSWORD, 12);
  await usersStore.insert({
    phone_number: DEMO_ADMIN_PHONE,
    password_hash,
    role: "admin",
  });
  await usersStore.insert({
    phone_number: DEMO_REQUESTER_PHONE,
    password_hash,
    role: "user",
  });
}

async function seedInventory(
  inventoryStore: JsonStore<InventoryRecord>,
  itemsStore: JsonStore<Item>,
): Promise<void> {
  const existing = new Set(inventoryStore.all().map((r) => r.item_id));
  for (const item of itemsStore.all()) {
    if (existing.has(item.id)) continue;
    await inventoryStore.insert({
      item_id: item.id,
      on_hand: 0,
      updated_at: new Date().toISOString(),
    });
  }
}

async function seedDemoInventory(
  inventoryStore: JsonStore<InventoryRecord>,
  itemsStore: JsonStore<Item>,
): Promise<void> {
  const countsBySlug: Record<string, number> = {
    "snack-kit": 8,
    "socks-underwear": 4,
    "walking-shoes": 1,
    "pads-tampons": 5,
    "first-aid": 6,
    dental: 7,
    "deodorant-soap": 5,
    earplugs: 12,
    ppe: 9,
    blanket: 2,
    diapers: 1,
    formula: 2,
    school: 3,
    notepad: 10,
    "hat-gloves-scarf": 3,
    jacket: 1,
    naloxone: 4,
  };
  for (const item of itemsStore.all()) {
    const row = inventoryStore.find((r) => r.item_id === item.id);
    if (!row || row.on_hand !== 0) continue;
    await inventoryStore.update(row.id, {
      on_hand: countsBySlug[item.slug] ?? 0,
      updated_at: new Date().toISOString(),
    });
  }
}

function itemId(itemsStore: JsonStore<Item>, slug: string): number {
  const item = itemsStore.find((i) => i.slug === slug);
  if (!item) throw new Error(`Missing seeded item '${slug}'`);
  return item.id;
}

async function seedDemoOrders(stores: Stores): Promise<void> {
  if (stores.orders.all().length > 0) return;
  const requester = stores.users.find((u) => u.phone_number === DEMO_REQUESTER_PHONE);
  if (!requester) return;
  const now = Date.now();
  const orders: Array<Omit<Order, "id" | "created_at">> = [
    {
      user_id: requester.id,
      location: "Pioneer Square, near the pergola",
      note: "Two care packages for outreach drop-off.",
      status: "open",
      posted: new Date(now - 1000 * 60 * 22).toISOString(),
      items: [
        { item_id: itemId(stores.items, "snack-kit"), quantity: 2 },
        { item_id: itemId(stores.items, "socks-underwear"), quantity: 2 },
        { item_id: itemId(stores.items, "blanket"), quantity: 1 },
      ],
    },
    {
      user_id: requester.id,
      location: "12th Ave & E Jefferson, outside library",
      note: "Warm layers requested before evening.",
      status: "fulfilled",
      posted: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
      items: [
        { item_id: itemId(stores.items, "hat-gloves-scarf"), quantity: 1 },
        { item_id: itemId(stores.items, "jacket"), quantity: 1 },
      ],
    },
  ];
  for (const order of orders) {
    await stores.orders.insert(order);
  }
}

async function seedDemoDonations(stores: Stores): Promise<void> {
  if (stores.donations.all().length > 0) return;
  const requester = stores.users.find((u) => u.phone_number === DEMO_REQUESTER_PHONE);
  const donations: Array<
    | Omit<SuppliesDonation, "id" | "created_at">
    | Omit<MoneyDonation, "id" | "created_at">
  > = [
    {
      kind: "supplies",
      user_id: requester?.id ?? null,
      items: [
        { item_id: itemId(stores.items, "snack-kit"), quantity: 6 },
        { item_id: itemId(stores.items, "dental"), quantity: 4 },
      ],
    },
    {
      kind: "money",
      user_id: null,
      amount_cents: 2500,
    },
  ];
  for (const donation of donations) {
    await stores.donations.insert(donation);
  }
}

export async function run({ stores, config }: { stores: Stores; config: Config }): Promise<void> {
  await seedItems(stores.items);
  await seedInventory(stores.inventory, stores.items);
  await seedDemoUsers(stores.users);
  await seedDemoInventory(stores.inventory, stores.items);
  await seedDemoOrders(stores);
  await seedDemoDonations(stores);
  await seedAdmin(stores.users, config.SEED_ADMIN_PHONE);
}

export default { run, ITEM_SEED };
