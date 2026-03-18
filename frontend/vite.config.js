import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Warn when any chunk exceeds 800 kB (down from Vite's 500 kB default shown in build output)
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Split large third-party deps into their own chunk so the main bundle
        // doesn't balloon on every deploy — browser can cache exceljs separately.
        manualChunks: {
          vendor: ['react', 'react-dom'],
          exceljs: ['exceljs'],
        },
      },
    },
  },
});
