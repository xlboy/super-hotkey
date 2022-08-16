import type { MergedModifierKey, MergedNormalKey } from '../constants/keyboard-key';

export type { KeyboardKey, CommonKey, CommonKeyObj, KeySequence, KeySequenceObj };

// type NormalKeyStr = MergedNormalKey | (string & {});
// type NormalKeyArr = MergedNormalKey[];
// type NormalKey = NormalKeyStr | NormalKeyArr;

type KeyboardKey = MergedModifierKey | MergedNormalKey;

type ModifierKeyStr = MergedModifierKey | (string & {});
type ModifierKeyArr = MergedModifierKey[];
type ModifierKey =
  /* ------- 'ctrl+shift+alt' ------- */
  | ModifierKeyStr
  /* ------- ['ctrl', 'shift', 'alt'] ------- */
  | ModifierKeyArr;

type CommonKeyStr = KeyboardKey | (string & {});

interface CommonKeyObj {
  modifierKey?: ModifierKey;
  normalKey: MergedNormalKey;
  longPressTime?: number;
}

type CommonKey =
  /* ------- 'ctrl+shift+b, ctrl+c, d' ------- */
  | CommonKeyStr
  /* ------- ['ctrl+shift+b', 'ctrl+c', 'd'] ------- */
  | CommonKeyStr[]
  /* ------- { modifierKey: ['ctrl', 'shift'], normalKey: 'b' } ------- */
  | CommonKeyObj
  /* 
    [
      { modifierKey: ['ctrl', 'shift'], normalKey: 'b' }, 
      { modifierKey: ['ctrl'], normalKey: 'c' }
    ]
  */
  | CommonKeyObj[];

type KeySequenceStr = KeyboardKey | (string & {});

interface KeySequenceObj extends CommonKeyObj {
  /**
   * 距离下一轮热键的间隔时长
   *
   * TODO: 描述待完善
   */
  interval?: number;
}

type KeySequence =
  /* ------- 'ctrl+b c a' ------- */
  | KeySequenceStr
  /* ------- ['ctrl+b', 'c', 'a'] ------- */
  | KeySequenceStr[]
  /* 
    [
      { modifierKey: ['ctrl'], normalKey: 'b' }, 
      { normalKey: 'c' },
      { normalKey: 'a' }
    ]
  */
  | KeySequenceObj[]
  /* 
    [
      { modifierKey: ['ctrl'], normalKey: 'b' }, 
      'c',
      'a'
    ]
  */
  | Array<CommonKeyObj | MergedNormalKey>;
