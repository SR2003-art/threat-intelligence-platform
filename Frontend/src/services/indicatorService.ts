import { api } from './api'

export type IndicatorRow = {
  id: number
  indicatorType: string
  indicatorValue: string
  status: string
  lastSeenAt: string | null
}

function normalizeResponse(payload: unknown): IndicatorRow[] {
  if (Array.isArray(payload)) {
    return payload as IndicatorRow[]
  }
  if (payload && typeof payload === 'object' && 'content' in payload) {
    const page = payload as { content?: unknown }
    if (Array.isArray(page.content)) {
      return page.content as IndicatorRow[]
    }
  }
  return []
}

export async function getThreatIndicators(): Promise<IndicatorRow[]> {
  const response = await api.get('/threat-indicators')
  return normalizeResponse(response.data)
}
