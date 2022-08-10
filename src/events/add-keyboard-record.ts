import type { ICustomEvent } from '../types/event';
import type { KeyboardRecord } from '../types/keyboard-record';

/* 添加一条按键事件的记录 */
export class AddKeyboardRecord implements ICustomEvent<KeyboardRecord> {
  type: 'addKeyboardRecord';
  data: KeyboardRecord;

  constructor(e: KeyboardRecord) {
    this.data = e;
  }
}
