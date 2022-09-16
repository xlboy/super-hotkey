import type { DefaultModifierCode, DefaultNormalCode } from '../constants/keyboard-code';
import { defaultModifierCodes } from '../constants/keyboard-code';
import { dispatch } from '../dispatch';
import type { HotkeyId } from '../hotkey-config-poll';
import { hotkeyConfigPool } from '../hotkey-config-poll';
import { verifyCodeMatch } from '../utils';

class LongPressMatcher {
  private downCodeMap: Record<
    HotkeyId,
    {
      normals: Set<DefaultNormalCode>;
      modifiers: Set<DefaultModifierCode>;
    }
  > = {};
  private timerIdToFire: Record<HotkeyId, NodeJS.Timeout> = {};
  public match = (hotkeyId: HotkeyId, event: KeyboardEvent): void => {
    this.updateDownCode(hotkeyId, event);

    if (event.type === 'keydown') {
      this.keyDownHandler(hotkeyId, event);
    } else {
      this.keyUpHandler(hotkeyId);
    }
  };

  private keyDownHandler = (hotkeyId: HotkeyId, event: KeyboardEvent): void => {
    const downCodes = this.downCodeMap[hotkeyId];
    const hotkeyConfig = hotkeyConfigPool.findById(hotkeyId);

    if (hotkeyConfig && hotkeyConfig.keyComb.type === 'common') {
      for (const configKeyComb of hotkeyConfig.keyComb.contents) {
        if (configKeyComb.type !== 'longPress') continue;

        if (configKeyComb.longPressTime > 0) {
          const verifyResult = verifyCodeMatch(configKeyComb, {
            modifiers: [...downCodes.modifiers],
            normals: [...downCodes.normals]
          });

          if (verifyResult.modifier.perfectMatch && verifyResult.normal.perfectMatch) {
            if (!this.timerIdToFire[hotkeyId]) {
              let isAlreadyExecuted = false;

              this.timerIdToFire[hotkeyId] = setTimeout(() => {
                isAlreadyExecuted = true;

                // 执行已达标的「长按热键」事件
                dispatch.dispatch(hotkeyId, hotkeyConfig, event);
                // TODO: 可能要给 timer-delay 加点料
              }, configKeyComb.longPressTime);

              setTimeout(() => {
                if (!isAlreadyExecuted) {
                  delete this.timerIdToFire[hotkeyId];
                }
              }, configKeyComb.longPressTime);
            }

            break;
          }
        }
      }
    }
  };

  private keyUpHandler = (hotkeyId: HotkeyId): void => {
    const loosenDownCode = this.downCodeMap[hotkeyId];
    const timerIdToFire = this.timerIdToFire[hotkeyId];

    // 可能是从上一个 按键周期 那残留下来的
    if (!loosenDownCode || !timerIdToFire) return;

    const hotkeyConfig = hotkeyConfigPool.findById(hotkeyId);

    if (hotkeyConfig && hotkeyConfig.keyComb.type === 'common') {
      let isEffective = false;

      for (const configKeyComb of hotkeyConfig.keyComb.contents) {
        if (configKeyComb.type !== 'longPress') continue;

        if (configKeyComb.longPressTime > 0) {
          const verifyResult = verifyCodeMatch(configKeyComb, {
            modifiers: [...loosenDownCode.modifiers],
            normals: [...loosenDownCode.normals]
          });

          if (verifyResult.modifier.onlySatisfied && verifyResult.normal.onlySatisfied) {
            isEffective = true;

            break;
          }
        }
      }

      if (!isEffective) {
        clearTimeout(timerIdToFire);
        delete this.timerIdToFire[hotkeyId];
      }
    }
  };

  private updateDownCode(hotkeyId: HotkeyId, event: KeyboardEvent) {
    const eventCode = event.code as any;

    const downCodes =
      this.downCodeMap[hotkeyId] ||
      (this.downCodeMap[hotkeyId] = {
        normals: new Set<DefaultNormalCode>(),
        modifiers: new Set<DefaultModifierCode>()
      });

    const isModifierCode = (defaultModifierCodes as unknown as any[]).includes(eventCode);

    if (event.type === 'keydown') {
      if (isModifierCode) {
        downCodes.modifiers.add(eventCode);
      } else {
        downCodes.normals.add(eventCode);
      }
    } else {
      if (isModifierCode) {
        downCodes.modifiers.delete(eventCode);
      } else {
        downCodes.normals.delete(eventCode);
      }
    }
  }
}

export const longPressMatcher = new LongPressMatcher();
