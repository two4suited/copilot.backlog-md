import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiTarget = process.env.services__api__https__0
  || process.env.services__api__http__0
  || 'https://localhost:7133';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
      },
      '/hubs': {
        target: apiTarget,
        changeOrigin: true,
        ws: true,
      }
    }
  },
})
