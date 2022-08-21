import type { PartialDeep } from 'type-fest';

import type { CommonKey, KeySequence, KeySequenceObj } from './hotkey';
import type { CallbackOptions, DOMMethodOptions } from './option';
import type { MergedModifierKey, MergedNormalKey } from '../constants/keyboard-key';

export type UnifiedCommonKey = {
  type: 'common';
  modifierKeys: MergedModifierKey[];
  normalKey: MergedNormalKey;
  longPressTime?: number;
};

export type UnifiedKeySequence = {
  type: 'sequence';
  sequenceGroup: Array<{
    modifierKeys: MergedModifierKey[];
    normalKey: MergedNormalKey;
    interval: number;
    // TODO: 暂不支持 长按
  }>;
};

export type UnifiedHotkey = UnifiedCommonKey | UnifiedKeySequence;

export type FeatureDOMMethod = {
  type: 'domMethod';
  options: DOMMethodOptions;
};

export type FeatureCallback = {
  type: 'callback';
  options: CallbackOptions;
};

export type UnifiedFeature = FeatureDOMMethod | FeatureCallback;

export type HotkeyFeatureType = UnifiedFeature['type'];

export type PolymorphicHotkeyParams = CommonKey | KeySequence;

export type UnbindFeatureCondition =
  | {
      type: 'domMethod';
      options?: PartialDeep<DOMMethodOptions>;
    }
  | {
      type: 'callback';
      options?: PartialDeep<CallbackOptions>;
    };

export interface SuperHotkey {
  (hotkey: PolymorphicHotkeyParams, featureOption: UnifiedFeature): void;

  // TODO: 其他 API 待完善

  bindDOMMethod(hotkey: PolymorphicHotkeyParams, options: DOMMethodOptions): void;
  bindCallback(hotkey: PolymorphicHotkeyParams, options: CallbackOptions): void;

  // TODO: 卸载后的返回值还需待确认。（throw？或是返回已成功卸载的某些热键值？或是返回 true，代表着全部卸载成功？）
  // TODO: 重载还需进一步重写

  /**
   * 不传参数则默认为「卸载所有热键」
   */
  unbind(): void;
  unbind(
    hotkey: PolymorphicHotkeyParams,
    featureCondition?: UnbindFeatureCondition
  ): void;

  /**
   * 不传参数则默认为「卸载所有与 `domMethod` 相关的热键」
   */
  unbindDOMMethod(): void;
  unbindDOMMethod(
    hotkey: PolymorphicHotkeyParams,
    condition?: PartialDeep<DOMMethodOptions>
  ): void;

  /**
   * 不传参数则默认为「卸载所有与 `callback` 相关的热键」
   */
  unbindCallback(): void;
  unbindCallback(
    hotkey: PolymorphicHotkeyParams,
    conditions: PartialDeep<CallbackOptions>
  ): void;
}
