import axios from 'axios'

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '')
}

const raw = import.meta.env.VITE_API_BASE_URL?.trim()
const baseURL = raw ? normalizeBaseUrl(raw) : ''

export const api = axios.create({
  baseURL: baseURL || undefined,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30_000,
})

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

const storedToken = localStorage.getItem('auth_token')
if (storedToken) {
  setAuthToken(storedToken)
}
