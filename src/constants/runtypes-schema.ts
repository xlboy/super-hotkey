import { Array, Literal, Record, Static, String, Undefined } from 'runtypes';

export const RuntypeSchemaModifierKeyArr = Array(
  Literal('Shift')
    .Or(Literal('Control'))
    .Or(Literal('Alt'))
    .Or(Literal('Meta'))
    .Or(Literal('⌘'))
    .Or(Literal('Command'))
    .Or(Literal('⌃'))
    .Or(Literal('Option'))
    .Or(Literal('⌥'))
    .Or(Literal('⇧'))
);

export const RuntypeSchemaMergedNormalKey = Literal('Shift')
  .Or(Literal('Control'))
  .Or(Literal('Alt'))
  .Or(Literal('Meta'))
  .Or(Literal('⌘'))
  .Or(Literal('Command'))
  .Or(Literal('⌃'))
  .Or(Literal('Option'))
  .Or(Literal('⌥'))
  .Or(Literal('⇧'));

export const RuntypeSchemaCommonKeyObj = Record({
  modifierKey: Literal('Shift')
    .Or(Literal('Control'))
    .Or(Literal('Alt'))
    .Or(Literal('Meta'))
    .Or(Literal('⌘'))
    .Or(Literal('Command'))
    .Or(Literal('⌃'))
    .Or(Literal('Option'))
    .Or(Literal('⌥'))
    .Or(Literal('⇧'))
    .Or(String.And(Record({})))
    .Or(RuntypeSchemaModifierKeyArr)
    .Or(Undefined)
    .optional(),
  normalKey: RuntypeSchemaMergedNormalKey
});

export const RuntypeSchemaCommonKey = String.Or(Array(String))
  .Or(RuntypeSchemaCommonKeyObj)
  .Or(Array(RuntypeSchemaCommonKeyObj));

// export const RuntypeSchemaKeySequence = String.Or(Array(String))
//   .Or(Array(RuntypeSchemaCommonKeyObj))
//   .Or(
//     Array(
//       RuntypeSchemaCommonKeyObj.Or(Literal('0'))
//         .Or(Literal('1'))
//         .Or(Literal('2'))
//         .Or(Literal('3'))
//         .Or(Literal('4'))
//         .Or(Literal('5'))
//         .Or(Literal('6'))
//         .Or(Literal('7'))
//         .Or(Literal('8'))
//         .Or(Literal('9'))
//         .Or(Literal('Power'))
//         .Or(Literal('Eject'))
//         .Or(Literal('Cancel'))
//         .Or(Literal('Help'))
//         .Or(Literal('Backspace'))
//         .Or(Literal('Tab'))
//         .Or(Literal('Clear'))
//         .Or(Literal('Enter'))
//         .Or(Literal('Pause'))
//         .Or(Literal('CapsLock'))
//         .Or(Literal('Escape'))
//         .Or(Literal('Convert'))
//         .Or(Literal('NonConvert'))
//         .Or(Literal(' '))
//         .Or(Literal('PageUp'))
//         .Or(Literal('PageDown'))
//         .Or(Literal('End'))
//         .Or(Literal('Home'))
//         .Or(Literal('ArrowLeft'))
//         .Or(Literal('ArrowUp'))
//         .Or(Literal('ArrowRight'))
//         .Or(Literal('ArrowDown'))
//         .Or(Literal('Select'))
//         .Or(Literal('Execute'))
//         .Or(Literal('PrintScreen'))
//         .Or(Literal('Insert'))
//         .Or(Literal('Delete'))
//         .Or(Literal('a'))
//         .Or(Literal('b'))
//         .Or(Literal('c'))
//         .Or(Literal('d'))
//         .Or(Literal('e'))
//         .Or(Literal('f'))
//         .Or(Literal('g'))
//         .Or(Literal('h'))
//         .Or(Literal('i'))
//         .Or(Literal('j'))
//         .Or(Literal('k'))
//         .Or(Literal('l'))
//         .Or(Literal('m'))
//         .Or(Literal('n'))
//         .Or(Literal('o'))
//         .Or(Literal('p'))
//         .Or(Literal('q'))
//         .Or(Literal('r'))
//         .Or(Literal('s'))
//         .Or(Literal('t'))
//         .Or(Literal('u'))
//         .Or(Literal('v'))
//         .Or(Literal('w'))
//         .Or(Literal('x'))
//         .Or(Literal('y'))
//         .Or(Literal('z'))
//         .Or(Literal('ContextMenu'))
//         .Or(Literal('*'))
//         .Or(Literal('+'))
//         .Or(Literal('-'))
//         .Or(Literal('/'))
//         .Or(Literal('F1'))
//         .Or(Literal('F2'))
//         .Or(Literal('F3'))
//         .Or(Literal('F4'))
//         .Or(Literal('F5'))
//         .Or(Literal('F6'))
//         .Or(Literal('F7'))
//         .Or(Literal('F8'))
//         .Or(Literal('F9'))
//         .Or(Literal('F10'))
//         .Or(Literal('F11'))
//         .Or(Literal('F12'))
//         .Or(Literal('F13'))
//         .Or(Literal('F14'))
//         .Or(Literal('F15'))
//         .Or(Literal('F16'))
//         .Or(Literal('F17'))
//         .Or(Literal('F18'))
//         .Or(Literal('F19'))
//         .Or(Literal('F20'))
//         .Or(Literal('F21'))
//         .Or(Literal('F22'))
//         .Or(Literal('F23'))
//         .Or(Literal('F24'))
//         .Or(Literal('NumLock'))
//         .Or(Literal('ScrollLock'))
//         .Or(Literal('AudioVolumeMute'))
//         .Or(Literal('AudioVolumeDown'))
//         .Or(Literal('AudioVolumeUp'))
//         .Or(Literal('MediaTrackNext'))
//         .Or(Literal('MediaTrackPrevious'))
//         .Or(Literal('MediaStop'))
//         .Or(Literal('MediaPlayPause'))
//         .Or(Literal(';'))
//         .Or(Literal('='))
//         .Or(Literal(','))
//         .Or(Literal('.'))
//         .Or(Literal('`'))
//         .Or(Literal('['))
//         .Or(Literal('\\'))
//         .Or(Literal(']'))
//         .Or(Literal("'"))
//         .Or(Literal('AltGraph'))
//         .Or(Literal('CrSel'))
//         .Or(Literal('Accept'))
//         .Or(Literal('ModeChange'))
//         .Or(Literal('Print'))
//         .Or(Literal('Attn'))
//         .Or(Literal('ExSel'))
//         .Or(Literal('EraseEof'))
//         .Or(Literal('Play'))
//         .Or(Literal('ZoomOut'))
//         .Or(Literal(')'))
//         .Or(Literal('!'))
//         .Or(Literal('@'))
//         .Or(Literal('#'))
//         .Or(Literal('$'))
//         .Or(Literal('%'))
//         .Or(Literal('^'))
//         .Or(Literal('&'))
//         .Or(Literal('('))
//         .Or(Literal('A'))
//         .Or(Literal('B'))
//         .Or(Literal('C'))
//         .Or(Literal('D'))
//         .Or(Literal('E'))
//         .Or(Literal('F'))
//         .Or(Literal('G'))
//         .Or(Literal('H'))
//         .Or(Literal('I'))
//         .Or(Literal('J'))
//         .Or(Literal('K'))
//         .Or(Literal('L'))
//         .Or(Literal('M'))
//         .Or(Literal('N'))
//         .Or(Literal('O'))
//         .Or(Literal('P'))
//         .Or(Literal('Q'))
//         .Or(Literal('R'))
//         .Or(Literal('S'))
//         .Or(Literal('T'))
//         .Or(Literal('U'))
//         .Or(Literal('V'))
//         .Or(Literal('W'))
//         .Or(Literal('X'))
//         .Or(Literal('Y'))
//         .Or(Literal('Z'))
//         .Or(Literal(':'))
//         .Or(Literal('<'))
//         .Or(Literal('_'))
//         .Or(Literal('>'))
//         .Or(Literal('?'))
//         .Or(Literal('~'))
//         .Or(Literal('{'))
//         .Or(Literal('|'))
//         .Or(Literal('}'))
//         .Or(Literal('"'))
//         .Or(Literal('SoftLeft'))
//         .Or(Literal('SoftRight'))
//         .Or(Literal('Camera'))
//         .Or(Literal('Call'))
//         .Or(Literal('EndCall'))
//         .Or(Literal('VolumeDown'))
//         .Or(Literal('VolumeUp'))
//         .Or(Literal('⇪'))
//         .Or(Literal('↩︎'))
//         .Or(Literal('Return'))
//         .Or(Literal('Esc'))
//     )
//   );