// import type { DefaultModifierKey } from './constants/keyboard-key';
import type {
  DefaultModifierCode,
  DefaultNormalCode,
  MergedModifierCode
} from './constants/keyboard-code';
import { extendedModifierCodeMap } from './constants/keyboard-code';
import { extendedNormalCodeMap } from './constants/keyboard-code';
import type { TargetElementToObserve } from './types/base';
import type FeatureOption from './types/feature-option';
import type Hotkey from './types/hotkey';

export function filterTargetElementToObserve(
  featureOption: FeatureOption.Internal.Union
): TargetElementToObserve {
  let targetElement!: TargetElementToObserve;

  if (featureOption.type === 'callback') {
    targetElement = featureOption.options.targetElement || document;
  } else {
    targetElement = featureOption.options.focusElement || document;
  }

  return targetElement;
}

export function isMacPlatform() {
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

export function verifyCodeMatch(
  configCode: Hotkey.Internal.BaseCode,
  currentCode: {
    normals: DefaultNormalCode[];
    modifiers: DefaultModifierCode[];
  }
) {
  let configModifierCodeCount = 0;
  let configNormalCodeCount = 0;

  const allModifierSame = configCode.modifierCodes.every(configCode => {
    const extendedModifierCodes: DefaultModifierCode[] | undefined = Reflect.get(
      extendedModifierCodeMap,
      configCode
    );

    const isEffectiveModifier = extendedModifierCodes !== undefined;

    if (isEffectiveModifier) {
      let isEffective = false;

      for (const code of extendedModifierCodes) {
        if (currentCode.modifiers.includes(code)) {
          configModifierCodeCount += 1;
          isEffective = true;
        }
      }

      if (isEffective) return true;
    } else {
      if (currentCode.modifiers.includes(configCode as any)) {
        configModifierCodeCount += 1;

        return true;
      }

      return false;
    }
  });

  const allNormalSame = configCode.normalCodes.every(configCode => {
    const extendedPolymorphicCode:
      | DefaultNormalCode
      | DefaultNormalCode[]
      | [[MergedModifierCode, DefaultNormalCode], ...DefaultNormalCode[]] = Reflect.get(
      extendedNormalCodeMap,
      configCode
    );

    let isEffective = false;
    const isStringType = typeof extendedPolymorphicCode === 'string';
    const isArrayType = Array.isArray(extendedPolymorphicCode);

    if (isStringType && currentCode.normals.includes(extendedPolymorphicCode)) {
      isEffective = true;
      configNormalCodeCount += 1;
    } else if (isArrayType) {
      const isDefaultNormalArr = typeof extendedPolymorphicCode[0] === 'string';

      if (isDefaultNormalArr) {
        const defaultNormalCodes = extendedPolymorphicCode;

        for (const defaultNormalCode of defaultNormalCodes) {
          if (currentCode.normals.includes(defaultNormalCode as any)) {
            isEffective = true;
            configNormalCodeCount += 1;
          }
        }
      } else {
        const [[modifierCodeOfComb, defaultNormalCodeOfComb], ...defaultNormalCodes] =
          extendedPolymorphicCode;

        if (currentCode.normals.includes(defaultNormalCodeOfComb as any)) {
          const extendedModifierCodes: DefaultModifierCode[] | undefined = Reflect.get(
            extendedModifierCodeMap,
            modifierCodeOfComb
          );

          const isExtendedModifierCode = extendedModifierCodes !== undefined;

          if (isExtendedModifierCode) {
            let effectiveModifierCount = 0;

            for (const defaultModifierCode of extendedModifierCodes) {
              if (currentCode.modifiers.includes(defaultModifierCode)) {
                effectiveModifierCount += 1;
              }
            }

            const isEffectiveModifier = effectiveModifierCount !== 0;

            if (isEffectiveModifier) {
              configModifierCodeCount += effectiveModifierCount;
              configNormalCodeCount += 1;
              isEffective = true;
            }
          }
        }

        for (const defaultNormalCode of defaultNormalCodes) {
          if (currentCode.normals.includes(defaultNormalCode as any)) {
            configNormalCodeCount += 1;
            isEffective = true;
          }
        }
      }
    }

    return isEffective;
  });

  return {
    modifier: {
      perfectMatch:
        configModifierCodeCount === currentCode.modifiers.length && allModifierSame,
      onlySatisfied: allModifierSame
    },
    normal: {
      perfectMatch: configNormalCodeCount === currentCode.normals.length && allNormalSame,
      onlySatisfied: allNormalSame
    }
  };
}
