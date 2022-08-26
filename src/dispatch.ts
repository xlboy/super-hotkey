import type { HotkeyConfig } from './hotkey-config-poll';

class EventDispatch {
  public dispatch = (hotkeyConfig: HotkeyConfig, event: KeyboardEvent) => {
    console.log('hotkeyConfig', hotkeyConfig);

    switch (hotkeyConfig.feature.type) {
      case 'callback':
        hotkeyConfig.feature.options.callback(event);
        break;
    }
  };
}

export const dispatch = new EventDispatch();
