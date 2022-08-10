import { Pool } from './pool';
import type { IKeyboardRecordPool } from '../types/i-keyboard-record-pool';
import type { KeyboardRecord } from '../types/keyboard-record';

/* 按键记录池 */
export class KeyboardRecordPool
  extends Pool<KeyboardRecord>
  implements IKeyboardRecordPool {}
