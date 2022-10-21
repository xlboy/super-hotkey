import { superHotkey } from './entrance';
import type FeatureOption from './types/feature-option';
import type Hotkey from './types/hotkey';

export type CommonHotkeyObject = Hotkey.Polymorphic.Common.Obj;

export type CallbackOptions = FeatureOption.External.Callback;

export type DOMMethodOptions = FeatureOption.External.DOMMethod;

export type {
  MergedCode,
  MergedModifierCode,
  MergedNormalCode
} from './constants/keyboard-code';

export {
  defaultModifierCodes,
  defaultNormalCodes,
  extendedModifierCodeMap,
  extendedNormalCodeMap
} from './constants/keyboard-code';

export default superHotkey;
