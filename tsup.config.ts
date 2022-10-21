import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  clean: true,
  dts: {
    resolve: true
  },
  target: 'es5',
  platform: 'browser',
  sourcemap: true
});
