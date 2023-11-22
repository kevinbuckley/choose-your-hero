import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Setup any necessary aliases
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: '../docs/' // Set your desired output directory
  }
  // You can include additional Vite specific configurations here
});