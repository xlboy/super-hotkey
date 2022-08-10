import type { CustomEventClass, ICustomEvent } from './event';

export abstract class IEvent {
  /* 订阅一个事件 */
  abstract subscribe<
    T extends CustomEventClass,
    EventData = T extends new (data: infer P) => void ? P : never
  >(event: T, cb: (data: EventData) => void): void;

  /* 触发一个事件 */
  abstract dispatch<T extends ICustomEvent>(v: T): void;

  /* 清空所有订阅 */
  abstract clear(): void;

  /* 取消订阅一个类型的事件 */
  abstract unsubscribe<T extends CustomEventClass>(event: T): void;

  /* 取消订阅一个事件 */
  abstract unsubscribe<
    T extends CustomEventClass,
    EventData = T extends new (data: infer P) => void ? P : never
  >(event: T, cb: (data: EventData) => void): void;
}
