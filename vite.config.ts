import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const developmentAuthorization = `Basic ${Buffer.from(
  'agentic:development',
).toString('base64')}`

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 4317,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4318',
        ws: true,
        headers: {
          authorization: developmentAuthorization,
        },
      },
    },
  },
})
