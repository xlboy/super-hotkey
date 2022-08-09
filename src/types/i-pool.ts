/* 池的抽象。按键记录、热键及缓存池的可复用逻辑 */
export abstract class IPool<Entry extends object> {
  /* 记录储存 */
  protected pool: Entry[] = [];

  /* 当前池的数量 */
  abstract size(): number;

  /* 清空记录 */
  abstract clear(): void;

  /**
   * 添加一条记录
   * @param entry
   * @return number 当前实体的序列号
   */
  abstract addEntry(entry: Entry): number;

  /**
   * 获取一个实体
   * @param filter 筛选条件
   */
  abstract getEntry(filter: Partial<Entry>): Entry;

  /**
   * 获取符合条件的实体集合
   * @param filter 筛选条件
   */
  abstract getEntrys(filter: Partial<Entry>): Entry[];
}
