import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    cssMinify: 'esbuild',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three')) return 'vendor-three';
            if (id.includes('gsap')) return 'vendor-gsap';
            if (id.includes('lenis')) return 'vendor-lenis';
            if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('/react/')) return 'vendor-react';
            return 'vendor-libs';
          }
        },
      },
    },
  },
});
