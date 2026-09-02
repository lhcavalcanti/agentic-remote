import { defineConfig } from 'vite'

// The settings window is the only locally served page; the hub window loads the
// hub's own UI over HTTPS.
export default defineConfig({
  clearScreen: false,
  server: {
    host: '127.0.0.1',
    port: 1421,
    strictPort: true,
  },
  build: {
    target: 'es2022',
    emptyOutDir: true,
  },
})
