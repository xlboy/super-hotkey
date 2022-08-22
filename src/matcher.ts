import { isEqual } from 'lodash-es';

import type { MergedModifierKey, MergedNormalKey } from './constants/keyboard-key';
import type {
  HotkeyConfig,
  InternalSequenceKeyCombination
} from './data-pool/hotkey-config-poll';
import { hotkeyConfigPool } from './data-pool/hotkey-config-poll';
import type { KeypressRecord } from './data-pool/keypress-record-poll';
import { dispatch } from './dispatch';

export interface KeyCombination {
  modifierKeys: MergedModifierKey[];
  normalKey: MergedNormalKey;
  timeStamp: number;
}

class Matcher {
  private targetElKeyCombinationMap: WeakMap<EventTarget, Array<KeyCombination>> =
    new WeakMap();

  public match(
    event: KeyboardEvent,
    isLongPressHotkey: boolean,
    keypressRecord: KeypressRecord
  ) {
    if (isLongPressHotkey) {
      this.longPressHandler;
    } else {
      const { modifierKeys, normalKey, timeStamp, targetElement } = keypressRecord;

      this.targetElKeyCombinationMap.set(
        targetElement,
        (this.targetElKeyCombinationMap.get(targetElement) || []).concat({
          modifierKeys,
          normalKey,
          timeStamp
        })
      );

      const targetElKeyCombs = this.targetElKeyCombinationMap.get(targetElement)!;

      const suitedHotkeyConfig = hotkeyConfigPool.utils.getSuitedHotkeyConfig([
        targetElKeyCombs.at(-2),
        targetElKeyCombs.at(-1)!
      ]);

      const matchedSequence = this.sequenceMatcher(
        targetElKeyCombs,
        suitedHotkeyConfig.similarSequences
      );

      if (matchedSequence.usefulStartIndex !== undefined) {
        this.uselessHistoryKeyCombsToRemoveFromHead(
          targetElement,
          matchedSequence.usefulStartIndex
        );
      }

      dispatch.dispatch(suitedHotkeyConfig.perfectMatchedCommons, event);
      dispatch.dispatch(matchedSequence.perfectlyMatchedConfigs, event);
    }
  }

  public sequenceMatcher(
    targetElKeyCombs: Array<KeyCombination>,
    similarSequenceConfigs: HotkeyConfig[]
  ) {
    const perfectlyMatchedConfigs: HotkeyConfig[] = [];
    let usefulStartIndex: number | undefined = undefined;

    similarSequenceConfigs.forEach(similarConfig => {
      const keyCombsOfSimilarConfig = (
        similarConfig.keyCombination as InternalSequenceKeyCombination
      ).sequences;

      for (
        let targetElKeyCombIndex = targetElKeyCombs.length - 1;
        targetElKeyCombIndex >= 0;
        targetElKeyCombIndex--
      ) {
        const caudalKeyCombs = targetElKeyCombs.slice(targetElKeyCombIndex);

        caudalKeyCombs.every((caudalKeyComb, caudalKeyCombIndex) => {
          if (
            isEqual(
              caudalKeyComb.modifierKeys,
              keyCombsOfSimilarConfig[caudalKeyCombIndex].modifierKeys
            ) &&
            isEqual(
              caudalKeyComb.normalKey,
              keyCombsOfSimilarConfig[caudalKeyCombIndex].normalKey
            )
          ) {
            if (caudalKeyCombIndex === 0) {
              return true;
            }

            const effectiveInterval =
              /* 当前的尾部的时间戳 */ caudalKeyComb.timeStamp -
                /* 上一个的尾部的时间戳 */ caudalKeyCombs[caudalKeyCombIndex - 1]
                  .timeStamp <=
              /* 键序列配置里要求的间隔 */ keyCombsOfSimilarConfig[caudalKeyCombIndex]
                .interval;

            if (effectiveInterval) {
              // 当前的尾部的热键信息全部验证成功，可记录最小开始索引
              if (caudalKeyCombIndex === caudalKeyCombs.length - 1) {
                // 刷新最小起始索引
                if (
                  usefulStartIndex === undefined ||
                  targetElKeyCombIndex < usefulStartIndex
                ) {
                  usefulStartIndex = targetElKeyCombIndex;
                }

                if (
                  targetElKeyCombIndex === 0 &&
                  caudalKeyCombs.length === keyCombsOfSimilarConfig.length
                ) {
                  perfectlyMatchedConfigs.push(similarConfig);
                }
              }

              return true;
            }
          }

          return false;
        });
      }
    });

    return {
      perfectlyMatchedConfigs,
      usefulStartIndex
    };
  }

  private uselessHistoryKeyCombsToRemoveFromHead(
    targetElement: EventTarget,
    deleteCount: number
  ) {
    this.targetElKeyCombinationMap.set(
      targetElement,
      (this.targetElKeyCombinationMap.get(targetElement) || []).splice(0, deleteCount)
    );
  }

  private longPressHandler() {}
}

export const matcher = new Matcher();
