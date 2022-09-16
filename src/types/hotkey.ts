import type { LiteralUnion } from 'type-fest';

import type { MergedModifierCode, MergedNormalCode } from '../constants/keyboard-code';

namespace Hotkey {
  export namespace Internal {
    export interface BaseCode {
      modifierCodes: MergedModifierCode[];
      normalCodes: MergedNormalCode[];
    }

    export interface CommonShortPress extends BaseCode {}

    export interface CommonLongPress extends BaseCode {
      longPressTime: number;
    }

    export interface Sequence extends BaseCode {
      interval: number | 'unlimited-time';
    }

    export type KeyPressTypes = ['longPress', 'shortPress'];
  }

  export namespace Polymorphic {
    namespace Modifier {
      export type Str = LiteralUnion<MergedModifierCode, string>;

      export type Arr = MergedModifierCode[];
    }

    export namespace Common {
      type Str = LiteralUnion<MergedModifierCode | MergedNormalCode, string>;

      export type Obj = {
        modifierKey?: Modifier.Str | Modifier.Arr;
        normalKey?: MergedNormalCode | MergedNormalCode[];
        /**
         * 长按时长
         * 开启后，不可设置 `trigger.mode`
         *
         * @default false
         */
        longPressTime?: number | false;
      };

      export type Index =
        /* Common-Key-Str:   ------- 'Ctrl+c, Ctrl+Shift+b+c, d' ------- */
        | Str
        /* Common-Key-Obj:   ------- { modifierKey: ['Ctrl', 'Shift'], normalKey: 'b' } ------- */
        | Obj
        /* 
           Common-Key-Arr:
            [
              'Ctrl+Shift+b',
              { modifierKey: ['Ctrl', 'Shift'], normalKey: 'b' }, 
              { modifierKey: ['Ctrl'], normalKey: 'c' },
              'd'
            ]
        */
        | Array<Str | Obj>;
    }

    export namespace Sequence {
      type Str = LiteralUnion<MergedModifierCode | MergedNormalCode, string>;

      type Obj = {
        modifierKey?: Modifier.Str | Modifier.Arr;
        normalKey?: MergedNormalCode;
        /**
         * 距离下一轮热键的间隔时长，单位为 `ms`
         *
         * `默认` 为「不限时长」
         */
        interval?: number;
      };

      export type Index =
        /* Sequence-Key-Str:  ------- 'Ctrl+b c a' ------- */
        Str;
      /* 
          Sequence-Key-Arr:
          [
            { modifierKey: ['Ctrl'], normalKey: 'b' }, 
            { modifierKey: ['Shift'], normalKey: 'd' }, 
            'a',
            'Shift+e'
          ]
        */
      // | [Omit<Obj, 'interval'> | Str, ...Array<Obj | Str>];
    }
  }
}

export default Hotkey;
