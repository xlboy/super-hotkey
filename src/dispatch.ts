import type { HotkeyConfig } from './hotkey-config-poll';

class EventDispatch {
  public dispatch(hotkeyConfigs: HotkeyConfig[], event: KeyboardEvent) {
    console.log('hotkeyConfigs', hotkeyConfigs);
  }
}

export const dispatch = new EventDispatch();
