export type { EventOptions, DOMActionOptions, TriggerMode };

type TriggerMode = 'keydown' | 'keyup' | 'keypress';

interface BaseOptions {
  id?: string;
  trigger?: {
    /**
     * Trigger mode
     * @default 'keydown'
     */
    mode?: TriggerMode;

    /**
     * @default false
     */
    capture?: boolean;

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
  targetElement?: HTMLDivElement;
  scope?: string;
  /**
   * **`热键级别`**
   *
   * 在相同热键中，会按照 `level 大小` 进行逐一响应
   */
  level?: number;
}

interface EventOptions extends BaseOptions {
  handler: () => void;
  /**
   * **是否自动 `停止事件传播`**
   *
   * 如为 `false`，则在 `handler` 中通过 `event.stopPropagation` 手动处理
   *
   * @default false
   */
  autoStopPropagation?: boolean;

  /**
   * **是否自动 `阻止浏览器默认行为`**
   *
   * 如为 `false`，则在 `handler` 中通过 `event.preventDefault` 手动处理
   *
   * @default true
   */
  autoPreventDefault?: boolean;
}

interface DOMActionOptions extends BaseOptions {
  action: 'blur' | 'click' | 'focus';

  // TODO: 后面再决定是否要加 autoStopPropagation、autoPreventDefault 等属性
}
