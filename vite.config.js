import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      '7e7fa2209b52.ngrok-free.app',
      'localhost', // You may also want to keep 'localhost'
    ],
  }
})
