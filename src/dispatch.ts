import type { HotkeyConfig } from './data-pool/hotkey-config-poll';

class EventDispatch {
  public dispatch(hotkeyConfigs: HotkeyConfig[], event: KeyboardEvent) {
    console.log('hotkeyConfigs', hotkeyConfigs);
  }
}

export const dispatch = new EventDispatch();
