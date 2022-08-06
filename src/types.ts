import type { EnhancedKeyName, NativeKeyName } from './constants/key-name';

export function defineVariables<T>() {
  return <C extends T>(value: C) => value;
}

type TriggerMode = 'keydown' | 'keyup' | 'keypress';

export type KeyName = EnhancedKeyName | NativeKeyName;

export interface SuperHotkeyBaseConfig {
  /**
   * Enable dev tools
   * @default false
   */
  enableDevTools?: boolean;
}

interface SuperHotkeyBaseOptions {
  trigger?: {
    /**
     * Trigger mode
     * @default 'keydown'
     */
    mode?: TriggerMode;

    /**
     * Throttling delay of hotkey response, The unit is `ms`
     * @default 0
     */
    throttleDelay?: number;
    /**
     * When the hotkey is in the `long-press` state, repeated trigger is allowed
     * @default true
     */
    allowRepeatWhenLongPress: boolean;
  };

  event?: {
    /**
     * Stop propagation
     * @default false
     */
    stopPropagation?: boolean;

    /**
     * Prevents default browser behavior
     * @default true
     */
    preventDefault?: boolean;
  };
}

export interface SuperHotkeyGlobalOptions extends SuperHotkeyBaseOptions {
  /**
   * Hotkey the element to bind, When the element is uninstalled, the hotkey is also uninstalled
   */
  bindElement?: HTMLDivElement;
}

export interface SuperHotkeyScopeOptions {
  targetElement: HTMLDivElement;
}
