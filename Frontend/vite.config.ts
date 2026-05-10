import dns from 'node:dns'
import os from 'node:os'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// Prefer IPv4 for localhost-related resolution (fewer Chrome/Edge hangs on Windows when
// "localhost" maps to ::1 but the dev socket is IPv4-only).
dns.setDefaultResultOrder('ipv4first')

/** npm sets this for the script name, e.g. `dev` vs `dev:lan` (see package.json scripts). */
function npmLifecycle(): string {
  return process.env.npm_lifecycle_event ?? ''
}

/** Same Wi‑Fi / all interfaces — use `npm run dev:lan` or `npm run dev:phone`. */
function bindAllNetworkInterfaces(): boolean {
  const ev = npmLifecycle()
  return ev === 'dev:lan' || ev === 'dev:phone' || ev === 'preview:lan'
}

/** Pick this machine’s LAN IPv4 for Vite HMR when using dev:lan (phones). */
function getPreferredLanIPv4(): string {
  const nets = os.networkInterfaces()
  const scored: { ip: string; score: number }[] = []
  for (const infos of Object.values(nets)) {
    if (!infos) continue
    for (const net of infos) {
      if (net.family !== 'IPv4' || net.internal) continue
      const ip = net.address
      let score = 0
      if (ip.startsWith('192.168.')) score = 4
      else if (ip.startsWith('10.')) score = 3
      else if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) score = 3
      else score = 1
      scored.push({ ip, score })
    }
  }
  scored.sort((a, b) => b.score - a.score)
  return scored[0]?.ip ?? ''
}

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
  const devLanIpManual = env.DEV_LAN_IP?.trim() || process.env.DEV_LAN_IP?.trim() || ''
  const disableHmr =
    env.DEV_DISABLE_HMR === 'true' || env.VITE_DISABLE_HMR === 'true'
  const lan = bindAllNetworkInterfaces()
  const lanHmrHost = devLanIpManual || getPreferredLanIPv4()

  let hmr: false | { host: string; port: number; protocol: 'ws' } | undefined
  if (disableHmr) {
    hmr = false
  } else if (lan && lanHmrHost) {
    hmr = { host: lanHmrHost, port: 5173, protocol: 'ws' }
  } else if (lan && !lanHmrHost) {
    hmr = false
  } else {
    hmr = undefined
  }

  const devHost = lan ? '0.0.0.0' : '127.0.0.1'
  const previewHost = npmLifecycle() === 'preview:lan' ? '0.0.0.0' : '127.0.0.1'

  return {
    plugins: [react(), tailwindcss()],
    // `npm run dev` → 127.0.0.1 only — open http://127.0.0.1:5173 on this PC.
    // `npm run dev:lan` → 0.0.0.0 — phone uses http://<PC IPv4>:5173 (same Wi‑Fi).
    server: {
      host: devHost,
      port: 5173,
      strictPort: false,
      cors: true,
      proxy: { ...apiDevProxy },
      ...(hmr !== undefined ? { hmr } : {}),
    },
    preview: {
      host: previewHost,
      port: 4173,
      strictPort: false,
      proxy: { ...apiDevProxy },
    },
    build: {
      target: ['es2020', 'chrome87', 'edge88', 'firefox78', 'safari14'],
    },
  }
})
