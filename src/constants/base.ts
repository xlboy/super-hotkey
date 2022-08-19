import type { BaseOptions } from '../types/option';

export const defaultTriggerOptions: BaseOptions['trigger'] = {
  allowRepeatWhenLongPress: true,
  throttleDelay: 0,
  capture: false,
  mode: 'keydown',
  isLongPress: false
};
