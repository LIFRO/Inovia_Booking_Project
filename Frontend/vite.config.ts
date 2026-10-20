import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const backend = 'http://localhost:5109'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api':  { target: backend, changeOrigin: true },
      '/hubs': { target: backend, changeOrigin: true, ws: true },
      // IoT services used by the admin temperature monitor.
      '/registry': {
        target: 'http://localhost:5101',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/registry/, ''),
      },
      '/portal-api': {
        target: 'http://localhost:5104',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/portal-api/, ''),
      },
      '/telemetry': {
        target: 'http://localhost:5103',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/telemetry/, ''),
      },
    },
  },
})
