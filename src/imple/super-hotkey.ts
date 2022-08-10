import { PrivateSuperHotkey } from './private-super-hotkey';
import type { IKeyboardRecordPool } from '../types/i-keyboard-record-pool';
import type { ISuperHotkey } from '../types/i-super-hotkey';

export class SuperHotkey extends PrivateSuperHotkey implements ISuperHotkey {
  constructor(_keyboardRecordPool: IKeyboardRecordPool) {
    super(_keyboardRecordPool);
  }

  destroy() {
    this.privateDestroy();
  }
}
