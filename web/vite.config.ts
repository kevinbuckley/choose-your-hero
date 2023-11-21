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
    // Additional build options if needed
  },
  // You can include additional Vite specific configurations here
});