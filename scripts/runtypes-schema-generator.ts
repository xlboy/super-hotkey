import { Generator } from '@runtyping/runtypes';
import { resolve } from 'node:path';

const generator = new Generator({
  targetFile: resolve(__dirname, '../src/constants/runtypes-schema.ts'),
  runtypeFormat: 'RuntypesSchema{type}'
});

generator
  .generate([
    {
      file: resolve(__dirname, '../src/types/hotkey.ts'),
      type: ['CommonKey', 'KeySequence'],
      exportStaticType: false
    }
  ])
  .then(file => file.save());
