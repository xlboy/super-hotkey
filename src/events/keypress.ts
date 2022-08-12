import type { ICustomEvent } from '../types/event';

export class KeypressEvent implements ICustomEvent<KeyboardEvent> {
  type: 'keypress';
  data: KeyboardEvent;

  constructor(data: KeyboardEvent) {
    this.data = data;
  }
}
