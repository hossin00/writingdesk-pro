import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/writingdesk-pro/',
  build: { outDir: 'dist' }
})
