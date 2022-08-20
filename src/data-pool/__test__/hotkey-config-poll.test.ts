import type { HotkeyConfig } from '../hotkey-config-poll';
import { hotkeyConfigPool } from '../hotkey-config-poll';

it('测试 add、clear', () => {
  // 局部调试时，需提前清空
  hotkeyConfigPool.clear();
  const hotkeyConfig: Omit<HotkeyConfig, 'id'> = {
    feature: {
      type: 'callback',
      options: {
        callback() {}
      }
    },
    keyCombinations: []
  };

  expect(hotkeyConfigPool.size()).toBe(0);

  hotkeyConfigPool.add(hotkeyConfig);
  expect(hotkeyConfigPool.size()).toBe(1);

  hotkeyConfigPool.clear();
  expect(hotkeyConfigPool.size()).toBe(0);
});

describe('测试 utils-getSuitedHotkeyConfig', () => {
  const feature: HotkeyConfig['feature'] = {
    type: 'callback',
    options: {
      callback() {}
    }
  };

  const testHotkeyConfigs = [
    {
      feature,
      keyCombinations: [
        { type: 'common', modifierKeys: ['Cmd', 'Shift'], normalKey: '7' }
      ] as const
    },
    {
      feature,
      keyCombinations: [
        { type: 'common', modifierKeys: ['Cmd', 'Shift'], normalKey: '7' },
        { type: 'common', modifierKeys: ['Control', 'Alt'], normalKey: 'j' }
      ]
    },
    {
      feature,
      keyCombinations: [
        {
          type: 'sequence',
          sequenceGroup: [
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
      ]
    }
  ] as const;

  describe('匹配单组键（非键序列）', () => {
    it('匹配成功 - 1个', () => {
      hotkeyConfigPool.clear();
      const addSuccessfulId = hotkeyConfigPool.add(testHotkeyConfigs[0] as any);

      expect(
        hotkeyConfigPool.utils.getSuitedHotkeyConfig([
          undefined,
          {
            modifierKeys: ['Cmd', 'Shift'],
            normalKey: '7',
            timeStamp: 1
          }
        ]).common[0].id
      ).toBe(addSuccessfulId);
    });

    it('匹配成功 - 2个', () => {
      hotkeyConfigPool.clear();
      const addSuccessfulIds = [
        hotkeyConfigPool.add(testHotkeyConfigs[0] as any),
        hotkeyConfigPool.add(testHotkeyConfigs[1] as any)
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
          .common.map(_ => _.id)
      ).toEqual(expect.arrayContaining(addSuccessfulIds));
    });

    it('匹配失败', () => {
      hotkeyConfigPool.clear();
      hotkeyConfigPool.add(testHotkeyConfigs[0] as any);

      expect(
        hotkeyConfigPool.utils.getSuitedHotkeyConfig([
          undefined,
          { modifierKeys: ['Alt'], normalKey: 'S', timeStamp: 1 }
        ]).common.length
      ).toBe(0);
    });
  });

  describe('匹配两组键序列', () => {
    it('匹配成功 - 相同「修饰键」、「正常键」，间隔也在要求内', () => {
      hotkeyConfigPool.clear();
      const addSuccessfulId = hotkeyConfigPool.add(testHotkeyConfigs[2] as any);

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
        ]).sequence?.[0]?.id
      ).toBe(addSuccessfulId);
    });

    it('匹配失败 - 相同「修饰键」、「正常键」，但间隔不在要求内（多出了100ms）', () => {
      hotkeyConfigPool.clear();
      hotkeyConfigPool.add(testHotkeyConfigs[2] as any);

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
            timeStamp: 1640970061600
          }
        ]).sequence.length
      ).toBe(0);
    });

    it('匹配失败 - 不同的「修饰键」、「正常键」，但间隔在要求内', () => {
      hotkeyConfigPool.clear();
      hotkeyConfigPool.add(testHotkeyConfigs[2] as any);

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
        ]).sequence.length
      ).toBe(0);
    });
  });
});

export {};
