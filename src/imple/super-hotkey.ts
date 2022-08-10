import { Event } from './event';
import { SuperHotkeyKebordRecord } from './super-hotkey-keyboard-record';
import type { CustomEventClass, ICustomEvent } from '../types/event';
import type { IEvent } from '../types/i-event';
import type { ISuperHotkey } from '../types/i-super-hotkey';
import type { ISuperHotkeyKeyboardRecord } from '../types/i-super-hotkey-keyboard-record';

export class SuperHotkey implements ISuperHotkey {
  private keyboardRecord: ISuperHotkeyKeyboardRecord;
  private event: IEvent;

  constructor() {
    this.event = new Event();
    this.keyboardRecord = new SuperHotkeyKebordRecord(this.event);

    this.keyboardRecord.startListenKeyboardEvent();
  }

  dispatch<T extends ICustomEvent<any>>(v: T): void {
    this.event.dispatch(v);
  }

  subscribe<
    T extends CustomEventClass,
    EventData = T extends new (data: infer P) => void ? P : never
  >(event: T, cb: (data: EventData) => void): void {
    this.event.subscribe(event, cb);
  }

  clear(): void {
    this.event.clear();
  }

  unsubscribe<T extends CustomEventClass>(event: T): void;
  unsubscribe<
    T extends CustomEventClass,
    EventData = T extends new (data: infer P) => void ? P : never
  >(event: T, cb: (data: EventData) => void): void;
  unsubscribe(event: any, cb?: any): void {
    this.event.unsubscribe(event, cb);
  }

  destroy() {
    this.keyboardRecord.destroy();
  }
}
