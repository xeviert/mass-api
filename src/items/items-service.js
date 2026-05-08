const xss = require("xss");

const REQUIRED_FIELDS = ["slug", "name", "blurb", "icon", "category"];

const ItemsService = {
  serialize(item) {
    return {
      id: item.id,
      slug: xss(item.slug),
      name: xss(item.name),
      blurb: xss(item.blurb),
      icon: xss(item.icon),
      category: xss(item.category),
    };
  },

  list(stores) {
    return stores.items.all().map(ItemsService.serialize);
  },

  getById(stores, id) {
    const item = stores.items.findById(id);
    return item ? ItemsService.serialize(item) : null;
  },

  validate(body, { partial = false } = {}) {
    if (!partial) {
      for (const field of REQUIRED_FIELDS) {
        if (body[field] == null || body[field] === "") {
          return `Missing '${field}' in request body`;
        }
      }
    }
    if (body.slug != null && !/^[a-z0-9-]+$/.test(body.slug)) {
      return "slug must be lowercase letters, numbers, and dashes";
    }
    return null;
  },

  slugTaken(stores, slug, excludeId) {
    const existing = stores.items.find((i) => i.slug === slug);
    if (!existing) return false;
    return excludeId == null || existing.id !== excludeId;
  },

  insert(stores, body) {
    const record = {};
    for (const f of REQUIRED_FIELDS) record[f] = body[f];
    return stores.items.insert(record);
  },

  update(stores, id, patch) {
    const filtered = {};
    for (const f of REQUIRED_FIELDS) {
      if (patch[f] != null) filtered[f] = patch[f];
    }
    return stores.items.update(id, filtered);
  },

  remove(stores, id) {
    return stores.items.remove(id);
  },
};

module.exports = ItemsService;
