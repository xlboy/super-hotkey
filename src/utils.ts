import type { DefaultModifierKey } from './constants/keyboard-key';

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
