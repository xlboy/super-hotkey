import type { DefaultModifierKey } from './constants/keyboard-key';
import type { FilterOptions } from './types/i-pool';

export function getPressedModifierKeys(event: KeyboardEvent): DefaultModifierKey[] {
  const pressedModifierKeys: DefaultModifierKey[] = [];

  if (event.ctrlKey) {
    pressedModifierKeys.push('Control');
  }

  if (event.altKey) {
    pressedModifierKeys.push('Alt');
  }

  if (event.metaKey) {
    pressedModifierKeys.push('Meta');
  }

  if (event.shiftKey) {
    pressedModifierKeys.push('Shift');
  }

  return pressedModifierKeys;
}

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
