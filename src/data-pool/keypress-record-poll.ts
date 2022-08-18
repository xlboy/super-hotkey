import type { HotkeyConfig } from './hotkey-config-poll';
import type { DefaultModifierKey, DefaultNormalKey } from '../constants/keyboard-key';
import type { TriggerMode } from '../types/option';

type KeypressRecord = {
  timestamp: number;
  normalKey: DefaultNormalKey;
  modifierKeys: DefaultModifierKey[];
  focusElment: EventTarget | null;
  triggerMode: TriggerMode;
  hotkeyId: HotkeyConfig['id'];
  event: KeyboardEvent;
};

class KeypressRecordPool {
  private keypressRecords: KeypressRecord[] = [];

  public clear() {
    this.keypressRecords = [];
  }

  public add(keypressRecord: KeypressRecord) {
    this.keypressRecords.push(keypressRecord);
  }

  public removeByHotkeyId(hotkeyId: KeypressRecord['hotkeyId']): void {
    const indexToRemove = this.keypressRecords.findIndex(
      record => record.hotkeyId === hotkeyId
    );

    if (indexToRemove !== -1) {
      this.keypressRecords.splice(indexToRemove, 1);
    }
  }

  public find(/* 查询条件待定 */) {}
}

export const keypressRecordPool = new KeypressRecordPool();
