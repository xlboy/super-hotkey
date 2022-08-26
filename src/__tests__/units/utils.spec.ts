import type {
  DefaultModifierCode,
  DefaultNormalCode
} from '../../constants/keyboard-code';
import { verifyCodeMatch } from '../../utils';

describe('verifyCodeMatch', () => {
  const fn = verifyCodeMatch;

  function defineDownCodes(
    normals: DefaultNormalCode[],
    modifiers: DefaultModifierCode[]
  ) {
    return { normals, modifiers };
  }

  function defineMatchedResult(
    ...args: [
      modifier: [perfectMatch: boolean, onlySatisfied: boolean],
      normal: [perfectMatch: boolean, onlySatisfied: boolean]
    ]
  ) {
    return {
      modifier: {
        perfectMatch: args[0][0],
        onlySatisfied: args[0][1]
      },
      normal: {
        perfectMatch: args[1][0],
        onlySatisfied: args[1][1]
      }
    };
  }

  it('仅 normal 键', () => {
    expect(
      fn(
        { normalCodes: ['+', 'o'], modifierCodes: [] },
        defineDownCodes(['NumpadAdd', 'KeyO'], [])
      )
    ).to.be.deep.equal(defineMatchedResult([true, true], [true, true]));

    expect(
      fn(
        { normalCodes: ['+', 's'], modifierCodes: [] },
        defineDownCodes(['NumpadAdd', 'KeyO'], [])
      )
    ).to.be.deep.equal(defineMatchedResult([true, true], [false, false]));

    expect(
      fn(
        { normalCodes: ['+', 's'], modifierCodes: [] },
        defineDownCodes(['NumpadAdd', 'KeyS', 'Delete'], [])
      )
    ).to.be.deep.equal(defineMatchedResult([true, true], [false, true]));

    expect(
      fn(
        { normalCodes: ['+', 's'], modifierCodes: [] },
        defineDownCodes(['NumpadAdd', 'KeyS'], ['AltLeft'])
      )
    ).to.be.deep.equal(defineMatchedResult([false, true], [true, true]));

    expect(
      fn({ normalCodes: ['s'], modifierCodes: [] }, defineDownCodes(['KeyS'], []))
    ).to.be.deep.equal(defineMatchedResult([true, true], [true, true]));

    expect(
      fn(
        { normalCodes: ['s'], modifierCodes: [] },
        defineDownCodes(['KeyS'], ['AltLeft'])
      )
    ).to.be.deep.equal(defineMatchedResult([false, true], [true, true]));
  });

  it('混合的 normal, modifier 键', () => {
    expect(
      fn(
        { normalCodes: ['*', 'o'], modifierCodes: ['Meta'] },

        defineDownCodes(
          ['Digit8', 'KeyO', 'NumpadMultiply'],
          ['ShiftLeft', 'ShiftRight', 'MetaLeft']
        )
      )
    ).to.be.deep.equal(defineMatchedResult([true, true], [true, true]));

    expect(
      fn(
        { normalCodes: ['1'], modifierCodes: ['ControlLeft'] },

        defineDownCodes(['Numpad1'], ['ControlRight'])
      )
    ).to.be.deep.equal(defineMatchedResult([false, false], [true, true]));

    expect(
      fn(
        { normalCodes: ['1'], modifierCodes: ['ControlLeft'] },

        defineDownCodes(['Numpad1'], ['ControlLeft'])
      )
    ).to.be.deep.equal(defineMatchedResult([true, true], [true, true]));

    expect(
      fn(
        { normalCodes: ['a', 'b', 'c', 'd'], modifierCodes: ['Shift', 'AltRight'] },
        defineDownCodes(
          ['KeyA', 'KeyB', 'KeyC', 'KeyD'],
          ['ShiftRight', 'ShiftLeft', 'AltRight']
        )
      )
    ).to.be.deep.equal(defineMatchedResult([true, true], [true, true]));
  });
});
