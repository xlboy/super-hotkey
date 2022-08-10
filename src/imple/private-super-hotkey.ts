import type { KeyboardKey } from '../types/hotkey';
import type { IKeyboardRecordPool } from '../types/i-keyboard-record-pool';
import type { TriggerMode } from '../types/option';
import { globalThisPolyfill } from '../utils/global-this-polyfill';

/* SuperHotkey的私有属性和方法 */
export class PrivateSuperHotkey {
  protected keyboardRecordPool: IKeyboardRecordPool;

  private event: Record<TriggerMode, (event: KeyboardEvent) => void> = {
    keydown: this.getAddRecordFunc('keydown'),
    keypress: this.getAddRecordFunc('keypress'),
    keyup: this.getAddRecordFunc('keyup')
  };

  constructor(_keyboardRecordPool: IKeyboardRecordPool) {
    this.keyboardRecordPool = _keyboardRecordPool;
  }

  /* 监听用户的键盘事件并进行记录 */
  public startListenKeyboardEvent() {
    for (const event in this.event) {
      if (Object.prototype.hasOwnProperty.call(this.event, event)) {
        globalThisPolyfill.addEventListener(event, Reflect.get(this.event, event));
      }
    }
  }

  /* 注销监听 */
  protected privateDestroy() {
    for (const event in this.event) {
      if (Object.prototype.hasOwnProperty.call(this.event, event)) {
        globalThisPolyfill.removeEventListener(event, Reflect.get(this.event, event));
      }
    }

    this.keyboardRecordPool.clear();
  }

  /* 添加一条记录 */
  private getAddRecordFunc(triggerMode: TriggerMode) {
    return (event: KeyboardEvent) => {
      this.keyboardRecordPool.addEntry({
        focusEl: event.target,
        index: this.keyboardRecordPool.size(),
        key: event.key as KeyboardKey,
        timestamp: Date.now(),
        triggerMode
      });

      console.log(this.keyboardRecordPool.getData());
    };
  }
}
