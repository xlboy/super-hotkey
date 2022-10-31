# super-hotkey

super-hotkey 是一个 JavaScript 热键库

### 特性

- 使用 **TypeScript** 开发，提供了尽可能完美的类型支持

- 支持 **多个热键**（不论修饰键/普通键） 同时绑定（例：ctrl+c+e），不再以传统的单个普通键为限（例：ctrl+c）

- 支持 **长按**（按住不放到某个时间点触发）

### 快速开始

#### 1. 安装

```bash
npm install super-hotkey
```

#### 2. 使用

```js
import superHotkey from 'super-hotkey';

superHotkey(['Shift', 's'], {
  type: 'callback',
  options: {
    callback: () => {
      console.log('Shift + s');
    }
  }
});

// 紧接着，在页面上摁下 `Shift` 与 `s`，就会在控制台打印出 'Shift + s'
```

### API

...待补充
