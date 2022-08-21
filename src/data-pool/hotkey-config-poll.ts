import { filter, isEqual, pick } from 'lodash-es';
import { nanoid } from 'nanoid';
import type { ReadonlyDeep } from 'type-fest';

import type { MergedModifierKey, MergedNormalKey } from '../constants/keyboard-key';
import type { KeyCombination } from '../matcher';
import type {
  PolymorphicHotkeyParams,
  UnbindFeatureCondition,
  UnifiedFeature,
  UnifiedKeySequence
} from '../types/entrance';

// 暂不分

// type CommonKeyItem = {
//   hotkey: Omit<UnifiedCommonKey, 'type'>;
//   feature: UniformHotkeyOptions;
// };

// type KeySequenceItem = {
//   hotkey: Omit<UnifiedKeySequence, 'type'>;
//   feature: UniformHotkeyOptions;
// };

export interface InternalSequenceKeyCombination {
  type: 'sequence';
  sequences: Array<{
    modifierKeys: MergedModifierKey[];
    normalKey: MergedNormalKey;
    interval: number;
    // TODO: 暂不支持 长按
  }>;
}

export interface HotkeyConfig {
  id: string;
  keyCombination:
    | {
        type: 'common';
        contents: Array<{
          modifierKeys: MergedModifierKey[];
          normalKey: MergedNormalKey;
          longPressTime?: number;
        }>;
      }
    | InternalSequenceKeyCombination;
  feature: UnifiedFeature;
}

class HotkeyConfigPool {
  private hotkeyConfigs: HotkeyConfig[] = [];

  public clear() {
    this.hotkeyConfigs = [];
  }

  public size() {
    return this.hotkeyConfigs.length;
  }

  public add(
    hotkeyConfig: Pick<HotkeyConfig, 'keyCombination' | 'feature'>
  ): HotkeyConfig['id'] | false {
    const hotkeyId = nanoid();

    this.hotkeyConfigs.push({ ...hotkeyConfig, id: hotkeyId });

    return hotkeyId;
  }

  /**
   *
   * @returns 完全被移除的 `热键配置`
   */
  public remove(condition: {
    keyCombination?: HotkeyConfig['keyCombination'];
    feature?: UnbindFeatureCondition;
  }): HotkeyConfig[] {
    const conditionToRemove: Partial<HotkeyConfig> = {};

    if (condition.keyCombination) {
      conditionToRemove.keyCombination = condition.keyCombination;
    }

    if (condition.feature) {
      conditionToRemove.feature = condition.feature as any;
    }

    const relatedHotkeyConfigs = filter(this.hotkeyConfigs, conditionToRemove);

    // 完全移除的话，有如下两个条件
    // 1. 「移除条件」仅为某个「特性」相关的热键信息
    // or
    // 2. 「移除条件」包含「指定的热键」，如果「指定的热键」被清后。相应的「特性」如果没有其余可对应的「热键」了（【标记1】），则直接整个移除
    const completelyRemoveConfigs: HotkeyConfig[] = [];

    for (const relatedHotkeyConfig of relatedHotkeyConfigs) {
      // 没传指定的 keyCombination 条件，则删所有与特性相关的配置
      if (!conditionToRemove.keyCombination) {
        completelyRemoveConfigs.push(relatedHotkeyConfig);
        removeById.call(this, relatedHotkeyConfig.id);
      } else {
        // TODO: 为什么这里不能收缩类型？
        if (
          relatedHotkeyConfig.keyCombination.type === 'common' &&
          conditionToRemove.keyCombination.type === 'common'
        ) {
          const relatedCommonHotkeys = relatedHotkeyConfig.keyCombination.contents;
          const conditionOfCommonHotkeys = conditionToRemove.keyCombination.contents;

          for (let index = relatedCommonHotkeys.length; index >= 0; index--) {
            conditionOfCommonHotkeys.forEach(commonCondition => {
              if (isEqual(relatedCommonHotkeys[index], commonCondition)) {
                removeCommonKeyCombByIdAndIndex.call(this, relatedHotkeyConfig.id, index);
              }
            });
          }

          // 【标记1】
          if (relatedHotkeyConfig.keyCombination.contents.length === 0) {
            completelyRemoveConfigs.push(relatedHotkeyConfig);
            removeById.call(this, relatedHotkeyConfig.id);
          }
        } else if (
          relatedHotkeyConfig.keyCombination.type === 'sequence' &&
          conditionToRemove.keyCombination.type === 'sequence'
        ) {
          const relatedSequenceHotkeys = relatedHotkeyConfig.keyCombination.sequences;
          const conditionOfSequenceHotkeys = conditionToRemove.keyCombination.sequences;

          // 【标记1】
          if (isEqual(relatedSequenceHotkeys, conditionOfSequenceHotkeys)) {
            completelyRemoveConfigs.push(relatedHotkeyConfig);
            removeById.call(this, relatedHotkeyConfig.id);
          }
        }
      }
    }

    return completelyRemoveConfigs;

    function removeCommonKeyCombByIdAndIndex(
      this: HotkeyConfigPool,
      hotkeyId: HotkeyConfig['id'],
      contentIndex: number
    ) {
      const hotkeyConfig = this.hotkeyConfigs.find(config => config.id === hotkeyId)!;

      if (hotkeyConfig.keyCombination.type === 'common') {
        hotkeyConfig.keyCombination.contents.splice(contentIndex, 1);
      }
    }

    function removeById(this: HotkeyConfigPool, hotkeyId: HotkeyConfig['id']): void {
      const indexToRemove = this.hotkeyConfigs.findIndex(
        config => config.id === hotkeyId
      );

      if (indexToRemove !== -1) {
        this.hotkeyConfigs.splice(indexToRemove, 1);
      }
    }
  }

  public findById(id: HotkeyConfig['id']): ReadonlyDeep<HotkeyConfig> | undefined {
    const foundHotkeyConfig = this.hotkeyConfigs.find(config => config.id === id);

    return foundHotkeyConfig as ReadonlyDeep<HotkeyConfig> | undefined;
  }

  public update() {}

  public get utils() {
    return {
      getSuitedHotkeyConfig: getSuitedHotkeyConfig.bind(this),
      converToInternalKeyCombination: converToInternalKeyCombination.bind(this)
    };

    function converToInternalKeyCombination(
      polymorphicHotkey: PolymorphicHotkeyParams
    ): HotkeyConfig['keyCombination'] {
      return {} as any;
    }

    interface SuitedHotkeyConfig {
      commons: HotkeyConfig[];
      sequences: HotkeyConfig[];
    }

    function getSuitedHotkeyConfig(
      this: HotkeyConfigPool,
      lastTwoKeyCombinations: readonly [KeyCombination | undefined, KeyCombination]
    ): SuitedHotkeyConfig {
      const suitedHotkeyConfig: SuitedHotkeyConfig = {
        commons: [],
        sequences: []
      };

      this.hotkeyConfigs.forEach(config => {
        if (config.keyCombination.type === 'common') {
          // 是 common 类型的键，且此次按下的键与配置中的键相符，即达标

          const commonKeyCombs = config.keyCombination.contents;
          const [, lastOneKeyComb] = lastTwoKeyCombinations;

          commonKeyCombs.some(keyComb => {
            if (isKeyCombEqual(lastOneKeyComb, keyComb)) {
              suitedHotkeyConfig.commons.push(config);

              return true;
            }

            return false;
          });
        } else if (config.keyCombination.type === 'sequence') {
          const [penultimateKeyComb, lastOneKeyComb] = lastTwoKeyCombinations;

          // 没有倒数第二组键，则不匹配 「键序列」 相关的键
          if (!penultimateKeyComb) {
            return;
          }

          const sequenceKeyCombs = config.keyCombination.sequences;

          sequenceFor: for (let i = 0; i < sequenceKeyCombs.length; i++) {
            const currentSequenceKeyComb = sequenceKeyCombs[i];
            const nextSequenceKeyComb = sequenceKeyCombs[i + 1] as
              | undefined
              | UnifiedKeySequence['sequenceGroup'][number];

            // 两组键 是否与 键序列配置中的键 相同
            // ---
            // 判断 第一组键
            if (isKeyCombEqual(penultimateKeyComb, currentSequenceKeyComb)) {
              // 判断 第二组键，前提为「键序列配置」中有下一组
              if (
                nextSequenceKeyComb &&
                isKeyCombEqual(lastOneKeyComb, nextSequenceKeyComb)
              ) {
                // 第一组键 与 第二组键 的按下间隔是否达到「键序列配置」中的要求
                const effectiveInterval =
                  /* 单组键的间隔要求 */ nextSequenceKeyComb.interval! >=
                  /* 倒数第一组键的按下时间 */ lastOneKeyComb.timeStamp -
                    /* 倒数第二组键的按下时间 */ penultimateKeyComb.timeStamp;

                if (effectiveInterval) {
                  suitedHotkeyConfig.sequences.push(config);
                  // 找到了理想的键序列配置，则结束
                  break sequenceFor;
                }
              }
            }
          }
        }
      });

      return suitedHotkeyConfig;

      type T = Partial<Pick<KeyCombination, 'modifierKeys' | 'normalKey'>>;
      function isKeyCombEqual(aKeyComb: T, bKeyComb: T) {
        return isEqual(
          pick(aKeyComb, ['modifierKeys', 'normalKey']),
          pick(bKeyComb, ['modifierKeys', 'normalKey'])
        );
      }
    }
  }
}

export const hotkeyConfigPool = new HotkeyConfigPool();
