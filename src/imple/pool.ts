import type { FilterOptions, IPool } from '../types/i-pool';
import { filter } from '../utils';

export class Pool<Entry extends object> implements IPool<Entry> {
  private pool: Entry[] = [];

  size(): number {
    return this.pool.length;
  }

  clear(): void {
    this.pool = [];
  }

  addEntry(entry: Entry) {
    this.pool.push(entry);
  }

  getData(): Entry[] {
    return this.pool;
  }

  getEntry(conditions: FilterOptions<Entry>): Entry | undefined {
    return this.getEntrys(conditions)?.[0];
  }

  getEntrys(conditions: FilterOptions<Entry>): Entry[] {
    return filter(this.pool, conditions);
  }

  filter(conditions: FilterOptions<Entry> | ((data: Entry) => boolean)): Entry[] {
    if (typeof conditions === 'object') {
      this.pool = this.getEntrys(conditions);
    } else if (typeof conditions === 'function') {
      this.pool = this.pool.filter(conditions);
    }

    return this.getData();
  }
}
