import type { PartialDeep } from 'type-fest';

import { hotkeyInfoPool } from './data-pool/hotkey-info-poll';
import type { ObserveParams } from './keypress-observer';
import { keypressObserver } from './keypress-observer';
import type { ExtractFunctionFromPolymorphicType } from './types/base';
import { defineVariables } from './types/base';
import type {
  PolymorphicHotkeyParams,
  SuperHotkey,
  UnbindFeatureCondition
} from './types/entrance';
import type { CallbackOptions, DOMMethodOptions } from './types/option';
import { globalThisPolyfill } from './utils/global-this-polyfill';
import { convertPolymorphicHotkeyToUnified } from './utils/transform';

const superHotkey = defineVariables<ExtractFunctionFromPolymorphicType<SuperHotkey>>()(
  (hotkey, featureOptions) => {
    const unifiedHotkeys = convertPolymorphicHotkeyToUnified(hotkey);

    // TODO: 需要判断一下传入的 ID 是否有重复，有的话则 throw 告知
    const addSuccessfulHotkeyID = hotkeyInfoPool.add({
      hotkeys: unifiedHotkeys,
      feature: featureOptions
    });

    if (addSuccessfulHotkeyID) {
      if (featureOptions.type === 'callback') {
        const keypressObserveParams: ObserveParams = {
          targetElement: featureOptions.options.targetElement || globalThisPolyfill,
          eventType: featureOptions.options.trigger?.mode || 'keydown',
          hotkeyID: addSuccessfulHotkeyID
        };

        keypressObserver.observe(keypressObserveParams);
      } else if (featureOptions.type === 'domMethod') {
        const keypressObserveParams: ObserveParams = {
          targetElement: featureOptions.options.focusElement || globalThisPolyfill,
          eventType: featureOptions.options.trigger?.mode || 'keydown',
          hotkeyID: addSuccessfulHotkeyID
        };

        keypressObserver.observe(keypressObserveParams);
      }
    } else {
      throw new Error('添加失败，因 ID 重复');
    }
  }
) as unknown as SuperHotkey;

superHotkey.bindCallback = (hotkey, options) => {
  superHotkey(hotkey, {
    type: 'callback',
    options
  });
};

superHotkey.bindDOMMethod = (hotkey, options) => {
  superHotkey(hotkey, {
    type: 'domMethod',
    options
  });
};

superHotkey.unbind = (...args: [PolymorphicHotkeyParams?, UnbindFeatureCondition?]) => {
  // hotkeyController.uninstall(hotkey);
};

superHotkey.unbindDOMMethod = (
  ...args: [] | [PolymorphicHotkeyParams, PartialDeep<DOMMethodOptions>?]
) => {
  const isDefaultUnbindAll = args.length === 0;

  if (isDefaultUnbindAll) {
    superHotkey.unbind();
  } else {
    const [hotkey, conditions] = args;

    superHotkey.unbind(hotkey, {
      type: 'domMethod',
      options: conditions
    });
  }
};

superHotkey.unbindCallback = (
  ...args: [] | [PolymorphicHotkeyParams, PartialDeep<CallbackOptions>?]
) => {
  const isDefaultUnbindAll = args.length === 0;

  if (isDefaultUnbindAll) {
    superHotkey.unbind();
  } else {
    const [hotkey, conditions] = args;

    superHotkey.unbind(hotkey, {
      type: 'callback',
      options: conditions
    });
  }
};

export { superHotkey };
