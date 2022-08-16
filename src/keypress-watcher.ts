import type { DefaultNormalKey } from './constants/keyboard-key';
import { keypressRecordPool } from './data-pool/keypress';
import type { TriggerMode } from './types/option';
import { getPressedModifierKeys } from './utils/hotkey';

class KeypressWatcher {
  watch(
    targetElement: HTMLElement,
    options: {
      eventType: TriggerMode;
    }
  ) {
    targetElement.addEventListener(options.eventType, e => {
      keypressRecordPool.add({
        eventType: options.eventType,
        focusElment: e.target,
        normalKey: e.key as DefaultNormalKey,
        modifierKeys: getPressedModifierKeys(e),
        timestamp: Date.now()
      });
    });
  }

  destroy(
    targetElement: HTMLElement,
    options: {
      eventType: TriggerMode;
    }
  ) {
    // targetElement.removeEventListener(options.eventType);
  }

  private getKeyEventHandler() {}
}

export const keypressWatcher = new KeypressWatcher();
