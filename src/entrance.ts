import type { PartialDeep } from 'type-fest';

import { defaultTriggerOptions } from './constants/base';
import type { HotkeyConfig } from './hotkey-config-poll';
import { hotkeyConfigPool } from './hotkey-config-poll';
import { keypressObserver } from './keypress-observer';
import type { ExtractFunctionFromPolymorphicType } from './types/base';
import { defineVariables } from './types/base';
import type FeatureOption from './types/feature-option';
import type { Hotkey } from './types/hotkey';
import { filterTargetElementToObserve } from './utils/base';

type HotkeyPolymorphicParams =
  | Hotkey.Polymorphic.Common.Index
  | Hotkey.Polymorphic.Sequence.Index;

export interface SuperHotkey {
  (hotkey: HotkeyPolymorphicParams, featureOption: FeatureOption.External.Union): void;

  // TODO: 其他 API 待完善

  bindDOMMethod(
    hotkey: HotkeyPolymorphicParams,
    options: FeatureOption.External.DOMMethod
  ): void;
  bindCallback(
    hotkey: HotkeyPolymorphicParams,
    options: FeatureOption.External.Callback
  ): void;

  // TODO: 卸载后的返回值还需待确认。（throw？或是返回已成功卸载的某些热键值？或是返回 true，代表着全部卸载成功？）
  // TODO: 重载还需进一步重写

  /**
   * 不传参数则默认为「卸载所有热键」
   */
  unbind(): void;
  unbind(
    hotkey: HotkeyPolymorphicParams,
    featureCondition?: FeatureOption.Condition
  ): void;

  /**
   * 不传参数则默认为「卸载所有与 `domMethod` 相关的热键」
   */
  unbindDOMMethod(): void;
  unbindDOMMethod(
    hotkey: HotkeyPolymorphicParams,
    condition?: PartialDeep<FeatureOption.External.DOMMethod>
  ): void;

  /**
   * 不传参数则默认为「卸载所有与 `callback` 相关的热键」
   */
  unbindCallback(): void;
  unbindCallback(
    hotkey: HotkeyPolymorphicParams,
    conditions: PartialDeep<FeatureOption.External.Callback>
  ): void;

  internal: {
    // unbind(): void;
    bind(
      hotkey: HotkeyConfig['keyComb'],
      featureOption: FeatureOption.External.Union
    ): void;
  };
}

const superHotkey = defineVariables<ExtractFunctionFromPolymorphicType<SuperHotkey>>()(
  (hotkey, featureOption) => {
    const filteredFeatureOption: FeatureOption.Internal.Union = (() => {
      Object.assign(featureOption.options.trigger || {}, defaultTriggerOptions);

      return featureOption as FeatureOption.Internal.Union;
    })();

    // TODO: 需要判断一下传入的 Id 是否有重复，有的话则 throw 告知
    const addSuccessfulHotkeyId = hotkeyConfigPool.add({
      keyComb: hotkeyConfigPool.utils.convertToInternalKeyComb(hotkey),
      feature: filteredFeatureOption
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
    | [hotkey: HotkeyPolymorphicParams, featureCondition?: FeatureOption.Condition]
) => {
  const defaultAllUnbind = args.length === 0;

  if (defaultAllUnbind) {
    hotkeyConfigPool.clear();
  } else {
    const [hotkey, featureCondition] = args;

    // 从热键配置池中删除
    const completelyRemoveConfigs = hotkeyConfigPool.remove({
      feature: featureCondition,
      keyComb: hotkeyConfigPool.utils.convertToInternalKeyComb(hotkey)
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
    | [
        hotkey: HotkeyPolymorphicParams,
        condition?: PartialDeep<FeatureOption.External.DOMMethod>
      ]
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
    | [
        hotkey: HotkeyPolymorphicParams,
        condition?: PartialDeep<FeatureOption.External.Callback>
      ]
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

superHotkey.internal = {
  bind: (hotkey, featureOption) => {
    featureOption.options.trigger ??= {};
    Object.assign(featureOption.options.trigger, defaultTriggerOptions);

    // TODO: 需要判断一下传入的 Id 是否有重复，有的话则 throw 告知
    const addSuccessfulHotkeyId = hotkeyConfigPool.add({
      keyComb: hotkey,
      feature: featureOption as any
    });

    if (addSuccessfulHotkeyId) {
      keypressObserver.observeByHotkeyId(addSuccessfulHotkeyId);
    } else {
      throw new Error('添加失败，因 Id 重复');
    }
  }
};

export { superHotkey };
