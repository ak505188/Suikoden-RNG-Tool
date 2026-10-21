import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const src = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src');

export default defineConfig({
  base: '/Suikoden-RNG-Tool/',
  plugins: [react()],
  resolve: {
    // Absolute imports from src/, e.g. 'shared/form/inputs' (see jsconfig.json)
    alias: [{ find: /^(app|features|shared)(\/|$)/, replacement: `${src}/$1$2` }]
  },
  build: {
    outDir: 'build',
    // lightningcss rejects some selectors in semantic-ui-css
    cssMinify: 'esbuild'
  },
  test: {
    environment: 'jsdom'
  }
});
