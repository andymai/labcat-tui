import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: ['lit', /^lit\//],
      output: {
        assetFileNames: (asset) =>
          asset.name && /\.css$/.test(asset.name) ? 'styles.css' : (asset.name ?? '[name]'),
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
    emptyOutDir: true,
    minify: false,
  },
});
