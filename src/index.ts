import { SuperHotkey } from './imple/super-hotkey';

export * from './events';
export * from './types/keyboard-record';

export function createSuperHotkey() {
  const superHotkey = new SuperHotkey();

  return superHotkey;
}

const superHotkey = createSuperHotkey();

export default superHotkey;
