import type { DefaultModifierKey } from '../constants/keyboard-key';
import type { UnifiedFeature } from '../types/entrance';

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

export function filterTargetElementToObserve(
  featureOption: UnifiedFeature
): HTMLElement | Window {
  let targetElement!: HTMLElement | Window;
  const globalThisPolyfill: Window = getGlobalThis();

  if (featureOption.type === 'callback') {
    targetElement = featureOption.options.targetElement || globalThisPolyfill;
  } else {
    targetElement = featureOption.options.focusElement || globalThisPolyfill;
  }

  return targetElement;

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
}
