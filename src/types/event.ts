export interface ICustomEvent<EventData = any> {
  type: string;
  data?: EventData;
}

export interface CustomEventClass {
  new (data: any): void;
}
