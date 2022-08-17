import type { F } from 'ts-toolbelt';

import type { DefaultNormalKey } from './constants/keyboard-key';
import type { HotkeyInfo } from './data-pool/hotkey-info-poll';
import { keypressRecordPool } from './data-pool/keypress-record-poll';
import type { TriggerMode } from './types/option';
import { getPressedModifierKeys } from './utils/hotkey';

export interface ObserveParams {
  hotkeyID: HotkeyInfo['id'];
  targetElement: HTMLElement | Window;
  eventType: TriggerMode;
  capture?: boolean;
}

class KeypressObserver {
  private hotkeyIDListenerMap: Record<HotkeyInfo['id'], F.Function> = {};

  observe(params: ObserveParams) {
    const { capture, eventType, targetElement, hotkeyID } = params;

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

    this.hotkeyIDListenerMap[hotkeyID] = listener;
  }

  stopObserve(params: ObserveParams) {
    const { capture, eventType, targetElement, hotkeyID } = params;

    targetElement.removeEventListener(
      eventType,
      this.hotkeyIDListenerMap[hotkeyID],
      capture
    );
  }
}

export const keypressObserver = new KeypressObserver();
