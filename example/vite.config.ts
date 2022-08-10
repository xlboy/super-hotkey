import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      'super-hotkey': fileURLToPath(new URL('../src/index.ts', import.meta.url).href)
    }
  }
});
