import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    specPattern: 'src/__tests__/**/*.spec.ts',
    supportFile: false
  }
});
