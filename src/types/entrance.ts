import type { F } from 'ts-toolbelt';

import type { CommonKey, KeySequence, KeySequenceObj } from './hotkey';
import type { CallbackOptions, DOMMethodOptions } from './option';
import type { MergedModifierKey, MergedNormalKey } from '../constants/keyboard-key';

export type UnifiedCommonKey = {
  type: 'common';
  modifierKeys: MergedModifierKey[];
  normalKey: MergedNormalKey;
  longPressTime: number;
};

export type UnifiedKeySequence = {
  type: 'sequence';
  sequenceGroup: Array<
    {
      modifierKeys?: MergedModifierKey[];
      normalKey: MergedNormalKey;
      // TODO: 暂不支持 长按
    } & Pick<KeySequenceObj, 'interval'>
  >;
};

export type UnifiedHotkey = UnifiedCommonKey | UnifiedKeySequence;

export type HotkeyKeyType = UnifiedHotkey['type'];

type FeatureDOMMethod = {
  type: 'domMethod';
  options: DOMMethodOptions;
};

type FeatureCallback = {
  type: 'callback';
  options: CallbackOptions;
};

export type UniformFeature = FeatureDOMMethod | FeatureCallback;

export type HotkeyFeatureType = UniformFeature['type'];

export type PolymorphicHotkeyParams = CommonKey | KeySequence;

export interface SuperHotkey {
  (hotkey: PolymorphicHotkeyParams, options: UniformFeature): void;

  // TODO: 其他 API 待完善

  bindDOMMethod(hotkey: PolymorphicHotkeyParams, options: DOMMethodOptions): void;
  bindCallback(hotkey: PolymorphicHotkeyParams, options: CallbackOptions): void;

  unbind(
    hotkey: PolymorphicHotkeyParams,
    options?:
      | ({
          featureType: 'domMethod';
        } & Partial<Pick<DOMMethodOptions, 'focusElement'>>)
      | {
          featureType: 'callback';
          callback?: F.Function;
        }
  ): void;

  // TODO: 卸载后的返回值还需待确认。（throw？或是返回已成功卸载的某些热键值？或是返回 true，代表着全部卸载成功？）
  unbindDOMMethod(
    hotkey: PolymorphicHotkeyParams,
    options?: Partial<Pick<DOMMethodOptions, 'focusElement'>>
  ): void;
  unbindCallback(
    hotkey: PolymorphicHotkeyParams,
    options: {
      callback?: F.Function;
    }
  ): void;
}
