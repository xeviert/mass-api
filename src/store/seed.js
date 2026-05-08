const ITEM_SEED = [
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

async function seedItems(itemsStore) {
  if (itemsStore.all().length > 0) return;
  for (const item of ITEM_SEED) {
    await itemsStore.insert(item);
  }
}

async function seedAdmin(usersStore, adminPhone) {
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
      `Register that phone via POST /api/user and it will be promoted on next startup.`
  );
}

async function run({ stores, config }) {
  await seedItems(stores.items);
  await seedAdmin(stores.users, config.SEED_ADMIN_PHONE);
}

module.exports = { run, ITEM_SEED };
