import type { F } from 'ts-toolbelt';

import type { DefaultNormalKey } from './constants/keyboard-key';
import type { HotkeyConfig } from './data-pool/hotkey-config-poll';
import { hotkeyConfigPool } from './data-pool/hotkey-config-poll';
import type { KeypressRecord } from './data-pool/keypress-record-poll';
import { matcher } from './matcher';
import type { UnifiedFeature } from './types/entrance';
import type { BaseOptions, TriggerMode } from './types/option';
import { filterTargetElementToObserve, getPressedModifierKeys } from './utils/base';

class HotkeyListeners {
  private list: Array<
    { hotkeyId: HotkeyConfig['id']; isLongPressHotkey: boolean } & Partial<
      Record<TriggerMode, F.Function>
    >
  > = [];

  public add(item: typeof this.list[number]) {
    this.list.push(item);
  }

  public findByHotkeyId(hotkeyId: HotkeyConfig['id']) {
    const foundTarget = this.list.find(item => item.hotkeyId === hotkeyId);

    return foundTarget;
  }
  public removeByHotkeyId(hotkeyId: HotkeyConfig['id']) {
    const indexToRemove = this.list.findIndex(item => item.hotkeyId === hotkeyId);

    if (indexToRemove !== -1) {
      this.list.splice(indexToRemove, 1);
    }
  }
}

class KeypressObserver {
  private hotkeyListeners = new HotkeyListeners();

  public observeByHotkeyId(hotkeyId: HotkeyConfig['id']) {
    const { feature } = hotkeyConfigPool.findById(hotkeyId)!;
    const targetElement = filterTargetElementToObserve(feature as UnifiedFeature);
    // TODO: 类型待完善，实际上在入库前， options-trigger 肯定是有默认值的
    const triggerOptions = feature.options.trigger!;

    const isLongPressHotkey = triggerOptions.isLongPress!;

    // 将 listener 存至 `hotkeyListeners` 中，以便卸载热键时从里面取（通过核心因素 `hotkeyId`）
    if (isLongPressHotkey) {
      const keyDownListener = getListenerByTriggerMode('keydown');
      const keyUpListener = getListenerByTriggerMode('keyup');

      targetElement.addEventListener(
        'keydown',
        keyDownListener as any,
        // TODO: 关于长按系列的热键，是否需要 capture，还需待定
        triggerOptions.capture
      );
      targetElement.addEventListener(
        'keyup',
        keyUpListener as any,
        triggerOptions.capture
      );

      this.hotkeyListeners.add({
        hotkeyId,
        isLongPressHotkey: true,
        keydown: keyDownListener,
        keyup: keyUpListener
      });
    } else {
      const listener = getListenerByTriggerMode(triggerOptions.mode!);

      targetElement.addEventListener(
        triggerOptions.mode!,
        listener as any,
        triggerOptions.capture
      );

      this.hotkeyListeners.add({
        hotkeyId,
        isLongPressHotkey: false,
        [triggerOptions.mode!]: listener
      });
    }

    return;

    function getListenerByTriggerMode(triggerMode: TriggerMode) {
      return (event: KeyboardEvent) => {
        const latestKeypressRecord: KeypressRecord = {
          triggerMode,
          targetElement,
          normalKey: event.key as DefaultNormalKey,
          modifierKeys: getPressedModifierKeys(event),
          timeStamp: Date.now(),
          hotkeyId
        };

        matcher.match(event, isLongPressHotkey, latestKeypressRecord);
      };
    }
  }

  public stopObserve(params: {
    targetElement: Window | HTMLElement;
    triggerOptions: BaseOptions['trigger'];
    hotkeyId: HotkeyConfig['id'];
  }) {
    const { hotkeyId, targetElement, triggerOptions } = params;
    const hotkeyListenerInfoToStop = this.hotkeyListeners.findByHotkeyId(hotkeyId);

    if (hotkeyListenerInfoToStop) {
      const { isLongPressHotkey, ...keyboardListenerMap } = hotkeyListenerInfoToStop;

      if (isLongPressHotkey) {
        targetElement.removeEventListener(
          'keydown',
          keyboardListenerMap['keydown']!,
          // TODO: 关于长按系列的热键，是否需要 capture，还需待定
          triggerOptions!.capture
        );
        targetElement.removeEventListener(
          'keyup',
          keyboardListenerMap['keyup']!,
          // TODO: 关于长按系列的热键，是否需要 capture，还需待定
          triggerOptions!.capture
        );
      } else {
        targetElement.removeEventListener(
          triggerOptions!.mode!,
          keyboardListenerMap[triggerOptions!.mode!]!,
          triggerOptions!.capture
        );
      }
    }

    this.hotkeyListeners.removeByHotkeyId(hotkeyId);
  }
}

export const keypressObserver = new KeypressObserver();
