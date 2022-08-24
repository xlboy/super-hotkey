import { filter, isEqual, pick } from 'lodash-es';
import { nanoid } from 'nanoid';
import type { ReadonlyDeep } from 'type-fest';

import type { DefaultModifierKey, DefaultNormalKey } from '../constants/keyboard-key';
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
    modifierKeys: DefaultModifierKey[];
    normalKey: DefaultNormalKey;
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
          modifierKeys: DefaultModifierKey[];
          normalKey: DefaultNormalKey;
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
          // TODO: 键序列的完全移除还需要再深入验证，用户传的 hotkey-condition-array，不一定是完全匹配的（sequence-array-length 与 内部内容）
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

  public filter(
    conditionFn: (
      config: ReadonlyDeep<HotkeyConfig>,
      index?: number,
      array?: ReadonlyArray<HotkeyConfig>
    ) => boolean
  ): ReadonlyArray<HotkeyConfig> {
    return this.hotkeyConfigs.filter(conditionFn as any);
  }

  public forEach(
    callbackFn: (
      config: ReadonlyDeep<HotkeyConfig>,
      index?: number,
      array?: ReadonlyArray<HotkeyConfig>
    ) => void
  ): void {
    this.hotkeyConfigs.forEach(callbackFn as any);
  }

  public get utils() {
    return {
      getSuitedHotkeyConfig: getSuitedHotkeyConfig.bind(this),
      convertToInternalKeyCombination: convertToInternalKeyCombination.bind(this)
    };

    function convertToInternalKeyCombination(
      polymorphicHotkey: PolymorphicHotkeyParams
    ): HotkeyConfig['keyCombination'] {
      return {} as any;
    }

    interface SuitedHotkeyConfig {
      perfectMatchedCommons: HotkeyConfig[];
      similarSequences: HotkeyConfig[];
    }

    function getSuitedHotkeyConfig(
      this: HotkeyConfigPool,
      lastTwoKeyCombinations: readonly [KeyCombination | undefined, KeyCombination]
    ): SuitedHotkeyConfig {
      const suitedHotkeyConfig: SuitedHotkeyConfig = {
        perfectMatchedCommons: [],
        similarSequences: []
      };

      this.hotkeyConfigs.forEach(config => {
        if (config.keyCombination.type === 'common') {
          const [, lastOneKeyComb] = lastTwoKeyCombinations;

          // TODO: 如果 单个 common-contents 里出现多个相同的热键，则默认当作同一个。所以 break
          for (const commonKeyComb of config.keyCombination.contents) {
            if (isKeyCombEqual(lastOneKeyComb, commonKeyComb)) {
              suitedHotkeyConfig.perfectMatchedCommons.push(config);
              break;
            }
          }
        } else if (config.keyCombination.type === 'sequence') {
          const [penultimateKeyComb, lastOneKeyComb] = lastTwoKeyCombinations;

          // 没有倒数第二组键，则不匹配与 「键序列」 相似的键
          if (!penultimateKeyComb) {
            return;
          }

          const sequenceKeyCombs = config.keyCombination.sequences;

          for (let i = 0; i < sequenceKeyCombs.length; i++) {
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
                  suitedHotkeyConfig.similarSequences.push(config);
                  // 找到了相似的键序列配置，则结束。
                  break;
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
