import type { DefaultKey } from './constants/keyboard-key';
import type { HotkeyConfig } from './data-pool/hotkey-config-poll';
import { hotkeyConfigPool } from './data-pool/hotkey-config-poll';
import { dispatch } from './dispatch';
import { filterTargetElementToObserve } from './utils/base';

class LongPressMatcher {
  private targetElKeyMap: WeakMap<
    EventTarget,
    {
      downedKeys: Array<DefaultKey>;
      hotkeysToFire: Array<{
        type: 'common';
        keys: DefaultKey[];
        hotkeyId: HotkeyConfig['id'];
        timeoutId: NodeJS.Timeout;
        __flag__: Symbol;
      }>;
    }
  > = new WeakMap();

  public keyDown(params: {
    key: DefaultKey;
    targetElement: EventTarget;
    event: KeyboardEvent;
  }): void {
    const { downedKeys, hotkeysToFire } = this.targetElKeyMap.get(
      params.targetElement
    ) || { downedKeys: [], hotkeysToFire: [] };

    downedKeys.push(params.key);

    hotkeyConfigPool.forEach(config => {
      const configTargetElement = filterTargetElementToObserve(config.feature as any);

      if (configTargetElement === params.targetElement) {
        if (
          config.keyCombination.type === 'common' &&
          config.feature.options.trigger?.isLongPress
        ) {
          for (const commonKeyComb of config.keyCombination.contents) {
            if (commonKeyComb.longPressTime! > 0) {
              const allKeys = commonKeyComb.modifierKeys.concat(
                commonKeyComb.normalKey as any
              ) as DefaultKey[];

              const allKeysSame = allKeys.every(key => downedKeys.includes(key));

              if (allKeysSame) {
                const sameHotkeyAlreadyExists =
                  hotkeysToFire.findIndex(item => item.hotkeyId === config.id) !== -1;

                if (!sameHotkeyAlreadyExists) {
                  const __flag__ = Symbol();

                  hotkeysToFire.push({
                    type: 'common',
                    hotkeyId: config.id,
                    keys: allKeys,
                    __flag__,
                    timeoutId: setTimeout(() => {
                      this.removeHotkeyToFireByFlag({
                        __flag__,
                        targetElement: params.targetElement
                      });

                      this.commonHandler({
                        hotkeyConfig: config as any,
                        event: params.event
                      });
                    }, commonKeyComb.longPressTime)
                  });

                  setTimeout(() => {
                    this.removeHotkeyToFireByFlag({
                      targetElement: params.targetElement,
                      __flag__
                    });
                  }, commonKeyComb.longPressTime);
                }
              }
            }
          }
        }
      }
    });

    this.targetElKeyMap.set(params.targetElement, {
      downedKeys,
      hotkeysToFire
    });
  }

  public keyUp(params: { key: DefaultKey; targetElement: EventTarget }): void {
    const { downedKeys, hotkeysToFire } = this.targetElKeyMap.get(params.targetElement)!;

    removeDownedKey.call(this);
    releaseHotkeyToFire.call(this);

    this.targetElKeyMap.set(params.targetElement, {
      downedKeys,
      hotkeysToFire
    });

    return;

    function releaseHotkeyToFire(this: LongPressMatcher) {
      for (
        let hotkeyIndexToFire = hotkeysToFire.length - 1;
        hotkeyIndexToFire >= 0;
        hotkeyIndexToFire--
      ) {
        const hotkeyToFire = hotkeysToFire[hotkeyIndexToFire];

        if (hotkeyToFire.keys.includes(params.key)) {
          clearTimeout(hotkeyToFire.timeoutId);
          hotkeysToFire.splice(hotkeyIndexToFire, 1);
        }
      }
    }

    function removeDownedKey(this: LongPressMatcher) {
      const downedKeyIndexToRemove = downedKeys.findIndex(
        downedKey => downedKey === params.key
      );

      if (downedKeyIndexToRemove !== -1) {
        downedKeys.splice(downedKeyIndexToRemove, 1);
      }
    }
  }

  private commonHandler = (params: {
    hotkeyConfig: HotkeyConfig;
    event: KeyboardEvent;
  }) => {
    dispatch.dispatch([params.hotkeyConfig], params.event);
  };

  private removeHotkeyToFireByFlag = (params: {
    targetElement: EventTarget;
    __flag__: Symbol;
  }) => {
    const { hotkeysToFire, downedKeys } = this.targetElKeyMap.get(params.targetElement)!;

    const indexToRemove = hotkeysToFire.findIndex(
      item => item.__flag__ === params.__flag__
    );

    hotkeysToFire.splice(indexToRemove, 1);

    this.targetElKeyMap.set(params.targetElement, {
      downedKeys,
      hotkeysToFire
    });
  };
}

export const longPressMatcher = new LongPressMatcher();
