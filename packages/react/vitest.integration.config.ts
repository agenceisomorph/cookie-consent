import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    root: path.resolve(__dirname),
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.integration.test.ts', 'src/**/*.integration.test.tsx'],
  },
  resolve: {
    alias: {
      '@shared': '../../shared',
    },
  },
});
