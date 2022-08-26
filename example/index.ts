import { superHotkey } from 'super-hotkey';

superHotkey.internal.bind(
  {
    type: 'common',
    contents: [
      { type: 'shortPress', modifierCodes: [], normalCodes: ['s'] },
      {
        type: 'longPress',
        longPressTime: 2000,
        modifierCodes: ['ShiftLeft'],
        normalCodes: ['s']
      }
    ]
  },
  {
    type: 'callback',
    options: {
      callback(event) {
        console.log('嗯，触发了我');
      }
    }
  }
);
