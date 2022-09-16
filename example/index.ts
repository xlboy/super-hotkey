import { superHotkey } from 'super-hotkey';

superHotkey.bindDOMMethod('s', {
  method: 'click',
  targetElement: '#btn'
});

document.getElementById('btn')!.addEventListener('click', () => {
  console.log('btn-click --- s');
});

superHotkey.bindCallback(
  {
    normalKey: ['0'],
    modifierKey: ['Mod']
  },
  {
    callback(event) {
      console.log('mod-0');
    },
    trigger: {
      allowRepeatWhenLongPress: true,
      throttleDelay: 1000,
      mode: 'keyup'
    }
  }
);

superHotkey(
  {
    normalKey: ['s'],
    modifierKey: ['Mod']
  },
  {
    type: 'callback',
    options: {
      callback(event) {
        console.log('mod-s');
      }
    }
  }
);

superHotkey.bindCallback(
  {
    normalKey: ['0'],
    modifierKey: ['Shift']
  },
  {
    callback(event) {
      console.log('Shift-0');
    },
    trigger: {
      allowRepeatWhenLongPress: false
    }
  }
);

superHotkey.bindCallback(
  {
    normalKey: ['9'],
    modifierKey: ['Shift']
  },
  {
    callback(event) {
      console.log('Shift-9');
    },
    trigger: {
      allowRepeatWhenLongPress: true,
      throttleDelay: 300
    }
  }
);
