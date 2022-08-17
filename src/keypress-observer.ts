import type { F } from 'ts-toolbelt';

import type { DefaultNormalKey } from './constants/keyboard-key';
import type { HotkeyConfig } from './data-pool/hotkey-config-poll';
import { keypressRecordPool } from './data-pool/keypress-record-poll';
import type { TriggerMode } from './types/option';
import { getPressedModifierKeys } from './utils/hotkey';

export interface ObserveParams {
  hotkeyId: HotkeyConfig['id'];
  targetElement: HTMLElement | Window;
  eventType: TriggerMode;
  capture?: boolean;
}

class KeypressObserver {
  private hotkeyIdListenerMap: Record<HotkeyConfig['id'], F.Function> = {};

  observe(params: ObserveParams) {
    const { capture, eventType, targetElement, hotkeyId } = params;

    const listener = (event: KeyboardEvent) => {
      keypressRecordPool.add({
        eventType: params.eventType,
        focusElment: event.target,
        normalKey: event.key as DefaultNormalKey,
        modifierKeys: getPressedModifierKeys(event),
        timestamp: Date.now()
      });
    };

    targetElement.addEventListener(eventType, listener as any, capture);

    this.hotkeyIdListenerMap[hotkeyId] = listener;
  }

  stopObserve(params: ObserveParams) {
    const { capture, eventType, targetElement, hotkeyId } = params;

    targetElement.removeEventListener(
      eventType,
      this.hotkeyIdListenerMap[hotkeyId],
      capture
    );
  }
}

export const keypressObserver = new KeypressObserver();
