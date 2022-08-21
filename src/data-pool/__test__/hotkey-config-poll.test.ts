import type { HotkeyConfig } from '../hotkey-config-poll';
import { hotkeyConfigPool } from '../hotkey-config-poll';

const feature: HotkeyConfig['feature'] = {
  type: 'callback',
  options: {
    callback() {}
  }
};

it('测试 add、clear', () => {
  // 局部调试时，需提前清空
  hotkeyConfigPool.clear();
  const hotkeyConfig: Omit<HotkeyConfig, 'id'> = {
    feature,
    keyCombination: {
      type: 'common',
      contents: []
    }
  };

  expect(hotkeyConfigPool.size()).toBe(0);

  hotkeyConfigPool.add(hotkeyConfig);
  expect(hotkeyConfigPool.size()).toBe(1);

  hotkeyConfigPool.clear();
  expect(hotkeyConfigPool.size()).toBe(0);
});

describe('根据 指定条件 获取 合适的热键配置（utils-getSuitedHotkeyConfig）', () => {
  const testHotkeyConfigs: Omit<HotkeyConfig, 'id'>[] = [
    {
      feature,
      keyCombination: {
        type: 'common',
        contents: [{ modifierKeys: ['Cmd', 'Shift'], normalKey: '7' }]
      }
    },
    {
      feature,
      keyCombination: {
        type: 'common',
        contents: [
          { modifierKeys: ['Cmd', 'Shift'], normalKey: '7' },
          { modifierKeys: ['Control', 'Alt'], normalKey: 'j' }
        ]
      }
    },
    {
      feature,
      keyCombination: {
        type: 'sequence',
        sequences: [
          {
            modifierKeys: ['Cmd', 'Shift'],
            normalKey: '7',
            interval: 500
          },
          {
            modifierKeys: ['Alt', 'Shift'],
            normalKey: 's',
            interval: 1000
          }
        ]
      }
    }
  ];

  describe('匹配单组键（非键序列）', () => {
    it('匹配成功 - 1个', () => {
      hotkeyConfigPool.clear();
      const addSuccessfulId = hotkeyConfigPool.add(testHotkeyConfigs[0]);

      expect(
        hotkeyConfigPool.utils.getSuitedHotkeyConfig([
          undefined,
          {
            modifierKeys: ['Cmd', 'Shift'],
            normalKey: '7',
            timeStamp: 1
          }
        ]).commons[0].id
      ).toBe(addSuccessfulId);
    });

    it('匹配成功 - 2个', () => {
      hotkeyConfigPool.clear();
      const addSuccessfulIds = [
        hotkeyConfigPool.add(testHotkeyConfigs[0]),
        hotkeyConfigPool.add(testHotkeyConfigs[1])
      ];

      expect(
        hotkeyConfigPool.utils
          .getSuitedHotkeyConfig([
            undefined,
            {
              modifierKeys: ['Cmd', 'Shift'],
              normalKey: '7',
              timeStamp: 1
            }
          ])
          .commons.map(_ => _.id)
      ).toEqual(expect.arrayContaining(addSuccessfulIds));
    });

    it('匹配失败', () => {
      hotkeyConfigPool.clear();
      hotkeyConfigPool.add(testHotkeyConfigs[0]);

      expect(
        hotkeyConfigPool.utils.getSuitedHotkeyConfig([
          undefined,
          { modifierKeys: ['Alt'], normalKey: 'S', timeStamp: 1 }
        ]).commons.length
      ).toBe(0);
    });
  });

  describe('匹配两组键序列', () => {
    it('匹配成功 - 相同「修饰键」、「正常键」，间隔也在要求内', () => {
      hotkeyConfigPool.clear();
      const addSuccessfulId = hotkeyConfigPool.add(testHotkeyConfigs[2]);

      expect(
        hotkeyConfigPool.utils.getSuitedHotkeyConfig([
          {
            modifierKeys: ['Cmd', 'Shift'],
            normalKey: '7',
            timeStamp: 1640970061000
          },
          {
            modifierKeys: ['Alt', 'Shift'],
            normalKey: 's',
            timeStamp: 1640970061300
          }
        ]).sequences?.[0]?.id
      ).toBe(addSuccessfulId);
    });

    it('匹配失败 - 相同「修饰键」、「正常键」，但间隔不在要求内（多出了100ms）', () => {
      hotkeyConfigPool.clear();
      hotkeyConfigPool.add(testHotkeyConfigs[2]);

      expect(
        hotkeyConfigPool.utils.getSuitedHotkeyConfig([
          {
            modifierKeys: ['Cmd', 'Shift'],
            normalKey: '7',
            timeStamp: 1640970061000
          },
          {
            modifierKeys: ['Alt', 'Shift'],
            normalKey: 's',
            timeStamp: 1640970062100
          }
        ]).sequences.length
      ).toBe(0);
    });

    it('匹配失败 - 不同的「修饰键」、「正常键」，但间隔在要求内', () => {
      hotkeyConfigPool.clear();
      hotkeyConfigPool.add(testHotkeyConfigs[2]);

      expect(
        hotkeyConfigPool.utils.getSuitedHotkeyConfig([
          {
            modifierKeys: ['Cmd', 'Alt'],
            normalKey: '1',
            timeStamp: 1640970061000
          },
          {
            modifierKeys: ['Alt', 'Shift'],
            normalKey: 's',
            timeStamp: 1640970061200
          }
        ]).sequences.length
      ).toBe(0);
    });
  });
});

export {};
