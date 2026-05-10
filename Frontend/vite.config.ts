import dns from 'node:dns'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

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
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Set to your PC Wi‑Fi IPv4 (from `ipconfig`) so Vite HMR WebSocket works when you open
  // the app from a phone at http://YOUR_IP:5173 — otherwise the phone may load a blank page.
  const devLanIp =
    env.DEV_LAN_IP?.trim() || process.env.DEV_LAN_IP?.trim() || ''

  return {
    plugins: [react(), tailwindcss()],
    // 0.0.0.0 = listen on all network interfaces so phones on the same Wi‑Fi can connect.
    // On your PC use http://127.0.0.1:5173/ ; on your phone use http://<PC IPv4>:5173/
    // (never use localhost/127.0.0.1 on the phone — that refers to the phone itself).
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: false,
      cors: true,
      proxy: { ...apiDevProxy },
      ...(devLanIp
        ? {
            hmr: {
              host: devLanIp,
              port: 5173,
              protocol: 'ws' as const,
            },
          }
        : {}),
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
      strictPort: false,
      proxy: { ...apiDevProxy },
    },
    build: {
      // Broader than "esnext" so production builds run on slightly older Chromium/Edge/Safari.
      target: ['es2020', 'chrome87', 'edge88', 'firefox78', 'safari14'],
    },
  }
})
