import { hotkeyInfoPool } from './data-pool/hotkey';
import type { UnifiedHotkey, UniformFeature } from './types/entrance';

class HotkeyController {
  register(hotkey: UnifiedHotkey, options: UniformFeature): void {
    if (hotkey.type === 'common') {
      hotkeyInfoPool.add({
        feature: options,
        hotkey
      });
    }
  }
  uninstall(hotkey: UnifiedHotkey): void {
    throw new Error('Method not implemented.');
  }

  update(): void {
    throw new Error('Method not implemented.');
  }
}

export const hotkeyController = new HotkeyController();
