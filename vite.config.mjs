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
    alias: [{ find: /^(app|features|shared|test)(\/|$)/, replacement: `${src}/$1$2` }],
  },
  build: {
    outDir: 'build',
    // lightningcss rejects some selectors in semantic-ui-css
    cssMinify: 'esbuild',
    rolldownOptions: {
      output: {
        // Name the big shared chunks after what is in them
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'suikoden-rng-lib', test: /suikoden-rng-lib/i },
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    // react-virtualized 10 imports 'dom-helpers/scrollbarSize' as a directory, which Node's ES
    // module loader refuses; Vite's own resolution accepts it
    server: { deps: { inline: ['react-virtualized'] } },
  },
});
