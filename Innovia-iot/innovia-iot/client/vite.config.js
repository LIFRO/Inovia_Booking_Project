import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/registry': { target: 'http://localhost:5101', changeOrigin: true, rewrite: path => path.replace(/^\/registry/, '') },
      '/portal-api': { target: 'http://localhost:5104', changeOrigin: true, rewrite: path => path.replace(/^\/portal-api/, '') },
      '/telemetry': { target: 'http://localhost:5103', ws: true, changeOrigin: true, rewrite: path => path.replace(/^\/telemetry/, '') }
    }
  }
})
