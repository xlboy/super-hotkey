import type { F } from 'ts-toolbelt';

import type { DefaultNormalKey } from './constants/keyboard-key';
import type { HotkeyConfig } from './hotkey-config-poll';
import { hotkeyConfigPool } from './hotkey-config-poll';
import { shortPressMatcher } from './matcher/short-press';
import type FeatureOption from './types/feature-option';
import { filterTargetElementToObserve, getPressedModifierKeys } from './utils/base';

type TriggerMode = FeatureOption.Internal.TriggerOptions['mode'];

class KeypressObserver {
  private listenerMap = new Map<
    HotkeyConfig['id'],
    {
      isLongPressHotkey: boolean;
    } & Partial<Record<TriggerMode, F.Function>>
  >();

  public observeByHotkeyId(hotkeyId: HotkeyConfig['id']) {
    const { feature, keyComb } = hotkeyConfigPool.findById(hotkeyId)!;
    const isLongPressHotkey = keyComb.type === 'common-long-press';
    const targetElement = filterTargetElementToObserve(feature);
    // TODO: 类型待完善，实际上在入库前， options-trigger 肯定是有默认值的
    const triggerOptions = feature.options.trigger;

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

      this.listenerMap.set(hotkeyId, {
        isLongPressHotkey: true,
        keydown: keyDownListener,
        keyup: keyUpListener
      });
    } else {
      const listener = getListenerByTriggerMode(triggerOptions.mode);

      targetElement.addEventListener(
        triggerOptions.mode,
        listener as any,
        triggerOptions.capture
      );

      this.listenerMap.set(hotkeyId, {
        isLongPressHotkey: false,
        [triggerOptions.mode]: listener
      });
    }

    return;

    function getListenerByTriggerMode(triggerMode: TriggerMode) {
      return (event: KeyboardEvent) => {
        shortPressMatcher.match(event, {
          hotkeyId,
          modifierKeys: getPressedModifierKeys(event),
          normalKey: event.key as DefaultNormalKey,
          targetElement,
          timeStamp: event.timeStamp
        });
      };
    }
  }

  public stopObserve(params: {
    targetElement: Window | HTMLElement;
    triggerOptions: FeatureOption.Internal.TriggerOptions;
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
          triggerOptions.capture
        );
        targetElement.removeEventListener(
          'keyup',
          keyboardListenerMap['keyup']!,
          // TODO: 关于长按系列的热键，是否需要 capture，还需待定
          triggerOptions.capture
        );
      } else {
        targetElement.removeEventListener(
          triggerOptions.mode,
          keyboardListenerMap[triggerOptions.mode]!,
          triggerOptions.capture
        );
      }
    }

    this.hotkeyListeners.removeByHotkeyId(hotkeyId);
  }
}

export const keypressObserver = new KeypressObserver();
