import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['jwt-decode'],
  },
  base: './', // ensures correct asset paths on Netlify
  server: {
    proxy: {
      '/api': {
        target: 'https://shop-store-1-z2v0.onrender.com', // local dev proxy only
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
