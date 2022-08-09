/* 池的抽象。按键记录、热键及缓存池的可复用逻辑 */
export abstract class IPool<Entry extends object> {
  /* 当前池的数量 */
  abstract size(): number;

  /* 清空记录 */
  abstract clear(): void;

  /**
   * 添加一条记录
   * @param entry
   */
  abstract addEntry(entry: Entry): void;

  /**
   * 获取一个实体
   * @param conditions 筛选条件
   */
  abstract getEntry(conditions: Partial<Entry>): Entry | undefined;

  /**
   * 获取符合条件的实体集合
   * @param conditions 筛选条件
   */
  abstract getEntrys(conditions: Partial<Entry>): Entry[];
}

export type FilterOptions<T> = {
  [k in keyof T]?: T[k];
};
