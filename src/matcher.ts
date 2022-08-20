import type { MergedModifierKey, MergedNormalKey } from './constants/keyboard-key';
import { hotkeyConfigPool } from './data-pool/hotkey-config-poll';
import type { KeypressRecord } from './data-pool/keypress-record-poll';

export interface KeyCombination {
  modifierKeys: MergedModifierKey[];
  normalKey: MergedNormalKey;
  timeStamp: number;
}

class Matcher {
  private targetElKeyCombinationMap: WeakMap<EventTarget, Array<KeyCombination>> =
    new WeakMap();

  public match(
    event: KeyboardEvent,
    isLongPressHotkey: boolean,
    keypressRecord: KeypressRecord
  ) {
    if (isLongPressHotkey) {
      this.longPressHandler;
    } else {
      const { modifierKeys, normalKey, timeStamp, targetElement } = keypressRecord;

      this.targetElKeyCombinationMap.set(
        targetElement,
        (this.targetElKeyCombinationMap.get(targetElement) || []).concat({
          modifierKeys,
          normalKey,
          timeStamp
        })
      );

      const lastTwoKeyCombinations = [
        this.targetElKeyCombinationMap.get(targetElement)!.at(-2),
        this.targetElKeyCombinationMap.get(targetElement)!.at(-1)!
      ] as const;

      const suitedHotkeyConfig =
        hotkeyConfigPool.utils.getSuitedHotkeyConfig(lastTwoKeyCombinations);

      console.log('suitedHotkeyConfig', suitedHotkeyConfig);
    }
  }

  private longPressHandler() {}
}

export const matcher = new Matcher();
