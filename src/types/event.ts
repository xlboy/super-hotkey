export interface ICustomEvent<EventData = any> {
  type: string;
  data?: EventData;
}

export interface CustomEventClass<EventData = any> {
  new (data: EventData): ICustomEvent<EventData>;
}
