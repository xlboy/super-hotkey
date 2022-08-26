/**
 * @see {@link https://github.com/puppeteer/puppeteer/blob/main/src/common/USKeyboardLayout.ts#L297}
 *
 * @see {@link https://developer.mozilla.org/zh-CN/docs/Web/API/UI_Events/Keyboard_event_key_values}
 */

import { defineVariables } from '../types/base';
import { isMacPlatform } from '../utils';

export type DefaultCode = DefaultNormalCode | DefaultModifierCode;

//#region  //*=========== Modifier Key ===========
export { defaultModifierCodes, extendedModifierCodeMap };

export type { MergedModifierCode, DefaultModifierCode, ExtendedModifierCode };

const defaultModifierCodes = [
  'ShiftLeft',
  'ShiftRight',
  'ControlLeft',
  'ControlRight',
  'AltLeft',
  'AltRight',
  'MetaLeft',
  'MetaRight'
] as const;

const extendedModifierCodeMap = defineVariables<Record<string, DefaultModifierCode[]>>()({
  Shift: ['ShiftLeft', 'ShiftRight'],
  '⇧': ['ShiftLeft', 'ShiftRight'],

  '⌥': ['AltLeft', 'AltRight'],
  Alt: ['AltLeft', 'AltRight'],

  Ctrl: ['ControlLeft', 'ControlRight'],
  Control: ['ControlLeft', 'ControlRight'],
  '⌃': ['ControlLeft', 'ControlRight'],

  Meta: ['MetaLeft', 'MetaRight'],
  Mod: isMacPlatform() ? ['MetaLeft', 'MetaRight'] : ['ControlLeft', 'ControlRight']
});

type DefaultModifierCode = typeof defaultModifierCodes[number];

type ExtendedModifierCode = keyof typeof extendedModifierCodeMap;

type MergedModifierCode = DefaultModifierCode | ExtendedModifierCode;

//#endregion  //*======== Modifier Key ===========

//#region  //*=========== Normal Key ===========
export { defaultNormalCodes, extendedNormalCodeMap };

export type { MergedNormalCode, DefaultNormalCode };

const defaultNormalCodes = [
  'Power',
  'Eject',
  'Abort',
  'Help',
  'Backspace',
  'Tab',
  'Enter',
  'Pause',
  'CapsLock',
  'Escape',
  'Convert',
  'NonConvert',
  'Space',
  'PageUp',
  'PageDown',
  'End',
  'Home',
  'ArrowLeft',
  'ArrowUp',
  'ArrowRight',
  'ArrowDown',
  'Select',
  'Open',
  'PrintScreen',
  'Insert',
  'Delete',
  'Digit0',
  'Digit1',
  'Digit2',
  'Digit3',
  'Digit4',
  'Digit5',
  'Digit6',
  'Digit7',
  'Digit8',
  'Digit9',
  'Numpad0',
  'Numpad1',
  'Numpad2',
  'Numpad3',
  'Numpad4',
  'Numpad5',
  'Numpad6',
  'Numpad7',
  'Numpad8',
  'Numpad9',
  'NumpadEnter',
  'NumpadDecimal',
  'NumpadMultiply',
  'NumpadAdd',
  'NumpadSubtract',
  'NumpadDivide',
  'NumpadEqual',
  'KeyA',
  'KeyB',
  'KeyC',
  'KeyD',
  'KeyE',
  'KeyF',
  'KeyG',
  'KeyH',
  'KeyI',
  'KeyJ',
  'KeyK',
  'KeyL',
  'KeyM',
  'KeyN',
  'KeyO',
  'KeyP',
  'KeyQ',
  'KeyR',
  'KeyS',
  'KeyT',
  'KeyU',
  'KeyV',
  'KeyW',
  'KeyX',
  'KeyY',
  'KeyZ',
  'ContextMenu',
  'F1',
  'F2',
  'F3',
  'F4',
  'F5',
  'F6',
  'F7',
  'F8',
  'F9',
  'F10',
  'F11',
  'F12',
  'F13',
  'F14',
  'F15',
  'F16',
  'F17',
  'F18',
  'F19',
  'F20',
  'F21',
  'F22',
  'F23',
  'F24',
  'NumLock',
  'ScrollLock',
  'AudioVolumeMute',
  'AudioVolumeDown',
  'AudioVolumeUp',
  'MediaTrackNext',
  'MediaTrackPrevious',
  'MediaStop',
  'MediaPlayPause',
  'Semicolon',
  'Equal',
  'Comma',
  'Minus',
  'Period',
  'Slash',
  'Backquote',
  'BracketLeft',
  'Backslash',
  'BracketRight',
  'Quote',
  'AltGraph',
  'Props',
  'SoftLeft',
  'SoftRight',
  'Camera',
  'Call',
  'EndCall',
  'VolumeDown',
  'VolumeUp'
] as const;

const extendedNormalCodeMap = defineVariables<
  Record<
    string,
    | DefaultNormalCode
    | DefaultNormalCode[]
    | [[MergedModifierCode, DefaultNormalCode], ...DefaultNormalCode[]]
  >
>()({
  '←': 'ArrowLeft',
  '→': 'ArrowRight',
  '↑': 'ArrowUp',
  '↓': 'ArrowDown',

  //#region  //*=========== 符号区 ===========
  ';': 'Semicolon',
  ':': [['Shift', 'Semicolon']],

  '=': 'Equal',
  '+': [['Shift', 'Equal'], 'NumpadAdd'],

  ',': 'Comma',
  '<': [['Shift', 'Comma']],

  '-': ['Minus', 'NumpadSubtract'],
  _: [['Shift', 'Minus']],

  '.': 'Period',
  '>': [['Shift', 'Period']],

  '/': ['Slash', 'NumpadDivide'],
  '?': [['Shift', 'Slash']],

  '`': 'Backquote',
  '~': [['Shift', 'Backquote']],

  '[': 'BracketLeft',
  '{': [['Shift', 'BracketLeft']],

  ']': 'BracketRight',
  '}': [['Shift', 'BracketRight']],

  '\\': 'Backslash',
  '|': [['Shift', 'Backslash']],

  "'": 'Quote',
  '"': [['Shift', 'Quote']],

  ')': [['Shift', 'Digit0']],
  '!': [['Shift', 'Digit1']],
  '@': [['Shift', 'Digit2']],
  '#': [['Shift', 'Digit3']],
  $: [['Shift', 'Digit4']],
  '%': [['Shift', 'Digit5']],
  '^': [['Shift', 'Digit6']],
  '&': [['Shift', 'Digit7']],
  '*': [['Shift', 'Digit8'], 'NumpadMultiply'],
  '(': [['Shift', 'Digit9']],

  //#endregion  //*======== 符号区 ===========

  //#region  //*=========== a-z 字母区 ===========
  a: 'KeyA',
  b: 'KeyB',
  c: 'KeyC',
  d: 'KeyD',
  e: 'KeyE',
  f: 'KeyF',
  g: 'KeyG',
  h: 'KeyH',
  i: 'KeyI',
  j: 'KeyJ',
  k: 'KeyK',
  l: 'KeyL',
  m: 'KeyM',
  n: 'KeyN',
  o: 'KeyO',
  p: 'KeyP',
  q: 'KeyQ',
  r: 'KeyR',
  s: 'KeyS',
  t: 'KeyT',
  u: 'KeyU',
  v: 'KeyV',
  w: 'KeyW',
  x: 'KeyX',
  y: 'KeyY',
  z: 'KeyZ',
  //#endregion  //*======== a-z 字母区 ===========

  //#region  //*=========== 0-9 数字区 ===========
  '0': ['Numpad0', 'Digit0'],
  '1': ['Numpad1', 'Digit1'],
  '2': ['Numpad2', 'Digit2'],
  '3': ['Numpad3', 'Digit3'],
  '4': ['Numpad4', 'Digit4'],
  '5': ['Numpad5', 'Digit5'],
  '6': ['Numpad6', 'Digit6'],
  '7': ['Numpad7', 'Digit7'],
  '8': ['Numpad8', 'Digit8'],
  '9': ['Numpad9', 'Digit9'],
  //#endregion  //*======== 0-9 数字区 ===========

  Return: 'Enter',
  Esc: 'Escape'
});

type DefaultNormalCode = typeof defaultNormalCodes[number];

type ExtendedNormalCode = keyof typeof extendedNormalCodeMap;

type MergedNormalCode = DefaultNormalCode | ExtendedNormalCode;

//#endregion  //*======== Normal Key ===========
