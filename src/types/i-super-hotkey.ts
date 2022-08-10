import { IEvent } from './i-event';

/* 热键主程序类型 */
export abstract class ISuperHotkey extends IEvent {
  /* 主动销毁 */
  abstract destroy(): void;
}
