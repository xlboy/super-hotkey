import type { FilterOptions } from '../types/i-pool';

export function filter<T extends object>(list: T[], conditions: FilterOptions<T>) {
  const result: T[] = [];
  const conditionsArr = Object.entries(conditions);
  let length = -1;

  while (++length < list.length) {
    const item = list[length];
    let isRight = true;

    for (const [key, value] of conditionsArr) {
      if (Reflect.get(item, key) !== value) {
        isRight = false;
        break;
      }
    }

    if (isRight) {
      result.push(item);
    }
  }

  return result;
}
