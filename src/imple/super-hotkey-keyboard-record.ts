import { KeyboardRecordPool } from './keyboard-record-pool';
import { AddKeyboardRecord } from '../events';
import type { KeyboardKey } from '../types/hotkey';
import type { IEvent } from '../types/i-event';
import type { IKeyboardRecordPool } from '../types/i-keyboard-record-pool';
import type { ISuperHotkeyKeyboardRecord } from '../types/i-super-hotkey-keyboard-record';
import type { KeyboardRecord } from '../types/keyboard-record';
import type { TriggerMode } from '../types/option';
import { getPressedModifierKeys } from '../utils';
import { globalThisPolyfill } from '../utils/global-this-polyfill';

export class SuperHotkeyKebordRecord implements ISuperHotkeyKeyboardRecord {
  public keyboardRecordPool: IKeyboardRecordPool;
  private event: IEvent;

  private events: Record<TriggerMode, (event: KeyboardEvent) => void> = {
    keydown: this.getAddRecordFunc('keydown'),
    keypress: this.getAddRecordFunc('keypress'),
    keyup: this.getAddRecordFunc('keyup')
  };

  constructor(_event: IEvent) {
    this.event = _event;
    this.keyboardRecordPool = new KeyboardRecordPool();
  }

  public startListenKeyboardEvent() {
    for (const event in this.events) {
      if (Object.prototype.hasOwnProperty.call(this.events, event)) {
        globalThisPolyfill.addEventListener(event, Reflect.get(this.events, event));
      }
    }
  }

  public stopListenKeyboardEvent() {
    for (const event in this.events) {
      if (Object.prototype.hasOwnProperty.call(this.events, event)) {
        globalThisPolyfill.removeEventListener(event, Reflect.get(this.events, event));
      }
    }
  }

  public destroy() {
    this.stopListenKeyboardEvent();
    this.keyboardRecordPool.clear();
  }

  /* 添加一条记录 */
  private getAddRecordFunc(triggerMode: TriggerMode) {
    return (event: KeyboardEvent) => {
      const data: KeyboardRecord = {
        focusEl: event.target,
        index: this.keyboardRecordPool.size(),
        commonKey: event.key as KeyboardKey,
        modifierKeys: getPressedModifierKeys(event),
        timestamp: Date.now(),
        triggerMode
      };

      this.keyboardRecordPool.addEntry(data);
      this.event.dispatch(new AddKeyboardRecord(data));
    };
  }

  get lastRecord() {
    return this.keyboardRecordPool.getData().at(-1);
  }
}
