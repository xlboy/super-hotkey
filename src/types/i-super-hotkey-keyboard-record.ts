/* 记录键盘事件的模块 */
export abstract class ISuperHotkeyKeyboardRecord {
  /* 监听用户的键盘事件并进行记录 */
  abstract startListenKeyboardEvent(): void;

  /* 移除监听 */
  abstract stopListenKeyboardEvent(): void;

  /* 主动销毁 */
  abstract destroy(): void;
}
