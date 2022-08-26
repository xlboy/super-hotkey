import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    specPattern: 'src/__test__/**/*.spec.ts',
    supportFile: false
  }
});
