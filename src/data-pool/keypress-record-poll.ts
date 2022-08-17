import type { DefaultModifierKey, DefaultNormalKey } from '../constants/keyboard-key';
import type { TriggerMode } from '../types/option';

type KeypressRecord = {
  timestamp: number;
  normalKey: DefaultNormalKey;
  modifierKeys: DefaultModifierKey[];
  focusElment: EventTarget | null;
  eventType: TriggerMode;
};

class KeypressRecordPool {
  private keypressRecords: KeypressRecord[] = [];

  public clear() {
    this.keypressRecords = [];
  }

  public add(keypressRecord: KeypressRecord) {
    this.keypressRecords.push(keypressRecord);
  }

  public remove(/* 删除条件待定 */): void {}

  public find(/* 查询条件待定 */) {}

  public update() {}
}

export const keypressRecordPool = new KeypressRecordPool();
