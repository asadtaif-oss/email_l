import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // هام جداً لملفات SCORM لكي تعمل الروابط بشكل صحيح داخل المجلد المضغوط
})