import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
    '/api': {
        target: process.env.services__api__https__0 || process.env.services__api__http__0 || process.env.VITE_API_URL || 'http://localhost:5110',
        changeOrigin: true,
        secure: false,
      },
      '/hubs': {
        target: process.env.services__api__https__0 || process.env.services__api__http__0 || process.env.VITE_API_URL || 'http://localhost:5110',
        changeOrigin: true,
        ws: true,
      }
    }
  },
})
