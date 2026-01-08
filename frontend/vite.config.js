import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Seamlessly integrates Tailwind CSS v4
  ],
  build: {
    // Suppresses the warning for large files by raising the threshold to 1000kB
    chunkSizeWarningLimit: 1000, 
    rollupOptions: {
      output: {
        // Optimizes performance by splitting node_modules into smaller, separate files
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    },
  },
})