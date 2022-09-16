import type { DefaultModifierCode, DefaultNormalCode } from '../constants/keyboard-code';
import { defaultModifierCodes } from '../constants/keyboard-code';
import { dispatch } from '../dispatch';
import type { HotkeyConfig, HotkeyId } from '../hotkey-config-poll';
import { hotkeyConfigPool } from '../hotkey-config-poll';
import type FeatureOption from '../types/feature-option';
import { verifyCodeMatch } from '../utils';

export interface ShortPressKeyCombination {
  modifierKeys: DefaultModifierCode[];
  normalKey: DefaultNormalCode;
  timeStamp: number;
}

export type UnifiedCodeMap = {
  normals: Set<DefaultNormalCode>;
  modifiers: Set<DefaultModifierCode>;
};

type DownCodesMap = Record<HotkeyId, UnifiedCodeMap>;

class ShortPressMatcher {
  private downCodeMap: DownCodesMap = {};
  private proxyDownCodesMap: DownCodesMap = {};
  private upNormalCodesMap: Record<HotkeyId, Set<DefaultNormalCode>> = {};

  public match = (
    hotkeyId: HotkeyId,
    event: KeyboardEvent,
    triggerMode: FeatureOption.Internal.TriggerOptions['mode']
  ) => {
    this.updateCode(hotkeyId, event, triggerMode);

    if (triggerMode === 'keydown' && event.type === 'keydown') {
      const hotkeyConfig = hotkeyConfigPool.findById(hotkeyId)!;

      if (this.verifyDownCode(hotkeyConfig, hotkeyId)) {
        dispatch.dispatch(hotkeyId, hotkeyConfig, event);
      }
    } else if (triggerMode === 'keyup' && event.type === 'keyup') {
      const hotkeyConfig = hotkeyConfigPool.findById(hotkeyId)!;

      if (this.verifyUpCode(hotkeyConfig, hotkeyId)) {
        dispatch.dispatch(hotkeyId, hotkeyConfig, event);
      }
    }
  };

  private updateCode(
    hotkeyId: HotkeyId,
    event: KeyboardEvent,
    triggerMode: FeatureOption.Internal.TriggerOptions['mode']
  ) {
    const downCode =
      this.downCodeMap[hotkeyId] ||
      (this.downCodeMap[hotkeyId] = { modifiers: new Set(), normals: new Set() });

    const proxyDownCode =
      this.proxyDownCodesMap[hotkeyId] ||
      (this.proxyDownCodesMap[hotkeyId] = { modifiers: new Set(), normals: new Set() });

    const upNormalCodes =
      this.upNormalCodesMap[hotkeyId] || (this.upNormalCodesMap[hotkeyId] = new Set());

    const currentCode = event.code as any;
    const isModifierCode = defaultModifierCodes.includes(currentCode);

    if (triggerMode === 'keyup') {
      if (event.type === 'keyup') {
        if (!isModifierCode) {
          upNormalCodes.add(currentCode);
          proxyDownCode.normals.delete(currentCode);
        } else {
          proxyDownCode.modifiers.delete(currentCode);
        }
      } else {
        if (isModifierCode) {
          proxyDownCode.modifiers.add(currentCode);
        } else {
          proxyDownCode.normals.add(currentCode);
        }
      }
    } else {
      if (event.type === 'keyup') {
        if (isModifierCode) {
          downCode.modifiers.delete(currentCode);
        } else {
          downCode.normals.delete(currentCode);
        }
      } else {
        if (isModifierCode) {
          downCode.modifiers.add(currentCode);
        } else {
          downCode.normals.add(currentCode);
        }
      }
    }
  }

  private verifyDownCode(hotkeyConfig: HotkeyConfig, hotkeyId: HotkeyId) {
    switch (hotkeyConfig.keyComb.type) {
      case 'common':
        for (const configKeyComb of hotkeyConfig.keyComb.contents) {
          if (configKeyComb.type === 'shortPress') {
            const downCode = this.downCodeMap[hotkeyId];

            const verifyResult = verifyCodeMatch(configKeyComb, {
              modifiers: [...downCode.modifiers],
              normals: [...downCode.normals]
            });

            if (verifyResult.modifier.perfectMatch && verifyResult.normal.perfectMatch) {
              return true;
            }
          }
        }

        break;
    }

    return false;
  }

  private verifyUpCode(hotkeyConfig: HotkeyConfig, hotkeyId: HotkeyId) {
    const downCode = this.proxyDownCodesMap[hotkeyId];
    const upNormalCodes = [...this.upNormalCodesMap[hotkeyId]];

    if (downCode.normals.size !== 0) {
      return;
    }

    switch (hotkeyConfig.keyComb.type) {
      case 'common':
        for (const configCode of hotkeyConfig.keyComb.contents) {
          if (configCode.type === 'shortPress') {
            for (
              let upNormalCodeIndex = upNormalCodes.length - 1;
              upNormalCodeIndex >= 0;
              upNormalCodeIndex--
            ) {
              const caudalUpNormalCodes = upNormalCodes.slice(upNormalCodeIndex);

              const verifyResult = verifyCodeMatch(configCode, {
                modifiers: [...downCode.modifiers],
                normals: caudalUpNormalCodes
              });

              if (
                verifyResult.modifier.perfectMatch &&
                verifyResult.normal.perfectMatch
              ) {
                return true;
              }
            }
          }
        }

        break;
    }

    return false;
  }
}

export const shortPressMatcher = new ShortPressMatcher();
