import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['jwt-decode'],
  },
  base: './', // ✅ ensures correct paths on Netlify
  server: {
    proxy: {
      '/api': {
        target: 'https://shop-store-1-z2v0.onrender.com', // deployed backend URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
