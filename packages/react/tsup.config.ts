import { defineConfig } from 'tsup';

export default defineConfig([
  // Main entry (core + adapters + types)
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: true,
    sourcemap: true,
    clean: true,
    outDir: 'dist',
    external: ['react', 'react-dom'],
  },
  // Server-safe entry (GCM inline script, importable depuis un RSC)
  {
    entry: ['src/server.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    outDir: 'dist/server',
    external: ['react', 'react-dom'],
  },
  // React entry (components)
  {
    entry: ['src/react/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: true,
    sourcemap: true,
    outDir: 'dist/react',
    external: ['react', 'react-dom'],
    esbuildOptions(options) {
      options.jsx = 'automatic';
    },
  },
]);
