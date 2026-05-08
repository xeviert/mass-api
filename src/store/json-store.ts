import * as fs from "fs/promises";
import * as path from "path";

export interface BaseRecord {
  id: number;
  created_at?: string;
}

export class JsonStore<T extends BaseRecord> {
  private filePath: string;
  private defaults: T[];
  private records: T[];
  private nextId: number;
  private writeChain: Promise<void>;
  private loaded: boolean;

  constructor(filePath: string, { defaults = [] as T[] }: { defaults?: T[] } = {}) {
    this.filePath = filePath;
    this.defaults = defaults;
    this.records = [];
    this.nextId = 1;
    this.writeChain = Promise.resolve();
    this.loaded = false;
  }

  async load(): Promise<void> {
    if (this.loaded) return;
    try {
      const raw = await fs.readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw);
      this.records = Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        this.records = [...this.defaults];
        await fs.mkdir(path.dirname(this.filePath), { recursive: true });
        await this._writeNow(this.records);
      } else {
        throw err;
      }
    }
    this.nextId =
      this.records.reduce(
        (m, r) => (typeof r.id === "number" && r.id > m ? r.id : m),
        0,
      ) + 1;
    this.loaded = true;
  }

  private async _writeNow(records: T[]): Promise<void> {
    const tmp = `${this.filePath}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(records, null, 2), "utf8");
    await fs.rename(tmp, this.filePath);
  }

  private _enqueueWrite(): Promise<void> {
    const snapshot = [...this.records];
    this.writeChain = this.writeChain
      .then(() => this._writeNow(snapshot))
      .catch((err) => {
        console.error(`JsonStore write failed for ${this.filePath}:`, err);
      });
    return this.writeChain;
  }

  all(): T[] {
    return [...this.records];
  }

  find(predicate: (record: T) => boolean): T | null {
    return this.records.find(predicate) || null;
  }

  filter(predicate: (record: T) => boolean): T[] {
    return this.records.filter(predicate);
  }

  findById(id: number | string): T | null {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    return this.records.find((r) => r.id === numericId) || null;
  }

  async insert(record: Omit<T, "id" | "created_at"> & { created_at?: string }): Promise<T> {
    const newRecord = {
      ...(record as object),
      id: this.nextId++,
      created_at: record.created_at || new Date().toISOString(),
    } as T;
    this.records.push(newRecord);
    await this._enqueueWrite();
    return newRecord;
  }

  async update(id: number | string, patch: Partial<T>): Promise<T | null> {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    const idx = this.records.findIndex((r) => r.id === numericId);
    if (idx === -1) return null;
    this.records[idx] = { ...this.records[idx], ...patch } as T;
    await this._enqueueWrite();
    return this.records[idx]!;
  }

  async remove(id: number | string): Promise<boolean> {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    const idx = this.records.findIndex((r) => r.id === numericId);
    if (idx === -1) return false;
    this.records.splice(idx, 1);
    await this._enqueueWrite();
    return true;
  }
}
