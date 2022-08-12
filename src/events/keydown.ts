import type { ICustomEvent } from '../types/event';

export class KeydownEvent implements ICustomEvent<KeyboardEvent> {
  type: 'keydown';
  data: KeyboardEvent;

  constructor(data: KeyboardEvent) {
    this.data = data;
  }
}
