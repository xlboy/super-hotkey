import { isEqual, pick } from 'lodash-es';

import type { MergedModifierKey, MergedNormalKey } from './constants/keyboard-key';
import type {
  HotkeyConfig,
  InternalSequenceKeyCombination
} from './data-pool/hotkey-config-poll';
import { hotkeyConfigPool } from './data-pool/hotkey-config-poll';
import type { KeypressRecord } from './data-pool/keypress-record-poll';

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

      const currentTargetElKeyCombs = this.targetElKeyCombinationMap.get(targetElement)!;

      this.sequenceHandler(currentTargetElKeyCombs);
    }
  }

  public sequenceHandler(currentTargetElKeyCombs: Array<KeyCombination>) {
    // 根据 `最后按下的两组键` 来匹配出 `合适的热键们`
    const suitedHotkeyConfig = hotkeyConfigPool.utils.getSuitedHotkeyConfig([
      currentTargetElKeyCombs.at(-2),
      currentTargetElKeyCombs.at(-1)!
    ]);

    const perfectlyMatchedSequenceConfig: HotkeyConfig[] = [];
    let minStartIndex!: number;

    suitedHotkeyConfig.sequences.forEach(sequenceConfig => {
      const sequencesSource = (
        sequenceConfig.keyCombination as InternalSequenceKeyCombination
      ).sequences;

      for (
        let keyCombIndex = currentTargetElKeyCombs.length - 1;
        keyCombIndex >= 0;
        keyCombIndex--
      ) {
        const caudalKeyCombs = currentTargetElKeyCombs.slice(keyCombIndex);

        caudalKeyCombs.every((caudalKeyComb, index) => {
          // 判断 「修饰键」 与 「正常键」 是否符合要求
          if (
            isEqual(caudalKeyComb.modifierKeys, sequencesSource[index].modifierKeys) &&
            isEqual(caudalKeyComb.normalKey, sequencesSource[index].normalKey)
          ) {
            if (index === 0) {
              return true;
            }

            const effectiveInterval =
              /* 当前的尾部的时间戳 */ caudalKeyComb.timeStamp -
                /* 上一个的尾部的时间戳 */ caudalKeyCombs[index - 1].timeStamp <=
              /* 键序列配置里要求的间隔 */ sequencesSource[index].interval;

            if (effectiveInterval) {
              // 当前的尾部的热键信息全部验证成功，可记录最小开始索引
              if (index === caudalKeyCombs.length - 1) {
                // 刷新最小起始索引
                if (keyCombIndex < minStartIndex) {
                  minStartIndex = keyCombIndex;
                }

                if (
                  keyCombIndex === 0 &&
                  caudalKeyCombs.length === sequencesSource.length
                ) {
                  perfectlyMatchedSequenceConfig.push(sequenceConfig);
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
      perfectlyMatchedSequenceConfig,
      minStartIndex
    };
  }

  private longPressHandler() {}
}

export const matcher = new Matcher();
