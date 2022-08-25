/**
 * @see {@link https://github.com/puppeteer/puppeteer/blob/main/src/common/USKeyboardLayout.ts#L297}
 *
 * @see {@link https://developer.mozilla.org/zh-CN/docs/Web/API/UI_Events/Keyboard_event_key_values}
 */

import { defineVariables } from '../types/base';

//#region  //*=========== modifier ===========

const defaultModifierKeys = ['Shift', 'Control', 'Alt', 'Meta'] as const;

export const extendedModifierKeyMap = defineVariables<
  Record<string, DefaultModifierKey | DefaultModifierKey[]>
>()({
  '⌘': 'Meta',
  Command: 'Meta',
  Cmd: 'Meta',
  Mod: ['Meta', 'Control'],
  Windows: 'Meta',
  Ctrl: 'Control',
  '⌃': 'Control',
  Option: 'Alt',
  '⌥': 'Alt',
  '⇧': 'Shift'
});

export type DefaultModifierKey = typeof defaultModifierKeys[number];

export type ExtendedModifierKey = keyof typeof extendedModifierKeyMap;

export type MergedModifierKey = DefaultModifierKey | ExtendedModifierKey;
//#endregion  //*======== modifier ===========

//#region  //*=========== normal ===========
export const defaultNormalKeys = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'Power',
  'Eject',
  'Cancel',
  'Help',
  'Backspace',
  'Tab',
  'Clear',
  'Enter',
  'Pause',
  'CapsLock',
  'Escape',
  'Convert',
  'NonConvert',
  ' ',
  'PageUp',
  'PageDown',
  'End',
  'Home',
  'ArrowLeft',
  'ArrowUp',
  'ArrowRight',
  'ArrowDown',
  'Select',
  'Execute',
  'PrintScreen',
  'Insert',
  'Delete',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
  'ContextMenu',
  '*',
  '+',
  '-',
  '/',
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
  ';',
  '=',
  ',',
  '.',
  '`',
  '[',
  '\\',
  ']',
  "'",
  'AltGraph',
  'CrSel',
  'Accept',
  'ModeChange',
  'Print',
  'Attn',
  'ExSel',
  'EraseEof',
  'Play',
  'ZoomOut',
  ')',
  '!',
  '@',
  '#',
  '$',
  '%',
  '^',
  '&',
  '(',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  ':',
  '<',
  '_',
  '>',
  '?',
  '~',
  '{',
  '|',
  '}',
  '"',
  'SoftLeft',
  'SoftRight',
  'Camera',
  'Call',
  'EndCall',
  'VolumeDown',
  'VolumeUp'
] as const;

export const extendedNormalKeyMap = defineVariables<Record<string, DefaultNormalKey>>()({
  '⇪': 'CapsLock',
  '↩︎': 'Enter',
  '←': 'ArrowLeft',
  '→': 'ArrowRight',
  '↑': 'ArrowUp',
  '↓': 'ArrowDown',
  Del: 'Delete',
  Space: ' ',
  Return: 'Enter',
  Esc: 'Escape'
});

export type ExtendedNormalKey = keyof typeof extendedNormalKeyMap;

export type DefaultNormalKey = typeof defaultNormalKeys[number];

export type MergedNormalKey = ExtendedNormalKey | DefaultNormalKey;
//#endregion  //*======== normal ===========

export type DefaultKey = DefaultNormalKey | DefaultModifierKey;
