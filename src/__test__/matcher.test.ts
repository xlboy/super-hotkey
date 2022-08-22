import type { HotkeyConfig } from '../data-pool/hotkey-config-poll';
import { hotkeyConfigPool } from '../data-pool/hotkey-config-poll';
import type { KeyCombination } from '../matcher';
import { matcher } from '../matcher';

const feature: HotkeyConfig['feature'] = {
  type: 'callback',
  options: {
    callback() {}
  }
};

describe('单按（非长按）的键序列匹配 - 核心函数 sequenceHandler 测试', () => {
  const testHotkeyConfigs: Omit<HotkeyConfig, 'id'>[] = [
    {
      feature,
      keyCombination: {
        type: 'sequence',
        sequences: [
          { modifierKeys: [], normalKey: '9', interval: 0 },
          { modifierKeys: [], normalKey: '1', interval: 200 },
          { modifierKeys: [], normalKey: '4', interval: 400 },
          { modifierKeys: [], normalKey: '4', interval: 600 },
          { modifierKeys: [], normalKey: '5', interval: 800 },
          { modifierKeys: [], normalKey: '6', interval: 1000 }
        ]
      }
    },
    {
      feature,
      keyCombination: {
        type: 'sequence',
        sequences: [
          { modifierKeys: [], normalKey: '1', interval: 0 },
          { modifierKeys: [], normalKey: '4', interval: 10 },
          { modifierKeys: [], normalKey: '4', interval: 100 },
          { modifierKeys: [], normalKey: '5', interval: 50 },
          { modifierKeys: [], normalKey: '8', interval: 30 }
        ]
      }
    },
    {
      feature,
      keyCombination: {
        type: 'sequence',
        sequences: [
          { modifierKeys: [], normalKey: '1', interval: 0 },
          { modifierKeys: [], normalKey: '4', interval: 200 },
          { modifierKeys: [], normalKey: '4', interval: 50 },
          { modifierKeys: [], normalKey: '5', interval: 200 }
        ]
      }
    }
  ];

  it('完美匹配成功', () => {
    hotkeyConfigPool.clear();

    const addSuccessfulIds = testHotkeyConfigs.map(config =>
      hotkeyConfigPool.add(config)
    );

    const targetElKeyCombs: KeyCombination[] = [
      { modifierKeys: [], normalKey: '1', timeStamp: 0 },
      { modifierKeys: [], normalKey: '4', timeStamp: 150 },
      { modifierKeys: [], normalKey: '4', timeStamp: 199 },
      { modifierKeys: [], normalKey: '5', timeStamp: 330 }
    ];

    const { similarSequences } = hotkeyConfigPool.utils.getSuitedHotkeyConfig([
      targetElKeyCombs.at(-2),
      targetElKeyCombs.at(-1)!
    ]);

    const matchedSequence = matcher.sequenceMatcher(targetElKeyCombs, similarSequences);

    expect(matchedSequence.usefulStartIndex).toBe(0);
    expect(matchedSequence.perfectlyMatchedConfigs.length).toBe(1);

    expect(matchedSequence.perfectlyMatchedConfigs[0].id).toBe(addSuccessfulIds[2]);
  });

  it('最小的开始索引', () => {
    hotkeyConfigPool.clear();
    testHotkeyConfigs.map(config => hotkeyConfigPool.add(config));

    const targetElKeyCombs: KeyCombination[] = [
      { modifierKeys: [], normalKey: '%', timeStamp: 0 },
      { modifierKeys: [], normalKey: ':', timeStamp: 100 },
      { modifierKeys: [], normalKey: '1', timeStamp: 200 },
      { modifierKeys: [], normalKey: '4', timeStamp: 230 },
      { modifierKeys: [], normalKey: '4', timeStamp: 240 },
      { modifierKeys: [], normalKey: '5', timeStamp: 300 }
    ];

    const { similarSequences } = hotkeyConfigPool.utils.getSuitedHotkeyConfig([
      targetElKeyCombs.at(-2),
      targetElKeyCombs.at(-1)!
    ]);

    const matchedSequence = matcher.sequenceMatcher(targetElKeyCombs, similarSequences);

    expect(matchedSequence.usefulStartIndex).toBe(2);
    expect(matchedSequence.perfectlyMatchedConfigs.length).toBe(0);
  });
});
