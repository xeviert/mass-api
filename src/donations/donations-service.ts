import type { Stores } from "../store";
import type { Donation, DonationKind, MoneyDonation, SuppliesDonation } from "../types";
import InventoryService from "../inventory/inventory-service";

export interface SerializedDonation {
  id: number;
  kind: DonationKind;
  user_id: number | null;
  created_at: string | null;
  amount_cents?: number;
  items?: Array<{
    item_id: number;
    quantity: number;
    slug: string | null;
    name: string | null;
  }>;
}

const DonationsService = {
  serialize(donation: Donation, stores: Stores): SerializedDonation {
    const base: SerializedDonation = {
      id: donation.id,
      kind: donation.kind,
      user_id: donation.user_id,
      created_at: donation.created_at ?? null,
    };
    if (donation.kind === "money") {
      base.amount_cents = donation.amount_cents;
    } else {
      base.items = donation.items.map((entry) => {
        const item = stores.items.findById(entry.item_id);
        return {
          item_id: entry.item_id,
          quantity: entry.quantity,
          slug: item ? item.slug : null,
          name: item ? item.name : null,
        };
      });
    }
    return base;
  },

  validateNew(body: Record<string, unknown>, stores: Stores): string | null {
    if (body.kind !== "supplies" && body.kind !== "money") {
      return "kind must be 'supplies' or 'money'";
    }
    if (body.kind === "money") {
      const amt = body.amount_cents;
      if (!Number.isInteger(amt) || (amt as number) <= 0) {
        return "amount_cents must be a positive integer";
      }
      return null;
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return "items array is required for supplies donation";
    }
    for (const entry of body.items) {
      if (!entry || typeof entry !== "object") return "Each item must be an object";
      const { item_id, quantity } = entry as { item_id: unknown; quantity: unknown };
      if (!Number.isInteger(item_id)) return "Each item must include integer 'item_id'";
      if (!Number.isInteger(quantity) || (quantity as number) < 1) {
        return "Each item must include integer 'quantity' >= 1";
      }
      if (!stores.items.findById(item_id as number)) {
        return `item_id ${item_id} does not exist`;
      }
    }
    return null;
  },

  async create(
    stores: Stores,
    user_id: number | null,
    body: Record<string, unknown>,
  ): Promise<Donation> {
    if (body.kind === "money") {
      return stores.donations.insert({
        kind: "money",
        user_id,
        amount_cents: body.amount_cents as number,
      } as Omit<MoneyDonation, "id" | "created_at">);
    }
    const items = (body.items as Array<{ item_id: number; quantity: number }>).map(
      ({ item_id, quantity }) => ({ item_id, quantity }),
    );
    const donation = await stores.donations.insert({
      kind: "supplies",
      user_id,
      items,
    } as Omit<SuppliesDonation, "id" | "created_at">);
    for (const { item_id, quantity } of items) {
      await InventoryService.incrementOnHand(stores, item_id, quantity);
    }
    return donation;
  },

  listAll(stores: Stores): Donation[] {
    return stores.donations.all();
  },

  listForUser(stores: Stores, user_id: number): Donation[] {
    return stores.donations.filter((d) => d.user_id === user_id);
  },
};

export default DonationsService;
