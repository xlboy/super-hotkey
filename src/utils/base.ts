import type { ReadonlyDeep } from 'type-fest';

import type { DefaultModifierKey } from '../constants/keyboard-key';
import type FeatureOption from '../types/feature-option';

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
  featureOption: FeatureOption.Internal.Union
): HTMLElement | Document {
  let targetElement!: HTMLElement | Document;

  if (featureOption.type === 'callback') {
    targetElement = featureOption.options.targetElement || document;
  } else {
    targetElement = featureOption.options.focusElement || document;
  }

  return targetElement;
}
