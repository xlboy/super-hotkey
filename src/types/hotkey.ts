import type { LiteralUnion } from 'type-fest';

import type {
  DefaultModifierKey,
  DefaultNormalKey,
  MergedModifierKey,
  MergedNormalKey
} from '../constants/keyboard-key';

export namespace Hotkey {
  export namespace Internal {
    export type CommonShortPress = {
      modifierKeys: DefaultModifierKey[];
      normalKey: DefaultNormalKey;
    };

    export type CommonLongPress = {
      keys: Array<DefaultNormalKey | DefaultModifierKey>;
      longPressTime: number;
    };

    export interface Sequence {
      modifierKeys: DefaultModifierKey[];
      normalKey: DefaultNormalKey;
      interval: number | 'unlimited-time';
    }
  }

  export namespace Polymorphic {
    namespace Modifier {
      export type Str = LiteralUnion<MergedModifierKey, string>;

      export type Arr = MergedModifierKey[];
    }

    export namespace Common {
      type Str = LiteralUnion<MergedModifierKey | MergedNormalKey, string>;

      type Obj = {
        modifierKey?: Modifier.Str | Modifier.Arr;
        normalKey?: MergedNormalKey;
        /**
         * 长按时长
         * 开启后，不可设置 `trigger-mode`
         *
         * @default false
         */
        longPressTime?: number | false;
      };

      export type Index =
        /* Common-Key-Str:   ------- 'Ctrl+Shift+b, Ctrl+c, d' ------- */
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
      type Str = LiteralUnion<MergedModifierKey | MergedNormalKey, string>;

      type Obj = {
        modifierKey?: Modifier.Str | Modifier.Arr;
        normalKey?: MergedNormalKey;
        /**
         * 距离下一轮热键的间隔时长，单位为 `ms`
         *
         * `默认` 为「不限时长」
         */
        interval?: number;
      };

      export type Index =
        /* Sequence-Key-Str:  ------- 'Ctrl+b c a' ------- */
        | Str
        /* 
          Sequence-Key-Arr:
          [
            { modifierKey: ['Ctrl'], normalKey: 'b' }, 
            { modifierKey: ['Shift'], normalKey: 'd' }, 
            'a',
            'Shift+e'
          ]
        */
        | [Omit<Obj, 'interval'> | Str, ...Array<Obj | Str>];
    }
  }
}
