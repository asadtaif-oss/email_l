
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // هام جداً لملفات SCORM لكي تعمل الروابط بشكل صحيح
  css: {
    postcss: {
      // هذا يمنع فيت من البحث عن ملفات إعدادات خارجية قد تكون معطوبة في جهازك
      plugins: []
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  }
})
