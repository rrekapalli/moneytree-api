import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  server: {
    allowedHosts: ['pdev.tailce422e.ts.net'],
  },
  build: {
    rollupOptions: {
      output: {
        // Simple single bundle approach
        manualChunks: () => 'main',
        entryFileNames: 'main.js',
        chunkFileNames: 'main.js',
        assetFileNames: 'assets/[name][extname]'
      },
    },
    minify: true,
    sourcemap: false,
    target: 'es2020',
  },
  plugins: [
    angular()
  ]
});
