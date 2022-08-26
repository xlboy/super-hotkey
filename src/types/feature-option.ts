import type { PartialDeep } from 'type-fest';

namespace FeatureOption {
  export namespace Internal {
    export type TriggerOptions = Required<NonNullable<Base['trigger']>>; // RequiredDeep<Pick<Base, 'trigger'>>;

    export type Union = Generator<Callback, DOMMethod>;

    type Callback = _Callback & { trigger: TriggerOptions };

    type DOMMethod = _DOMMethod & { trigger: TriggerOptions };
  }

  export namespace External {
    export type Callback = _Callback;

    export type DOMMethod = _DOMMethod;

    export type Union = Generator<Callback, DOMMethod>;
  }

  export type Condition = Generator<
    PartialDeep<_Callback>,
    PartialDeep<_DOMMethod>,
    false
  >;

  interface Base {
    trigger?: {
      /**
       * Trigger mode
       * @default 'keydown'
       */
      mode?: 'keydown' | 'keyup';

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
       * When the hotkey is in the `longPress` state, repeated trigger is allowed
       * @default true
       */
      allowRepeatWhenLongPress?: boolean;
    };
    scope?: string;
    /**
     * **`热键级别`**
     *
     * 在相同热键中，会按照 `level 大小` 进行逐一响应
     */
    level?: number;
  }

  type Generator<CallbackOptions, DOMMethodOptions, Required extends boolean = true> =
    | ({ type: 'domMethod' } & (Required extends true
        ? { options: DOMMethodOptions }
        : { options?: DOMMethodOptions }))
    | ({ type: 'callback' } & (Required extends true
        ? { options: CallbackOptions }
        : { options?: CallbackOptions }));

  interface _Callback extends Base {
    /**
     * @returns 是否显式阻止默认行为（事件冒泡、默认操作）。
     *
     * 如果返回 `void`（默认值），则由 `autoStopPropagation`、`autoPreventDefault` 属性决定
     */
    callback: (event: KeyboardEvent) => boolean | void;

    /**
     * 要触发 `callback` 的目标元素
     */
    targetElement?: HTMLElement;
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

  interface _DOMMethod extends Base {
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement#methods
     */
    method: 'blur' | 'click' | 'focus';
    /**
     * `目标元素`，即 `method` 对应的元素
     */
    targetElement: HTMLElement | /* query-selector-value */ string;

    /**
     * `焦点元素`
     *
     * 需聚焦于此元素上，方可触发 `method`
     *
     * @default document
     */
    focusElement?: HTMLElement;

    // TODO: 后面再决定是否要加 autoStopPropagation、autoPreventDefault 等属性
  }
}

export default FeatureOption;
