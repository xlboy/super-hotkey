import type { HotkeyConfig } from '../../hotkey-config-poll';

const feature: HotkeyConfig['feature'] = {
  type: 'callback',
  options: {
    callback(event) {},
    trigger: {} as any
  }
};

// it('测试 add, clear, findById', () => {
//   // 局部调试时，需提前清空
//   hotkeyConfigPool.clear();
//   const hotkeyConfig: Omit<HotkeyConfig, 'id'> = {
//     feature,
//     keyComb: {
//       type: 'common',
//       contents: []
//     }
//   };

//   expect(hotkeyConfigPool.size()).to.equal(0);

//   const addSuccessfulId = hotkeyConfigPool.add(hotkeyConfig);

//   expect(hotkeyConfigPool.size()).to.equal(1);
//   expect(hotkeyConfigPool.findById(addSuccessfulId)).to.equal(hotkeyConfig);

//   hotkeyConfigPool.clear();
//   expect(hotkeyConfigPool.size()).to.equal(0);
// });

// describe('测试 remove', () => {
//   describe('完全移除某个 hotkey-config（即直接销毁某个 hotkeyId，以及其对应配置）', () => {
//     describe('根据传入的「键序列组 - keyCombs」进行移除', () => {
//       // 「键序列组」的「完全移除」条件为「序列键的条件 = 序列键的配置」
//       const hotkeyConfig: Omit<HotkeyConfig, 'id'> = {
//         feature,
//         keyComb: {
//           type: 'sequence',
//           contents: [
//             {
//               modifierKeys: ['Alt'],
//               normalKey: 'd',
//               interval: 100
//             },
//             {
//               modifierKeys: ['Meta', 'Control'],
//               normalKey: 's',
//               interval: 300
//             }
//           ]
//         }
//       };

//       it('移除失败，没有完全匹配的', () => {
//         hotkeyConfigPool.clear();
//         hotkeyConfigPool.add(hotkeyConfig);

//         expect(
//           hotkeyConfigPool.remove({
//             keyComb: {
//               type: 'sequence',
//               contents: [hotkeyConfig.keyComb.contents[0] as any]
//             }
//           }).shortPress.length
//         ).to.equal(0);
//       });

//       it('移除成功，完全匹配', () => {
//         hotkeyConfigPool.clear();
//         const addSuccessfulId = hotkeyConfigPool.add(hotkeyConfig);

//         expect(
//           hotkeyConfigPool.remove({
//             keyComb: {
//               type: 'sequence',
//               contents: hotkeyConfig.keyComb.contents as any
//             }
//           }).shortPress[0].id
//         ).to.equal(addSuccessfulId);
//       });
//     });

//     describe('根据传入的「特性选项 - featureOptions」进行移除', () => {
//       const hotkeyConfig: Omit<HotkeyConfig, 'id'> = {
//         feature: {
//           type: 'callback',
//           options: {
//             callback() {},
//             trigger: {} as any
//           }
//         },
//         keyComb: {
//           type: 'common',
//           contents: []
//         }
//       };

//       it('移除失败，没有找到相似的', () => {
//         hotkeyConfigPool.clear();
//         hotkeyConfigPool.add(hotkeyConfig);

//         expect(
//           hotkeyConfigPool.remove({
//             feature: {
//               type: 'domMethod'
//             }
//           }).shortPress.length
//         ).to.equal(0);
//       });

//       it('移除成功，找到了相似的', () => {
//         hotkeyConfigPool.clear();

//         const addSuccessfulHotkeyIds = [
//           hotkeyConfigPool.add(hotkeyConfig),
//           hotkeyConfigPool.add({
//             feature: {
//               type: 'domMethod',
//               options: {
//                 method: 'blur',
//                 targetElement: '',
//                 trigger: {} as any
//               }
//             },
//             keyComb: { type: 'sequence', contents: [] }
//           })
//         ];

//         expect(
//           hotkeyConfigPool.remove({
//             feature: {
//               type: 'callback'
//             }
//           }).shortPress[0].id
//         ).to.equal(addSuccessfulHotkeyIds[0]);

//         expect(
//           hotkeyConfigPool.remove({
//             feature: {
//               type: 'domMethod',
//               options: {
//                 method: 'blur'
//               }
//             }
//           }).shortPress[0].id
//         ).to.equal(addSuccessfulHotkeyIds[1]);
//       });
//     });

//     describe('根据传入的「特性选项 - keyCombs」及「键序列组 - featureOptions」进行移除', () => {
//       const hotkeyConfig: Omit<HotkeyConfig, 'id'> = {
//         feature: {
//           type: 'callback',
//           options: {
//             callback() {},
//             trigger: {} as any
//           }
//         },
//         keyComb: {
//           type: 'common',
//           contents: [
//             { type: 'longPress', codes: ['(', 'Alt', 'End'], longPressTime: 1000 },
//             { type: 'longPress', codes: ['8'], longPressTime: 300 }
//           ]
//         }
//       };

//       it('移除失败，没有找到完美匹配的', () => {
//         hotkeyConfigPool.clear();
//         hotkeyConfigPool.add(hotkeyConfig);

//         expect(
//           hotkeyConfigPool.remove({
//             feature: {
//               type: 'domMethod'
//             },
//             keyComb: {
//               type: 'common',
//               contents: [
//                 { type: 'longPress', codes: ['(', 'Alt', 'End'], longPressTime: 1000 },
//                 { type: 'longPress', codes: ['8'], longPressTime: 300 }
//               ]
//             }
//           }).longPress.length
//         ).to.equal(0);
//       });

//       it('移除成功，找到了完美匹配的', () => {
//         hotkeyConfigPool.clear();
//         const addSuccessfulId = hotkeyConfigPool.add(hotkeyConfig);

//         expect(
//           hotkeyConfigPool.remove({
//             feature: {
//               type: 'callback'
//             },
//             keyComb: {
//               type: 'common',
//               contents: [
//                 { type: 'longPress', codes: ['(', 'Alt', 'End'], longPressTime: 1000 },
//                 { type: 'longPress', codes: ['8'], longPressTime: 300 }
//               ]
//             }
//           }).longPress[0].id
//         ).to.equal(addSuccessfulId);
//       });
//     });
//   });

//   describe('仅移除内部的某个键组（并非完全移除） - 仅支持移除 common 类型的键', () => {
//     const hotkeyConfig: Omit<HotkeyConfig, 'id'> = {
//       feature,
//       keyComb: {
//         type: 'common',
//         contents: [
//           {
//             type: 'longPress',
//             codes: ['Alt', '$'],
//             longPressTime: 999
//           },
//           {
//             type: 'longPress',
//             codes: ['Alt', ')'],
//             longPressTime: 100
//           },
//           {
//             type: 'shortPress',
//             modifierCodes: ['Meta'],
//             normalCodes: 'd'
//           }
//         ]
//       }
//     };

//     it('移除长按类型的热键', () => {
//       hotkeyConfigPool.clear();
//       const addSuccessfulId = hotkeyConfigPool.add(cloneDeep(hotkeyConfig));

//       expect(
//         hotkeyConfigPool.findById(addSuccessfulId)?.keyComb.contents.length
//       ).to.equal(3);

//       hotkeyConfigPool.remove({
//         feature: { type: 'callback' },
//         keyComb: {
//           type: 'common',
//           contents: [{ type: 'longPress', keys: ['Alt', ')'] } as any]
//         }
//       });

//       expect(
//         hotkeyConfigPool.findById(addSuccessfulId)?.keyComb.contents.length
//       ).to.equal(2);

//       hotkeyConfigPool.remove({
//         feature: { type: 'callback' },
//         keyComb: {
//           type: 'common',
//           contents: [
//             { type: 'longPress', codes: ['Alt', '$'], longPressTime: 99 /* 故意输错 */ }
//           ]
//         }
//       });

//       // 没删到
//       expect(
//         hotkeyConfigPool.findById(addSuccessfulId)?.keyComb.contents.length
//       ).to.equal(2);

//       hotkeyConfigPool.remove({
//         feature: { type: 'callback' },
//         keyComb: {
//           type: 'common',
//           contents: [
//             {
//               type: 'longPress',
//               codes: ['Alt', '$'],
//               longPressTime: 999 /* 正确，一致的 */
//             }
//           ]
//         }
//       });

//       expect(
//         hotkeyConfigPool.findById(addSuccessfulId)?.keyComb.contents.length
//       ).to.equal(1);
//     });

//     it('移除短按类型的热键', () => {
//       hotkeyConfigPool.clear();
//       const addSuccessfulId = hotkeyConfigPool.add(cloneDeep(hotkeyConfig));

//       expect(
//         hotkeyConfigPool.findById(addSuccessfulId)?.keyComb.contents.length
//       ).to.equal(3);

//       hotkeyConfigPool.remove({
//         feature: { type: 'callback' },
//         keyComb: {
//           type: 'common',
//           contents: [
//             {
//               type: 'shortPress',
//               modifierKeys: ['Meta'] /* 故意输少一个 'normalKey' 属性 */
//             } as any
//           ]
//         }
//       });

//       // 没删到
//       expect(
//         hotkeyConfigPool.findById(addSuccessfulId)?.keyComb.contents.length
//       ).to.equal(3);

//       hotkeyConfigPool.remove({
//         feature: { type: 'callback' },
//         keyComb: {
//           type: 'common',
//           contents: [
//             {
//               type: 'shortPress',
//               modifierCodes: ['Meta'],
//               normalCodes: 'd'
//             }
//           ]
//         }
//       });

//       expect(
//         hotkeyConfigPool.findById(addSuccessfulId)?.keyComb.contents.length
//       ).to.equal(2);
//     });
//   });
// });
