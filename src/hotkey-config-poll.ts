import { filter, isEqual, pick } from 'lodash-es';
import { nanoid } from 'nanoid';
import type { ReadonlyDeep } from 'type-fest';

import type { KeyCombination } from './matcher/short-press';
import type FeatureOption from './types/feature-option';
import type { Hotkey } from './types/hotkey';

export interface HotkeyConfig {
  id: string;
  keyComb:
    | {
        type: 'common-long-press';
        contents: Hotkey.Internal.CommonLongPress[];
      }
    | {
        type: 'common-short-press';
        contents: Hotkey.Internal.CommonShortPress[];
      }
    | {
        type: 'sequence';
        contents: Hotkey.Internal.Sequence[];
      };
  feature: FeatureOption.Internal.Union;
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
    hotkeyConfig: Pick<HotkeyConfig, 'keyComb' | 'feature'>
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
    keyComb?: HotkeyConfig['keyComb'];
    feature?: FeatureOption.Condition;
  }): HotkeyConfig[] {
    const conditionToRemove: Partial<HotkeyConfig> = {};

    if (condition.keyComb) {
      conditionToRemove.keyComb = condition.keyComb;
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
      if (!conditionToRemove.keyComb) {
        completelyRemoveConfigs.push(relatedHotkeyConfig);
        removeById.call(this, relatedHotkeyConfig.id);
      } else {
        // TODO: 为什么这里不能收缩类型？

        if (
          relatedHotkeyConfig.keyComb.type === '' &&
          conditionToRemove.keyComb.type === 'common'
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

  public findById(id: HotkeyConfig['id']): HotkeyConfig | undefined {
    const foundHotkeyConfig = this.hotkeyConfigs.find(config => config.id === id);

    return foundHotkeyConfig;
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
      convertToInternalKeyComb: convertToInternalKeyComb.bind(this)
    };

    function convertToInternalKeyComb(
      polymorphicHotkey:
        | Hotkey.Polymorphic.Common.Index
        | Hotkey.Polymorphic.Sequence.Index
    ): HotkeyConfig['keyComb'] {
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
        if (['common-long-press', 'common-short-press'].includes(config.keyComb.type)) {
          const [, lastOneKeyComb] = lastTwoKeyCombinations;

          if (config.keyComb.type === 'common-short-press') {
            // TODO: 如果 单个 common-contents 里出现多个相同的热键，则默认当作同一个。所以 break
            for (const commonKeyComb of config.keyComb.contents) {
              if (isKeyCombEqual(lastOneKeyComb, commonKeyComb)) {
                suitedHotkeyConfig.perfectMatchedCommons.push(config);
                break;
              }
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
