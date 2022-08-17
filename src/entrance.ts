import type { PartialDeep } from 'type-fest';

import { hotkeyConfigPool } from './data-pool/hotkey-config-poll';
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

    // TODO: 需要判断一下传入的 Id 是否有重复，有的话则 throw 告知
    const addSuccessfulHotkeyId = hotkeyConfigPool.add({
      hotkeys: unifiedHotkeys,
      feature: featureOptions
    });

    if (addSuccessfulHotkeyId) {
      const keypressObserveParams: Omit<ObserveParams, 'targetElement'> = {
        eventType: featureOptions.options.trigger?.mode || 'keydown',
        hotkeyId: addSuccessfulHotkeyId,
        capture: featureOptions.options.trigger?.capture || false
      };

      let targetElement!: ObserveParams['targetElement'];

      if (featureOptions.type === 'callback') {
        targetElement = featureOptions.options.targetElement || globalThisPolyfill;
      } else if (featureOptions.type === 'domMethod') {
        targetElement = featureOptions.options.focusElement || globalThisPolyfill;
      }

      keypressObserver.observe({
        ...keypressObserveParams,
        targetElement
      });
    } else {
      throw new Error('添加失败，因 Id 重复');
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

superHotkey.unbind = (
  ...args:
    | []
    | [hotkey: PolymorphicHotkeyParams, featureCondition?: UnbindFeatureCondition]
) => {
  const defaultUnbindAll = args.length === 0;

  if (defaultUnbindAll) {
    hotkeyConfigPool.clear();
  } else {
    const [hotkey, featureCondition] = args;
    const unifiedHotkeys = convertPolymorphicHotkeyToUnified(hotkey);
  }
};

superHotkey.unbindDOMMethod = (
  ...args:
    | []
    | [hotkey: PolymorphicHotkeyParams, condition?: PartialDeep<DOMMethodOptions>]
) => {
  const defaultUnbindAll = args.length === 0;

  if (defaultUnbindAll) {
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
  ...args:
    | []
    | [hotkey: PolymorphicHotkeyParams, condition?: PartialDeep<CallbackOptions>]
) => {
  const defaultUnbindAll = args.length === 0;

  if (defaultUnbindAll) {
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
