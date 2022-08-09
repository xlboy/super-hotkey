import type { MergedModifierKey, MergedNormalKey } from './constants/keyboard-key';

export function defineVariables<T>() {
  return <C extends T>(value: C) => value;
}

export interface BaseConfig {
  /**
   * Enable dev tools
   * @default false
   */
  enableDevTools?: boolean;
}

// type NormalKeyStr = MergedNormalKey | (string & {});
// type NormalKeyArr = MergedNormalKey[];
// type NormalKey = NormalKeyStr | NormalKeyArr;

//#region  //*=========== options ===========
export type { EventOptions, DOMActionOptions };

interface BaseOptions {
  id?: string;
  trigger?: {
    /**
     * Trigger mode
     * @default 'keydown'
     */
    mode?: 'keydown' | 'keyup' | 'keypress';

    /**
     * @default false
     */
    capture?: boolean;

    /**
     * Throttling delay of hotkey response, The unit is `ms`
     * @default 0
     */
    throttleDelay?: number;
    /**
     * When the hotkey is in the `long-press` state, repeated trigger is allowed
     * @default true
     */
    allowRepeatWhenLongPress: boolean;
  };
  targetElement?: HTMLDivElement;
  scope?: string;
  /**
   * **`热键级别`**
   *
   * 在相同热键中，会按照 `level 大小` 进行逐一响应
   */
  level?: number;
}

interface EventOptions extends BaseOptions {
  handler: () => void;
  /**
   * **是否自动 `停止事件传播`**
   *
   * 如为 `false`，则在 `handler` 中通过 `event.stopPropagation` 手动处理
   *
   * @default false
   */
  autoStopPropagation?: boolean;

  /**
   * **是否自动 `阻止浏览器默认行为`**
   *
   * 如为 `false`，则在 `handler` 中通过 `event.preventDefault` 手动处理
   *
   * @default true
   */
  autoPreventDefault?: boolean;
}

interface DOMActionOptions extends BaseOptions {
  action: 'blur' | 'click' | 'focus';

  // TODO: 后面再决定是否要加 autoStopPropagation、autoPreventDefault 等属性
}

//#endregion  //*======== options ===========

//#region  //*=========== hotkey ===========
export type { KeyboardKey, CommonKey, CommonKeyObj, KeySequence };

type KeyboardKey = MergedModifierKey | MergedNormalKey;

type ModifierKeyStr = MergedModifierKey | (string & {});
type ModifierKeyArr = MergedModifierKey[];
type ModifierKey =
  /* ------- 'ctrl+shift+alt' ------- */
  | ModifierKeyStr
  /* ------- ['ctrl', 'shift', 'alt'] ------- */
  | ModifierKeyArr;

type CommonKeyStr = string;

interface CommonKeyObj {
  modifierKey?: ModifierKey;
  normalKey: MergedNormalKey;
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

type KeySequenceStr = string;

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

//#endregion  //*======== hotkey ===========
