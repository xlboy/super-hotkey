import type { F } from 'ts-toolbelt';

import type { DefaultModifierCode } from './constants/keyboard-code';
import { defaultModifierCodes } from './constants/keyboard-code';
import type { HotkeyConfig, HotkeyId } from './hotkey-config-poll';
import { hotkeyConfigPool } from './hotkey-config-poll';
import { longPressMatcher } from './matcher/long-press';
import { shortPressMatcher } from './matcher/short-press';
import type { TargetElementToObserve } from './types/base';
import type FeatureOption from './types/feature-option';
import type Hotkey from './types/hotkey';
import { filterTargetElementToObserve, isMacPlatform } from './utils';

type TriggerMode = FeatureOption.Internal.TriggerOptions['mode'];

class KeyObserver {
  private listener = {
    longPressMap: new Map<HotkeyId, Record<TriggerMode, F.Function>>(),
    shortPressMap: new Map<
      HotkeyId,
      Partial<Record<'keyUp' | 'keyDown' | 'proxyKeyDown', F.Function>>
    >()
  };

  public startObserve(hotkeyId: HotkeyId) {
    const hotkeyConfig = hotkeyConfigPool.findById(hotkeyId)!;
    const keyPressTypes = getKeyPressType.call(this, hotkeyConfig.keyComb);
    const targetElement = filterTargetElementToObserve(hotkeyConfig.feature);
    const triggerOptions = hotkeyConfig.feature.options.trigger;

    if (keyPressTypes.includes('longPress')) {
      const keyDownListener = getKeyListener('longPress');
      const keyUpListener = getKeyListener('longPress');

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

      this.listener.longPressMap.set(hotkeyId, {
        keydown: keyDownListener,
        keyup: keyUpListener
      });
    }

    if (keyPressTypes.includes('shortPress')) {
      const triggerMode = triggerOptions.mode;

      if (triggerMode === 'keydown') {
        const keyDownListener = getKeyListener('shortPress');
        const keyUpListener = getKeyListener('shortPress');

        targetElement.addEventListener(
          'keydown',
          keyDownListener as any,
          triggerOptions.capture
        );

        document.addEventListener('keyup', keyUpListener as any);

        this.listener.shortPressMap.set(hotkeyId, {
          keyDown: keyDownListener,
          keyUp: keyUpListener
        });
      } else if (triggerMode === 'keyup') {
        const keyUpListener = getKeyListener('shortPress');
        const proxyKeyDownListener = getKeyListener('shortPress');

        document.addEventListener('keydown', proxyKeyDownListener as any);

        targetElement.addEventListener(
          'keyup',
          keyUpListener as any,
          triggerOptions.capture
        );

        this.listener.shortPressMap.set(hotkeyId, {
          keyUp: keyUpListener,
          proxyKeyDown: proxyKeyDownListener
        });
      }
    }

    return;

    function getKeyListener(keyPressType: Hotkey.Internal.KeyPressTypes[number]) {
      const artificialKeyUpTimerId: Record<KeyboardEvent['code'], NodeJS.Timeout> = {};

      return (event: KeyboardEvent) => {
        if (event.type === 'keydown') {
          // 解决 meta 键在 mac 系统下松开没响应的情况
          if (
            event.metaKey &&
            isMacPlatform() &&
            !defaultModifierCodes.includes(event.code as DefaultModifierCode)
          ) {
            if (Reflect.has(artificialKeyUpTimerId, event.code)) {
              clearTimeout(artificialKeyUpTimerId[event.code]);
            }

            artificialKeyUpTimerId[event.code] = setTimeout(() => {
              delete artificialKeyUpTimerId[event.code];
              targetElement.dispatchEvent(new KeyboardEvent('keyup', { ...event }));
            }, 50);
          }
        }

        if (keyPressType === 'longPress') {
          longPressMatcher.match(hotkeyId, event);
        } else {
          shortPressMatcher.match(hotkeyId, event, triggerOptions.mode);
        }
      };
    }

    function getKeyPressType(this: KeyObserver, keyComb: HotkeyConfig['keyComb']) {
      const keyPressTypes: Hotkey.Internal.KeyPressTypes[number][] = [];

      if (keyComb.type === 'sequence') {
        keyPressTypes.push('shortPress');
      } else {
        keyComb.contents.forEach(commonKeyComb => {
          if (!keyPressTypes.includes(commonKeyComb.type)) {
            keyPressTypes.push(commonKeyComb.type);
          }
        });
      }

      return keyPressTypes;
    }
  }

  public stopObserve(params: {
    keyPressType: Hotkey.Internal.KeyPressTypes[number];
    targetElement: TargetElementToObserve;
    triggerOptions: FeatureOption.Internal.TriggerOptions;
    hotkeyId: HotkeyId;
  }) {
    const {
      hotkeyId,
      targetElement,
      triggerOptions,
      keyPressType: keypressType
    } = params;

    switch (keypressType) {
      case 'longPress': {
        const { keydown: keyDownListener, keyup: keyUpListener } =
          this.listener.longPressMap.get(hotkeyId)!;

        targetElement.removeEventListener(
          'keydown',
          keyDownListener,
          // TODO: 关于长按系列的热键，是否需要 capture，还需待定
          triggerOptions.capture
        );

        targetElement.removeEventListener(
          'keyup',
          keyUpListener,
          // TODO: 关于长按系列的热键，是否需要 capture，还需待定
          triggerOptions.capture
        );

        this.listener.longPressMap.delete(hotkeyId);
        break;
      }

      case 'shortPress': {
        const shortPressListenerToStop = this.listener.shortPressMap.get(hotkeyId)!;

        if (triggerOptions.mode === 'keyup') {
          document.removeEventListener('keydown', shortPressListenerToStop.proxyKeyDown!);

          targetElement.removeEventListener(
            'keyup',
            shortPressListenerToStop.keyUp!,
            triggerOptions.capture
          );
        } else if (triggerOptions.mode === 'keydown') {
          targetElement.removeEventListener(
            'keydown',
            shortPressListenerToStop.keyUp!,
            triggerOptions.capture
          );
        }

        this.listener.shortPressMap.delete(hotkeyId);
        break;
      }
    }
  }
}

export const keyObserver = new KeyObserver();
