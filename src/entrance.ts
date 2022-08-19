import type { PartialDeep } from 'type-fest';

import { defaultTriggerOptions } from './constants/base';
import { hotkeyConfigPool } from './data-pool/hotkey-config-poll';
import { keypressObserver } from './keypress-observer';
import type { ExtractFunctionFromPolymorphicType } from './types/base';
import { defineVariables } from './types/base';
import type {
  PolymorphicHotkeyParams,
  SuperHotkey,
  UnbindFeatureCondition
} from './types/entrance';
import type { CallbackOptions, DOMMethodOptions } from './types/option';
import { filterTargetElementToObserve } from './utils/base';
import { convertPolymorphicHotkeyToUnified } from './utils/transform';

const superHotkey = defineVariables<ExtractFunctionFromPolymorphicType<SuperHotkey>>()(
  (hotkey, featureOption) => {
    const unifiedHotkeys = convertPolymorphicHotkeyToUnified(hotkey);

    Object.assign(featureOption.options.trigger || {}, defaultTriggerOptions);

    // TODO: 需要判断一下传入的 Id 是否有重复，有的话则 throw 告知
    const addSuccessfulHotkeyId = hotkeyConfigPool.add({
      keyCombinations: unifiedHotkeys,
      feature: featureOption
    });

    if (addSuccessfulHotkeyId) {
      keypressObserver.observeByHotkeyId(addSuccessfulHotkeyId);
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
  const defaultAllUnbind = args.length === 0;

  if (defaultAllUnbind) {
    hotkeyConfigPool.clear();
  } else {
    const [hotkey, featureCondition] = args;
    const unifiedHotkeys = convertPolymorphicHotkeyToUnified(hotkey);

    // 从热键配置池中删除
    const completelyRemoveConfigs = hotkeyConfigPool.remove({
      featureCondition,
      hotkeys: unifiedHotkeys
    });

    // 再根据热键池中可能整个删掉的配置来取消按键监听
    completelyRemoveConfigs.forEach(removedConfig => {
      keypressObserver.stopObserve({
        hotkeyId: removedConfig.id,
        targetElement: filterTargetElementToObserve(removedConfig.feature),
        triggerOptions: removedConfig.feature.options.trigger
      });
    });
  }
};

superHotkey.unbindDOMMethod = (
  ...args:
    | []
    | [hotkey: PolymorphicHotkeyParams, condition?: PartialDeep<DOMMethodOptions>]
) => {
  const defaultAllUnbind = args.length === 0;

  if (defaultAllUnbind) {
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
  const defaultAllUnbind = args.length === 0;

  if (defaultAllUnbind) {
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
