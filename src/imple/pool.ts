import type { FilterOptions, IPool } from '../types/i-pool';
import { filter } from '../utils/filter';

export class Pool<Entity extends object> implements IPool<Entity> {
  private pool: Entity[] = [];

  size(): number {
    return this.pool.length;
  }

  clear(): void {
    this.pool = [];
  }

  addEntry(entry: Entity) {
    this.pool.push(entry);
  }

  getData(): Entity[] {
    return this.pool;
  }

  getEntry(conditions: FilterOptions<Entity>): Entity | undefined {
    return this.getEntrys(conditions)?.[0];
  }

  getEntrys(conditions: FilterOptions<Entity>): Entity[] {
    return filter(this.pool, conditions);
  }

  filter(conditions: FilterOptions<Entity> | ((data: Entity) => boolean)): Entity[] {
    if (typeof conditions === 'object') {
      this.pool = this.getEntrys(conditions);
    } else if (typeof conditions === 'function') {
      this.pool = this.pool.filter(conditions);
    }

    return this.getData();
  }
}
