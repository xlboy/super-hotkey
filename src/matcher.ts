import type { MergedModifierKey, MergedNormalKey } from './constants/keyboard-key';
import type { KeypressRecord } from './data-pool/keypress-record-poll';

interface KeyComb {
  modifierKeys: MergedModifierKey[];
  normalKey: MergedNormalKey;
  timeStamp: number;
}

class Matcher {
  // private historyKeypress

  // private activeKeySequenceGroup: Array<{}> = [];

  private focusElementKeyCombMap: WeakMap<EventTarget, Array<KeyComb>> = new WeakMap();

  public match(
    event: KeyboardEvent,
    isLongPressHotkey: boolean,
    keypressRecord: KeypressRecord
  ) {
    if (isLongPressHotkey) {
      this.longPressHandler;
    } else {
      const { focusElement, modifierKeys, normalKey, timeStamp } = keypressRecord;

      this.focusElementKeyCombMap.set(
        focusElement,
        (this.focusElementKeyCombMap.get(focusElement) || []).concat({
          modifierKeys,
          normalKey,
          timeStamp
        })
      );

      const lastTwoKeyComb = [
        this.focusElementKeyCombMap.get(focusElement)!.at(-2),
        this.focusElementKeyCombMap.get(focusElement)!.at(-1)
      ];
    }
  }

  private longPressHandler() {}
}

export const matcher = new Matcher();
