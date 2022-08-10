import { IPool } from './i-pool';
import type { KeyboardRecord } from './keyboard-record';

/* 按键记录池 */
export abstract class IKeyboardRecordPool extends IPool<KeyboardRecord> {}
