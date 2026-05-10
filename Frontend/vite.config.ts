import dns from 'node:dns'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Prefer IPv4 for localhost-related resolution (fewer Chrome/Edge hangs on Windows when
// "localhost" maps to ::1 but the dev socket is IPv4-only).
dns.setDefaultResultOrder('ipv4first')

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
  // Listen on all interfaces (LAN-friendly). In Chrome/Edge, if http://localhost:5173/
  // hangs, use http://127.0.0.1:5173/ instead (IPv6/localhost mismatch on some Windows setups),
  // or run `npm run dev:ipv4`. Do not open dist/index.html via file:// — use `npm run dev` or
  // `npm run preview`. For phones on Wi‑Fi: `npm run dev:lan` then http://YOUR_PC_IP:5173/
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    cors: true,
    proxy: { ...apiDevProxy },
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: false,
    proxy: { ...apiDevProxy },
  },
  build: {
    // Broader than "esnext" so production builds run on slightly older Chromium/Edge/Safari.
    target: ['es2020', 'chrome87', 'edge88', 'firefox78', 'safari14'],
  },
})
