import { filter, isEqual, pick } from 'lodash-es';
import { nanoid } from 'nanoid';
import type { ReadonlyDeep } from 'type-fest';

import type { KeypressRecord } from './keypress-record-poll';
import type { KeyCombination } from '../matcher';
import type {
  UnbindFeatureCondition,
  UnifiedFeature,
  UnifiedHotkey,
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

export interface HotkeyConfig {
  id: string;
  keyCombinations: UnifiedHotkey[];
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
    hotkeyConfig: Pick<HotkeyConfig, 'keyCombinations' | 'feature'>
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
    hotkeys: UnifiedHotkey[];
    featureCondition?: UnbindFeatureCondition;
  }): HotkeyConfig[] {
    const conditionToRemove: Partial<HotkeyConfig> = {};

    if (condition.hotkeys.length !== 0) {
      conditionToRemove.keyCombinations = condition.hotkeys;
    }

    if (condition.featureCondition) {
      conditionToRemove.feature = condition.featureCondition as any;
    }

    // lodash-filter 的判断原因，
    const relatedHotkeyConfigs = filter(this.hotkeyConfigs, conditionToRemove);

    // 完全移除的话，有如下两个条件
    // 1. 「移除条件」仅为某个「特性」相关的热键信息
    // or
    // 2. 「移除条件」包含「指定的热键」，如果「指定的热键」被清后。相应的「特性」如果没有其余可对应的「热键」了（【标记1】），则直接整个移除
    const completelyRemoveConfigs: HotkeyConfig[] = [];

    for (const relatedHotkeyConfig of relatedHotkeyConfigs) {
      // 没传指定的 hotkey 条件，则删所有与特性相关的配置
      if (!conditionToRemove.keyCombinations) {
        completelyRemoveConfigs.push(relatedHotkeyConfig);
        removeById.call(this, relatedHotkeyConfig.id);
      } else {
        for (
          let index = relatedHotkeyConfig.keyCombinations.length;
          index >= 0;
          index--
        ) {
          condition.hotkeys.forEach(item => {
            if (isEqual(relatedHotkeyConfig.keyCombinations[index], item)) {
              removeKeyCombsByIdAndIndex.call(this, relatedHotkeyConfig.id, index);
            }
          });
        }

        // 【标记1】
        if (relatedHotkeyConfig.keyCombinations.length === 0) {
          completelyRemoveConfigs.push(relatedHotkeyConfig);
          removeById.call(this, relatedHotkeyConfig.id);
        }
      }
    }

    return completelyRemoveConfigs;

    function removeKeyCombsByIdAndIndex(
      this: HotkeyConfigPool,
      hotkeyId: HotkeyConfig['id'],
      keyCombIndex: number
    ) {
      const hotkeyConfig = this.hotkeyConfigs.find(config => config.id === hotkeyId)!;

      hotkeyConfig.keyCombinations.splice(keyCombIndex, 1);
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
      getSuitedHotkeyConfig: getSuitedHotkeyConfig.bind(this)
    };

    interface SuitedHotkeyConfig {
      common: HotkeyConfig[];
      sequence: HotkeyConfig[];
    }

    function getSuitedHotkeyConfig(
      this: HotkeyConfigPool,
      lastTwoKeyCombinations: readonly [KeyCombination | undefined, KeyCombination]
    ): SuitedHotkeyConfig {
      const suitedHotkeyConfig: SuitedHotkeyConfig = {
        common: [],
        sequence: []
      };

      this.hotkeyConfigs.forEach(config => {
        config.keyCombinations.forEach(keyCombConfig => {
          if (keyCombConfig.type === 'common') {
            // 是 common 类型的键，且此次按下的键与配置中的键相符，即达标
            const [, lastOneKeyComb] = lastTwoKeyCombinations;

            if (isKeyCombEqual(lastOneKeyComb, keyCombConfig)) {
              suitedHotkeyConfig.common.push(config);
            }
          } else {
            const [penultimateKeyComb, lastOneKeyComb] = lastTwoKeyCombinations;

            // 没有倒数第二组键，则不匹配 「键序列」 相关的键
            if (!penultimateKeyComb) {
              return;
            }

            sequenceFor: for (let i = 0; i < keyCombConfig.sequenceGroup.length; i++) {
              const currentSequenceKeyComb = keyCombConfig.sequenceGroup[i];

              const nextSequenceKeyComb = keyCombConfig.sequenceGroup[i + 1] as
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
                    /* 单组键的间隔要求 */ currentSequenceKeyComb.interval! >=
                    /* 倒数第一组键的按下时间 */ lastOneKeyComb.timeStamp -
                      /* 倒数第二组键的按下时间 */ penultimateKeyComb.timeStamp;

                  if (effectiveInterval) {
                    suitedHotkeyConfig.sequence.push(config);
                    // 找到了理想的键序列配置，则结束
                    break sequenceFor;
                  }
                }
              }
            }
          }
        });
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
