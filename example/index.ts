import { superHotkey } from 'super-hotkey';

superHotkey.internal.bind(
  {
    type: 'common',
    contents: [{ modifierKeys: [], normalKey: 's' }]
  },
  {
    type: 'callback',
    options: {
      callback(event) {
        console.log('hi');
      }
    }
  }
);
