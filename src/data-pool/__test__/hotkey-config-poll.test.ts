import type { PartialDeep } from 'type-fest';

import type { HotkeyConfig } from '../hotkey-config-poll';
import { hotkeyConfigPool } from '../hotkey-config-poll';

it('测试 clear', () => {
  const hotkeyConfig: HotkeyConfig = {
    feature: {
      type: 'callback',
      options: {
        callback() {}
      }
    },
    hotkeys: [],
    id: 'index-1'
  };

  hotkeyConfigPool.add(hotkeyConfig);

  expect(hotkeyConfigPool.size()).toBe(1);
});

describe('测试 getQualifiedHotkeyIds', () => {
  describe('通过 callback 引用来搜集合格的 hotkey-id', () => {
    const callback = () => {};

    const hotkeyConfig: PartialDeep<HotkeyConfig> = {
      feature: {
        type: 'callback',
        options: {
          callback
        }
      }
    };

    const addSuccessfulHotkeyId = hotkeyConfigPool.add(hotkeyConfig as any);

    it('正确的 callbakc 引用测试', () => {
      expect(
        hotkeyConfigPool.getQualifiedHotkeyIds({
          featureCondition: {
            type: 'callback',
            options: {
              callback
            }
          }
        })
      ).toEqual(expect.arrayContaining([addSuccessfulHotkeyId]));
    });

    it('错误的 callback 引用测试', () => {
      expect(
        hotkeyConfigPool.getQualifiedHotkeyIds({
          featureCondition: {
            type: 'callback',
            options: {
              callback() {}
            }
          }
        }).length
      ).toBe(0);
    });
  });
});
