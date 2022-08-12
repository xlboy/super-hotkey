import type { CustomEventClass, ICustomEvent } from '../types/event';
import type { IEvent } from '../types/i-event';

export class Event implements IEvent {
  private subscribes: WeakMap<CustomEventClass, ((data: any) => void)[]> = new WeakMap();

  dispatch<T extends ICustomEvent>(v: T) {
    const list = this.subscribes.get(this.getConstructor(v));

    list?.forEach(func => {
      func(v.data);
    });
  }

  subscribe<
    T extends CustomEventClass,
    EventData = T extends new (data: infer P) => void ? P : never
  >(event: T, cb: (data: EventData) => void) {
    if (!this.subscribes.has(event)) {
      this.subscribes.set(event, []);
    }

    const list = this.subscribes.get(event);

    if (typeof cb === 'function' && list && !list.includes(cb)) {
      list.push(cb);
    }
  }

  unsubscribe<T extends CustomEventClass>(event: T): void;
  unsubscribe<
    T extends CustomEventClass,
    EventData = T extends new (data: infer P) => void ? P : never
  >(event: T, cb: (data: EventData) => void): void;
  unsubscribe(event: unknown, cb?: unknown): void {
    if (!event) throw new Error('事件构造函数不能为空');
    const Constructor = this.getConstructor(event as ICustomEvent);

    if (!cb && event) {
      this.subscribes.delete(Constructor);
    } else if (event && cb) {
      const list = this.subscribes.get(Constructor) || [];

      this.subscribes.set(
        Constructor,
        list?.filter(m => m !== cb)
      );
    }
  }

  clear(): void {
    this.subscribes = new WeakMap();
  }

  private getConstructor(v: any) {
    if (v.prototype) return v.prototype.constructor;
    if (v.__proto__) return v.__proto__.constructor;
    throw new Error('未找到原形的构造函数');
  }
}
