/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend API origin (no trailing slash), e.g. http://localhost:8080 or http://192.168.1.10:8080 */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
