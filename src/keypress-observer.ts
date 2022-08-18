import type { F } from 'ts-toolbelt';

import type { DefaultNormalKey } from './constants/keyboard-key';
import type { HotkeyConfig } from './data-pool/hotkey-config-poll';
import { hotkeyConfigPool } from './data-pool/hotkey-config-poll';
import { keypressRecordPool } from './data-pool/keypress-record-poll';
import { matcher } from './matcher';
import type { UnifiedFeature } from './types/entrance';
import type { TriggerMode } from './types/option';
import { getPressedModifierKeys, globalThisPolyfill } from './utils/base';

export interface ObserveParams {
  hotkeyId: HotkeyConfig['id'];
  targetElement: HTMLElement | Window;
  eventType: TriggerMode;
  capture?: boolean;
}

class KeypressObserver {
  private hotkeyIdListenerMap: Record<ObserveParams['hotkeyId'], F.Function> = {};

  observeByHotkeyId(hotkeyId: HotkeyConfig['id']) {
    const { feature } = hotkeyConfigPool.findById(hotkeyId)!;
    const targetElement = this.filterTargetElementToObserve(feature as UnifiedFeature);
    const triggerOptions = feature.options.trigger!;

    const listener = (event: KeyboardEvent) => {
      keypressRecordPool.add({
        // TODO: 类型待完善，实际上在入库前，肯定是有默认值的
        triggerMode: triggerOptions.mode!,
        focusElement: event.target || event.srcElement,
        normalKey: event.key as DefaultNormalKey,
        modifierKeys: getPressedModifierKeys(event),
        timestamp: Date.now(),
        hotkeyId
      });
    };

    targetElement.addEventListener(
      triggerOptions.mode!,
      listener as any,
      triggerOptions.capture
    );

    this.hotkeyIdListenerMap[hotkeyId] = listener;
  }

  stopObserveByHotkeyId(hotkeyId: HotkeyConfig['id']) {
    const { feature } = hotkeyConfigPool.findById(hotkeyId)!;
    const targetElement = this.filterTargetElementToObserve(feature as UnifiedFeature);
    const triggerOptions = feature.options.trigger!;

    targetElement.removeEventListener(
      triggerOptions.mode!,
      this.hotkeyIdListenerMap[hotkeyId],
      triggerOptions.capture!
    );

    delete this.hotkeyIdListenerMap[hotkeyId];
    keypressRecordPool.removeByHotkeyId(hotkeyId);
  }

  private filterTargetElementToObserve(featureOption: UnifiedFeature) {
    let targetElement!: ObserveParams['targetElement'];

    if (featureOption.type === 'callback') {
      targetElement = featureOption.options.targetElement || globalThisPolyfill;
    } else {
      targetElement = featureOption.options.focusElement || globalThisPolyfill;
    }

    return targetElement;
  }
}

export const keypressObserver = new KeypressObserver();
