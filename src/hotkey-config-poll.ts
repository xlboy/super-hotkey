import { isEqual, isMatch, pick } from 'lodash-es';
import { nanoid } from 'nanoid';

import type { MergedModifierCode, MergedNormalCode } from './constants/keyboard-code';
import { defaultModifierCodes, extendedModifierCodeMap } from './constants/keyboard-code';
import type FeatureOption from './types/feature-option';
import type Hotkey from './types/hotkey';

export type HotkeyId = string;

export type HotkeyConfig = {
  keyComb:
    | {
        type: 'common';
        contents: Array<
          | ({
              type: Hotkey.Internal.KeyPressTypes[0];
            } & Hotkey.Internal.CommonLongPress)
          | ({
              type: Hotkey.Internal.KeyPressTypes[1];
            } & Hotkey.Internal.CommonShortPress)
        >;
      }
    | {
        type: 'sequence';
        contents: Hotkey.Internal.Sequence[];
      };
  feature: FeatureOption.Internal.Union;
};

class HotkeyConfigPool {
  private configMap = new Map<HotkeyId, HotkeyConfig>();

  public clear = () => {
    this.configMap.clear();
  };

  public size = () => {
    return this.configMap.size;
  };

  /**
   * @returns 新增成功的 `hotkey-id`
   */
  public add = (hotkeyConfig: HotkeyConfig): HotkeyId => {
    const hotkeyId = nanoid();

    this.configMap.set(hotkeyId, hotkeyConfig);

    return hotkeyId;
  };

  /**
   *
   * @returns 完全被移除的 `热键配置`
   */
  public remove = (condition: {
    keyComb?: HotkeyConfig['keyComb'];
    feature?: FeatureOption.Condition;
  }) => {
    const completelyRemoveConfigs: Record<
      Hotkey.Internal.KeyPressTypes[number],
      Array<{ id: HotkeyId; config: HotkeyConfig }>
    > = {
      longPress: [],
      shortPress: []
    };

    this.configMap.forEach((config, id) => {
      const isPassedFeature =
        condition.feature === undefined || isMatch(config.feature, condition.feature);

      if (!isPassedFeature) return;

      if (condition.keyComb !== undefined) {
        if (condition.keyComb.type === 'common' && config.keyComb.type === 'common') {
          const removedHotkeyTypes: Hotkey.Internal.KeyPressTypes[number][] = [];

          for (
            let commonKeyCombIndex = config.keyComb.contents.length - 1;
            commonKeyCombIndex >= 0;
            commonKeyCombIndex--
          ) {
            const configCommonKeyComb = config.keyComb.contents[commonKeyCombIndex];
            const isPassedKeyComb = condition.keyComb.contents.some(conditionKeyComb => {
              if (
                conditionKeyComb.type === 'longPress' &&
                configCommonKeyComb.type === 'longPress'
              ) {
                if (Reflect.has(conditionKeyComb, 'longPressTime')) {
                  if (
                    conditionKeyComb.longPressTime !== configCommonKeyComb.longPressTime
                  ) {
                    return false;
                  }
                } else {
                  return false;
                }

                if (
                  isEqual(
                    pick(conditionKeyComb, ['modifierCodes', 'normalCodes']),
                    pick(configCommonKeyComb, ['modifierCodes', 'normalCodes'])
                  )
                ) {
                  return true;
                }
              } else if (
                conditionKeyComb.type === 'shortPress' &&
                configCommonKeyComb.type === 'shortPress'
              ) {
                if (
                  isEqual(
                    pick(conditionKeyComb, ['modifierCodes', 'normalCodes']),
                    pick(configCommonKeyComb, ['modifierCodes', 'normalCodes'])
                  )
                ) {
                  return true;
                }
              }

              return false;
            });

            if (isPassedKeyComb) {
              removedHotkeyTypes.push(configCommonKeyComb.type);
              config.keyComb.contents.splice(commonKeyCombIndex, 1);
            }
          }

          // 如果 remove 了 long-press 类型的热键，则需要判断是否还有其余的同党。
          // 如果没有，即是在当前热键组里 「完全移除了 long-press」
          if (removedHotkeyTypes.includes('longPress')) {
            const noLongPressKey = !config.keyComb.contents.some(
              item => item.type === 'longPress'
            );

            if (noLongPressKey) {
              completelyRemoveConfigs.longPress.push({ id, config });
            }
          }

          if (removedHotkeyTypes.includes('shortPress')) {
            const noShortPressKey = !config.keyComb.contents.some(
              item => item.type === 'shortPress'
            );

            if (noShortPressKey) {
              completelyRemoveConfigs.shortPress.push({ id, config });
            }
          }

          if (config.keyComb.contents.length === 0) {
            this.configMap.delete(id);
          }
        } else if (
          condition.keyComb.type === 'sequence' &&
          config.keyComb.type === 'sequence'
        ) {
          // sequence 类型的热键全部相等。也达到「完全移除」的条件
          if (isEqual(condition.keyComb.contents, config.keyComb.contents)) {
            completelyRemoveConfigs.shortPress.push({ id, config });
            this.configMap.delete(id);
          }
        }
      } else {
        if (config.keyComb.type === 'sequence') {
          completelyRemoveConfigs.shortPress.push({ id, config });
          this.configMap.delete(id);
        } else {
          const hasShortPressKey = config.keyComb.contents.some(
            item => item.type === 'shortPress'
          );

          const hasLongPressKey = config.keyComb.contents.some(
            item => item.type === 'longPress'
          );

          if (hasShortPressKey) {
            completelyRemoveConfigs.shortPress.push({ config, id });
          }

          if (hasLongPressKey) {
            completelyRemoveConfigs.longPress.push({ config, id });
          }

          if (!hasShortPressKey && !hasLongPressKey) {
            completelyRemoveConfigs.longPress.push({ config, id });
            completelyRemoveConfigs.shortPress.push({ config, id });
          }

          this.configMap.delete(id);
        }
      }
    });

    return completelyRemoveConfigs;
  };

  public findById = (id: HotkeyId): HotkeyConfig | undefined => {
    return this.configMap.get(id);
  };

  public get utils() {
    return {
      convertToInternalKeyComb: convertToInternalKeyComb.bind(this)
    };

    function convertToInternalKeyComb(
      polymorphicHotkey:
        | Hotkey.Polymorphic.Common.Index
        | Hotkey.Polymorphic.Sequence.Index
    ): HotkeyConfig['keyComb'] | undefined {
      let keyComb: HotkeyConfig['keyComb'] | undefined;

      if (isCommonObjType(polymorphicHotkey)) {
        keyComb = {
          type: 'common',
          contents: [commonObjHandler(polymorphicHotkey)]
        };
      } else if (typeof polymorphicHotkey === 'string') {
        const { result, isKeySequence } = stringTypeHandler(polymorphicHotkey);

        if (isKeySequence) {
          keyComb = {
            type: 'sequence',
            contents: result.map(
              item =>
                ({
                  ...item,
                  interval: 'unlimited-time'
                } as Hotkey.Internal.Sequence)
            )
          };
        } else {
          keyComb = {
            type: 'common',
            contents: result.map(item => ({ ...item, type: 'shortPress' }))
          };
        }
      } else if (Array.isArray(polymorphicHotkey)) {
        keyComb = {
          type: 'common',
          contents: []
        };
        for (const hotkey of polymorphicHotkey) {
          if (typeof hotkey === 'string') {
            const { result, isKeySequence } = stringTypeHandler(hotkey);

            if (!isKeySequence) {
              keyComb.contents.push(
                ...result.map(item => ({ ...item, type: 'shortPress' as any }))
              );
            }
          } else if (isCommonObjType(hotkey)) {
            keyComb.contents.push(commonObjHandler(hotkey));
          }
        }
      }

      return keyComb;

      function isCommonObjType(hotkey: any): hotkey is Hotkey.Polymorphic.Common.Obj {
        return Object.prototype.toString.call(hotkey) === '[object Object]';
      }

      function commonObjHandler(commonObj: Hotkey.Polymorphic.Common.Obj) {
        const { longPressTime, modifierKey, normalKey } = commonObj;

        const modifierCodes = (
          modifierKey
            ? typeof modifierKey === 'string'
              ? specifyCharSplit(modifierKey, ',')
              : modifierKey
            : []
        ) as MergedModifierCode[];

        const normalCodes = (
          normalKey
            ? typeof normalKey === 'string'
              ? specifyCharSplit(normalKey, ',')
              : normalKey
            : []
        ) as MergedNormalCode[];

        return (
          longPressTime !== undefined
            ? {
                type: 'longPress',
                longPressTime,
                modifierCodes,
                normalCodes
              }
            : {
                type: 'shortPress',
                modifierCodes,
                normalCodes
              }
        ) as any;
      }

      function stringTypeHandler(hotkeyStr: string) {
        const result: Hotkey.Internal.BaseCode[] = [];

        const hotkeys = isKeySequence()
          ? // 'Ctrl+b c a' -> ['Ctrl+b', 'c', 'a']
            hotkeyStr.split(' ').filter(_ => _)
          : // 'Ctrl+b, c, a' -> ['Ctrl+b', 'c', 'a']
            hotkeyStr
              .split(',')
              .map(_ => _.trim())
              .filter(_ => _);

        for (const hotkey of hotkeys) {
          const codes = specifyCharSplit(hotkey, '+');
          const currentModifierCodes: Hotkey.Internal.BaseCode['modifierCodes'] = [];
          const currentNormalCodes: Hotkey.Internal.BaseCode['normalCodes'] = [];

          for (const code of codes) {
            if (isModifierCode(code)) {
              currentModifierCodes.push(code);
            } else {
              currentNormalCodes.push(code as any);
            }
          }

          result.push({
            modifierCodes: currentModifierCodes,
            normalCodes: currentNormalCodes
          });
        }

        return {
          result,
          isKeySequence: isKeySequence()
        };

        function isModifierCode(code: any): code is MergedModifierCode {
          return (
            defaultModifierCodes.includes(code as any) ||
            Reflect.has(extendedModifierCodeMap, code)
          );
        }

        function isKeySequence(): any {
          return false;
        }
      }

      function specifyCharSplit(str: string, char: string) {
        return str
          .split(char)
          .map((item, index, arr) => {
            const nextItem = arr[index + 1];

            if (item === '' && nextItem === '') {
              return char;
            }

            return item;
          })
          .filter(_ => _);
      }
    }
  }
}

export const hotkeyConfigPool = new HotkeyConfigPool();
