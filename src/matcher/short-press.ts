import { isEqual } from 'lodash-es';

import type {
  DefaultModifierKey,
  DefaultNormalKey,
  MergedModifierKey,
  MergedNormalKey
} from '../constants/keyboard-key';
import { dispatch } from '../dispatch';
import type { HotkeyConfig } from '../hotkey-config-poll';
import { hotkeyConfigPool } from '../hotkey-config-poll';
import type { Hotkey } from '../types/hotkey';

export interface KeyCombination {
  modifierKeys: MergedModifierKey[];
  normalKey: MergedNormalKey;
  timeStamp: number;
}

class ShortPressMatcher {
  private targetElKeyCombMap = new WeakMap<EventTarget, Array<KeyCombination>>();

  public match(params: {
    event: KeyboardEvent;
    timeStamp: number;
    normalKey: DefaultNormalKey;
    modifierKeys: DefaultModifierKey[];
    targetEl: HTMLElement | Document;
    hotkeyId: HotkeyConfig['id'];
  }) {
    const { modifierKeys, normalKey, timeStamp, targetEl, event } = params;

    this.targetElKeyCombMap.set(
      targetEl,
      (this.targetElKeyCombMap.get(targetEl) || []).concat({
        modifierKeys,
        normalKey,
        timeStamp
      })
    );

    const targetElKeyCombs = this.targetElKeyCombMap.get(targetEl)!;

    const suitedHotkeyConfig = hotkeyConfigPool.utils.getSuitedHotkeyConfig([
      targetElKeyCombs.at(-2),
      targetElKeyCombs.at(-1)!
    ]);

    const matchedSequence = this.sequenceMatcher(
      targetElKeyCombs,
      suitedHotkeyConfig.similarSequences
    );

    if (matchedSequence.usefulStartIndex !== undefined) {
      this.removeUselessHistoryKeyCombsFromHead(
        targetEl,
        matchedSequence.usefulStartIndex
      );
    }

    if (suitedHotkeyConfig.perfectMatchedCommons.length !== 0) {
      dispatch.dispatch(suitedHotkeyConfig.perfectMatchedCommons, event);
    }

    if (matchedSequence.perfectlyMatchedConfigs.length !== 0) {
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
      const keyCombsOfSimilarConfig = similarConfig.keyComb
        .contents as Hotkey.Internal.Sequence[];

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

  private removeUselessHistoryKeyCombsFromHead(
    targetElement: EventTarget,
    deleteCount: number
  ) {
    this.targetElKeyCombMap.set(
      targetElement,
      (this.targetElKeyCombMap.get(targetElement) || []).splice(0, deleteCount)
    );
  }
}

export const shortPressMatcher = new ShortPressMatcher();
