import { hotkeyController } from './hotkey-controller';
import type { ExtractFunctionFromPolymorphic } from './types/base';
import { defineVariables } from './types/base';
import type { SuperHotkey } from './types/entrance';
import { convertPolymorphicHotkeyToUnified } from './utils/transform';

const superHotkey = defineVariables<ExtractFunctionFromPolymorphic<SuperHotkey>>()(
  (hotkey, options) => {
    const unifiedHotkey = convertPolymorphicHotkeyToUnified(hotkey);

    hotkeyController.register(unifiedHotkey, options);
  }
) as unknown as SuperHotkey;

superHotkey.bindCallback = (hotkey, options) => {
  const unifiedHotkey = convertPolymorphicHotkeyToUnified(hotkey);

  hotkeyController.uninstall(unifiedHotkey);
};

superHotkey.bindDOMMethod = (hotkey, options) => {
  const unifiedHotkey = convertPolymorphicHotkeyToUnified(hotkey);

  hotkeyController.register(unifiedHotkey, {
    type: 'domMethod',
    options
  });
};

superHotkey.unbindDOMMethod = hotkey => {
  const unifiedHotkey = convertPolymorphicHotkeyToUnified(hotkey);

  hotkeyController.uninstall(unifiedHotkey);
};

superHotkey.unbind = (hotkey, options) => {
  // hotkeyController.uninstall(hotkey);
};

superHotkey.unbindCallback = hotkey => {
  // hotkeyController.uninstall(hotkey);
};

export { superHotkey };
