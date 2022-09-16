export { superHotkey } from './entrance';

import type FeatureOption from './types/feature-option';
import type Hotkey from './types/hotkey';

export type CommonHokeyObject = Hotkey.Polymorphic.Common.Obj;

export type CallbackOptions = FeatureOption.External.Callback;

export type DOMMethodOptions = FeatureOption.External.DOMMethod;

export type {
  MergedModifierCode,
  MergedNormalCode,
  MergedCode
} from './constants/keyboard-code';
