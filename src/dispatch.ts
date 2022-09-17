import type { HotkeyConfig, HotkeyId } from './hotkey-config-poll';

class EventDispatch {
  private fireInfoOfHotkey: Partial<
    Record<
      HotkeyId,
      {
        fireTime: number;
        throttleTimerId?: NodeJS.Timeout;
      }
    >
  > = {};

  public dispatch = (
    hotkeyId: HotkeyId,
    hotkeyConfig: HotkeyConfig,
    event: KeyboardEvent
  ) => {
    const fireInfo = this.fireInfoOfHotkey[hotkeyId];
    const { trigger: triggerOptions } = hotkeyConfig.feature.options;

    if (fireInfo && triggerOptions.throttleDelay) {
      // TODO: 在节流的时间内，不触发浏览器的默认行为。另外，还需辅助一波是否需要「阻止浏览器的默认行为」
      const handlePreventDefault = () => {
        if (hotkeyConfig.feature.options.autoPreventDefault) {
          event.preventDefault();
        }
      };

      if (fireInfo.throttleTimerId) {
        handlePreventDefault();

        return;
      }

      // 当「上次触发时间(1000ms) + 要求的间隔时间(3000ms) > 当前时间(2500ms)」时
      // 证明「当前事件是在间隔时间内触发」的。需要安排一波节流
      const inThrottling = fireInfo.fireTime + triggerOptions.throttleDelay > Date.now();

      if (inThrottling) {
        fireInfo.throttleTimerId = setTimeout(() => {
          delete fireInfo.throttleTimerId;
          toFire();
        }, fireInfo.fireTime + triggerOptions.throttleDelay - Date.now());
        handlePreventDefault();
      } else {
        toFire();
      }
    } else {
      this.fireInfoOfHotkey[hotkeyId] = {
        fireTime: Date.now()
      };
      toFire();
    }

    return;

    function toFire() {
      if (fireInfo) {
        fireInfo.fireTime = Date.now();
      }

      switch (hotkeyConfig.feature.type) {
        case 'callback': {
          const { callback, autoPreventDefault, autoStopPropagation } =
            hotkeyConfig.feature.options;
          const callbackVal = callback(event);

          const autoHandle = callbackVal === undefined;

          if (autoHandle) {
            if (autoPreventDefault) {
              event.preventDefault();
            }

            if (autoStopPropagation) {
              event.stopPropagation();
            }
          }

          break;
        }

        case 'domMethod': {
          const { method, targetElement, autoPreventDefault, autoStopPropagation } =
            hotkeyConfig.feature.options;

          if (typeof targetElement === 'string') {
            const elements = document.querySelectorAll(targetElement);

            elements.forEach(element => {
              if (method in element) {
                (element as any)[method]();
              }
            });
          } else {
            if (method in targetElement) {
              (targetElement as any)[method]();
            }
          }

          if (autoPreventDefault) {
            event.preventDefault();
          }

          if (autoStopPropagation) {
            event.stopPropagation();
          }

          break;
        }
      }
    }
  };
}

export const dispatch = new EventDispatch();
