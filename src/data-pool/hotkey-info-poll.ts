import { nanoid } from 'nanoid';
import type { O } from 'ts-toolbelt';
import type { ReadonlyDeep } from 'type-fest';

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

export interface HotkeyInfo {
  id: string;
  hotkeys: UnifiedHotkey[];
  feature: UniformFeature;
}

class HotkeyInfoPool {
  private hotkeyInfos: HotkeyInfo[] = [];

  public clear() {
    this.hotkeyInfos = [];
  }

  /**
   *
   * @returns `HotkeyInfo['id']`
   */
  public add(
    hotkeyInfo: Pick<HotkeyInfo, 'hotkeys' | 'feature'>
  ): HotkeyInfo['id'] | false {
    const hotkeyID = nanoid();

    this.hotkeyInfos.push({ ...hotkeyInfo, id: hotkeyID });

    return hotkeyID;
  }

  public remove(hotkey: UnifiedHotkey): void {}

  public findByID(id: HotkeyInfo['id']): ReadonlyDeep<HotkeyInfo> | undefined {
    const foundHotkeyInfo = this.hotkeyInfos.find(info => info.id === id);

    return foundHotkeyInfo as any;
  }

  public update() {}

  public get utils() {
    return {
      // ByUnifiedHotkey
    };
  }
}

export const hotkeyInfoPool = new HotkeyInfoPool();
