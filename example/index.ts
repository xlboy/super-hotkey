import type { KeyboardRecord } from 'super-hotkey';
import superHotkey, { AddKeyboardRecord } from 'super-hotkey';

const subscribe = document.querySelector('#subscribe');
const unsubscribe = document.querySelector('#unsubscribe');

let isBind = false;

function addKeyboardRecord(data: KeyboardRecord) {
  console.log('添加了一个新的按键记录', data);
}

subscribe.addEventListener('click', () => {
  if (!isBind) {
    superHotkey.subscribe(AddKeyboardRecord, addKeyboardRecord);
    isBind = true;
  }
});

unsubscribe.addEventListener('click', () => {
  if (isBind) {
    superHotkey.unsubscribe(AddKeyboardRecord, addKeyboardRecord);
    isBind = false;
  }
});
