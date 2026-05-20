import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const externalPackages = /^@graph-render\/(?:core|types)(?:\/.*)?$/;
const reactExternals = new Set([
  'react',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'react-dom',
  'react-dom/client',
]);

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'ReactGraphRender',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: (id) => reactExternals.has(id) || externalPackages.test(id),
    },
  },
});
