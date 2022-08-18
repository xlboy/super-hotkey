import type { DefaultModifierKey } from '../constants/keyboard-key';

/**
 * @see https://github.com/alibaba/designable/blob/main/packages/shared/src/globalThisPolyfill.ts
 * @returns
 */
function getGlobalThis() {
  try {
    if (typeof self !== 'undefined') {
      return self;
    }
  } catch (e) {}

  try {
    if (typeof globalThisPolyfill !== 'undefined') {
      return globalThisPolyfill;
    }
  } catch (e) {}

  try {
    if (typeof global !== 'undefined') {
      return global;
    }
  } catch (e) {}

  return Function('return this')();
}

export const globalThisPolyfill: Window = getGlobalThis();

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
