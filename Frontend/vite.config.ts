import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/** JVM backend reachable from Node on this PC (proxied in dev — phones only need HTTP to Vite). */
const backendOrigin =
  process.env.VITE_BACKEND_PROXY_TARGET?.trim() || 'http://127.0.0.1:8080'

const apiDevProxy = {
  '/threat-indicators': { target: backendOrigin, changeOrigin: true },
  '/ai': { target: backendOrigin, changeOrigin: true },
} as const

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Listen on all interfaces so phones on the same Wi‑Fi can open http://YOUR_PC_IP:5173/
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    cors: true,
    proxy: { ...apiDevProxy },
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
    proxy: { ...apiDevProxy },
  },
})
