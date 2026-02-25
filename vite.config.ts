import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/vgpu-advisor/',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          recharts: ['recharts'],
          i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          store: ['zustand', 'lz-string'],
        },
      },
    },
  },
})
