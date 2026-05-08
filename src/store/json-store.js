const fs = require("fs/promises");
const path = require("path");

class JsonStore {
  constructor(filePath, { defaults = [] } = {}) {
    this.filePath = filePath;
    this.defaults = defaults;
    this.records = [];
    this.nextId = 1;
    this.writeChain = Promise.resolve();
    this.loaded = false;
  }

  async load() {
    if (this.loaded) return;
    try {
      const raw = await fs.readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw);
      this.records = Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      if (err.code === "ENOENT") {
        this.records = [...this.defaults];
        await fs.mkdir(path.dirname(this.filePath), { recursive: true });
        await this._writeNow(this.records);
      } else {
        throw err;
      }
    }
    this.nextId =
      this.records.reduce((m, r) => (typeof r.id === "number" && r.id > m ? r.id : m), 0) + 1;
    this.loaded = true;
  }

  async _writeNow(records) {
    const tmp = `${this.filePath}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(records, null, 2), "utf8");
    await fs.rename(tmp, this.filePath);
  }

  _enqueueWrite() {
    const snapshot = [...this.records];
    this.writeChain = this.writeChain.then(() => this._writeNow(snapshot)).catch((err) => {
      console.error(`JsonStore write failed for ${this.filePath}:`, err);
    });
    return this.writeChain;
  }

  all() {
    return [...this.records];
  }

  find(predicate) {
    return this.records.find(predicate) || null;
  }

  filter(predicate) {
    return this.records.filter(predicate);
  }

  findById(id) {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    return this.records.find((r) => r.id === numericId) || null;
  }

  async insert(record) {
    const newRecord = {
      id: this.nextId++,
      ...record,
      created_at: record.created_at || new Date().toISOString(),
    };
    this.records.push(newRecord);
    await this._enqueueWrite();
    return newRecord;
  }

  async update(id, patch) {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    const idx = this.records.findIndex((r) => r.id === numericId);
    if (idx === -1) return null;
    this.records[idx] = { ...this.records[idx], ...patch };
    await this._enqueueWrite();
    return this.records[idx];
  }

  async remove(id) {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    const idx = this.records.findIndex((r) => r.id === numericId);
    if (idx === -1) return false;
    this.records.splice(idx, 1);
    await this._enqueueWrite();
    return true;
  }
}

module.exports = JsonStore;
