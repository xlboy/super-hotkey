import type { KeyboardKey } from './hotkey';
import type { TriggerMode } from './option';
import type { DefaultModifierKey } from '../constants/keyboard-key';

/* 按键记录 */
export type KeyboardRecord = {
  /* 时间戳 */
  timestamp: number;
  /* 触发的按键 */
  commonKey: KeyboardKey;
  /* 当前按键的修饰键 */
  modifierKeys: DefaultModifierKey[];
  /* 触发记录的模式 */
  triggerMode: TriggerMode;
  /* 序号、键序列 */
  index: number;
  /* 触发事件时聚焦的元素 */
  focusEl: EventTarget | null;
};
