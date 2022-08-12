import superHotkey, {
  type KeyboardRecord,
  AddKeyboardRecord,
  KeydownEvent
} from 'super-hotkey';

const subscribe = document.querySelector('#subscribe');
const unsubscribe = document.querySelector('#unsubscribe');

function addKeyboardRecord(data: KeyboardRecord) {
  console.log('添加了一个新的按键记录', data);
}

subscribe.addEventListener('click', () => {
  superHotkey.subscribe(AddKeyboardRecord, addKeyboardRecord);
});

unsubscribe.addEventListener('click', () => {
  superHotkey.unsubscribe(AddKeyboardRecord, addKeyboardRecord);
});

superHotkey.subscribe(KeydownEvent, v => {
  console.log('有一个键盘被按下了', v.key);
});
