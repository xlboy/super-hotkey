import { KeyboardRecordPool } from './imple/keyboard-record-pool';
import { SuperHotkey } from './imple/super-hotkey';

export function createSuperHotkey() {
  const superHotkey = new SuperHotkey(new KeyboardRecordPool());

  return superHotkey;
}

const superHotkey = createSuperHotkey();

export default superHotkey;
