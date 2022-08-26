import { isEqual, isMatch, pick } from 'lodash-es';
import { nanoid } from 'nanoid';

import type { DefaultCode } from './constants/keyboard-code';
import type { TargetElementToObserve } from './types/base';
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
            const commonKeyComb = config.keyComb.contents[commonKeyCombIndex];
            const isPassedKeyComb = condition.keyComb.contents.some(cKeyComb => {
              if (cKeyComb.type === 'longPress' && commonKeyComb.type === 'longPress') {
                if (Reflect.has(cKeyComb, 'longPressTime')) {
                  if (cKeyComb.longPressTime !== commonKeyComb.longPressTime) {
                    return false;
                  }
                }

                if (isEqual(cKeyComb.codes, commonKeyComb.codes)) {
                  return true;
                }
              } else if (
                cKeyComb.type === 'shortPress' &&
                commonKeyComb.type === 'shortPress'
              ) {
                if (
                  isEqual(
                    pick(cKeyComb, ['modifierKeys', 'normalKey']),
                    pick(commonKeyComb, ['modifierKeys', 'normalKey'])
                  )
                ) {
                  return true;
                }
              }

              return false;
            });

            if (isPassedKeyComb) {
              removedHotkeyTypes.push(commonKeyComb.type);
              config.keyComb.contents.splice(commonKeyCombIndex, 1);
            }
          }

          // 如果 remove 了 long-press 类型的热键，则需要判断是否还有其余的同党。
          // 如果没有，即是在当前热键组里 「完全移除了 long-press」
          if (removedHotkeyTypes.includes('longPress')) {
            const noLongPressKey =
              config.keyComb.contents.findIndex(item => item.type === 'longPress') === -1;

            if (noLongPressKey) {
              completelyRemoveConfigs.longPress.push({ id, config });
            }
          }

          if (removedHotkeyTypes.includes('shortPress')) {
            const noShortPressKey =
              config.keyComb.contents.findIndex(item => item.type === 'shortPress') ===
              -1;

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
          const hasShortPressKey =
            config.keyComb.contents.findIndex(item => item.type === 'shortPress') !== -1;

          const hasLongPressKey =
            config.keyComb.contents.findIndex(item => item.type === 'longPress') !== -1;

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

  public forEach = (callbackFn: (config: HotkeyConfig, id: HotkeyId) => void): void => {
    this.configMap.forEach(callbackFn);
  };

  public get utils() {
    return {
      convertToInternalKeyComb: convertToInternalKeyComb.bind(this)
    };

    function convertToInternalKeyComb(
      polymorphicHotkey:
        | Hotkey.Polymorphic.Common.Index
        | Hotkey.Polymorphic.Sequence.Index
    ): HotkeyConfig['keyComb'] {
      return {} as any;
    }
  }
}

export const hotkeyConfigPool = new HotkeyConfigPool();
