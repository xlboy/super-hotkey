/* 池的抽象。按键记录、热键及缓存池的可复用逻辑 */
export abstract class IPool<Entity extends object> {
  /* 当前池的数量 */
  abstract size(): number;

  /* 清空记录 */
  abstract clear(): void;

  /**
   * 添加一条记录
   * @param entry
   */
  abstract addEntry(entry: Entity): void;

  /**
   * 获取一个实体
   * @param conditions 筛选条件
   */
  abstract getEntry(conditions: FilterOptions<Entity>): Entity | undefined;

  /**
   * 获取符合条件的实体集合
   * @param conditions 筛选条件
   */
  abstract getEntrys(conditions: FilterOptions<Entity>): Entity[];

  /**
   * 获得当前池的所有数据
   */
  abstract getData(): Entity[];

  /**
   * 过滤
   * @param conditions 过滤条件
   */
  abstract filter(conditions: FilterOptions<Entity>): Entity[];

  /**
   * 过滤
   * @param func 过滤的方法
   */
  abstract filter(func: (data: Entity) => boolean): Entity[];
}

export type FilterOptions<T> = {
  [k in keyof T]?: T[k];
};
