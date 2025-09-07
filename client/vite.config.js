import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['jwt-decode'],
  },
  base: '/', // MUST be '/' for Netlify deployment
  server: {
    proxy: {
      '/api': {
        target: 'https://shop-store-1-z2v0.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
