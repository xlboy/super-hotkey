import type { ICustomEvent } from '../types/event';

export class KeyupEvent implements ICustomEvent<KeyboardEvent> {
  type: 'keyup';
  data: KeyboardEvent;

  constructor(data: KeyboardEvent) {
    this.data = data;
  }
}
