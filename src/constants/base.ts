import type { FeatureOption } from '../types/feature-option';

export const defaultTriggerOptions: FeatureOption.Internal.TriggerOptions = {
  allowRepeatWhenLongPress: true,
  throttleDelay: 0,
  capture: false,
  mode: 'keydown'
};
