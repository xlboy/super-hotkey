import type { UnifiedHotkey, UniformFeature } from '../types/entrance';

// 暂不分

// type CommonKeyItem = {
//   hotkey: Omit<UnifiedCommonKey, 'type'>;
//   feature: UniformHotkeyOptions;
// };

// type KeySequenceItem = {
//   hotkey: Omit<UnifiedKeySequence, 'type'>;
//   feature: UniformHotkeyOptions;
// };

type HotkeyInfo = {
  hotkey: UnifiedHotkey;
  feature: UniformFeature;
};

class HotkeyInfoPool {
  private hotkeyInfos: HotkeyInfo[] = [];

  public clear() {
    this.hotkeyInfos = [];
  }

  public add(hotkeyInfo: HotkeyInfo) {
    this.hotkeyInfos.push(hotkeyInfo);
  }

  public remove(/* 删除条件待定 */): void {}

  public find(/* 查询条件待定 */) {}

  public update() {}
}

export const hotkeyInfoPool = new HotkeyInfoPool();
