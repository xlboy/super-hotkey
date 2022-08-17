import { filter, isEqual } from 'lodash-es';
import { nanoid } from 'nanoid';
import type { PartialDeep, ReadonlyDeep } from 'type-fest';

import type {
  UnbindFeatureCondition,
  UnifiedHotkey,
  UniformFeature
} from '../types/entrance';

// 暂不分

// type CommonKeyItem = {
//   hotkey: Omit<UnifiedCommonKey, 'type'>;
//   feature: UniformHotkeyOptions;
// };

// type KeySequenceItem = {
//   hotkey: Omit<UnifiedKeySequence, 'type'>;
//   feature: UniformHotkeyOptions;
// };

export interface HotkeyConfig {
  id: string;
  hotkeys: UnifiedHotkey[];
  feature: UniformFeature;
}

class HotkeyConfigPool {
  private hotkeyConfigs: HotkeyConfig[] = [];

  public clear() {
    this.hotkeyConfigs = [];
  }

  public size() {
    return this.hotkeyConfigs.length;
  }

  public add(
    hotkeyConfig: Pick<HotkeyConfig, 'hotkeys' | 'feature'>
  ): HotkeyConfig['id'] | false {
    const hotkeyId = nanoid();

    this.hotkeyConfigs.push({ ...hotkeyConfig, id: hotkeyId });

    return hotkeyId;
  }

  public remove(hotkey: UnifiedHotkey): void {}

  public findById(id: HotkeyConfig['id']): ReadonlyDeep<HotkeyConfig> | undefined {
    const foundHotkeyConfig = this.hotkeyConfigs.find(config => config.id === id);

    return foundHotkeyConfig as any;
  }

  public update() {}

  public getQualifiedHotkeyIds(demand: {
    hotkeys?: UnifiedHotkey[];
    featureCondition?: UnbindFeatureCondition;
  }): Array<HotkeyConfig['id']> {
    const hotkeyConfigCondition: Partial<HotkeyConfig> = {};

    if (demand.hotkeys) {
      hotkeyConfigCondition.hotkeys = demand.hotkeys;
    }

    if (demand.featureCondition) {
      hotkeyConfigCondition.feature = demand.featureCondition as any;
    }

    const satisfactoryHotkeyIds: Array<HotkeyConfig['id']> = filter(
      this.hotkeyConfigs,
      hotkeyConfigCondition
    ).map(_ => _.id);

    return satisfactoryHotkeyIds;
  }
}

export const hotkeyConfigPool = new HotkeyConfigPool();
