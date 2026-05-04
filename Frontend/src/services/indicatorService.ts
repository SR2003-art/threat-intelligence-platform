import { api } from './api'

export type IndicatorRow = {
  id: number
  indicatorType: string
  value: string
  confidence: number | null
  severity: string
  status: string
  source: string
  sourceReference: string | null
  title: string | null
  description: string | null
  lastObserved: string | null
}

export type IndicatorPayload = {
  indicatorType: string
  value: string
  confidence: number | null
  severity: string
  status: string
  source: string
  sourceReference: string
  title: string
  description: string
}

export async function getThreatIndicators(): Promise<IndicatorRow[]> {
  const response = await api.get<IndicatorRow[]>('/api/threat-indicators')
  return response.data
}

export async function searchThreatIndicators(query: string): Promise<IndicatorRow[]> {
  const response = await api.get<IndicatorRow[]>('/api/threat-indicators/search', {
    params: { q: query },
  })
  return response.data
}

export async function createThreatIndicator(
  payload: IndicatorPayload,
): Promise<IndicatorRow> {
  const response = await api.post<IndicatorRow>('/api/threat-indicators', payload)
  return response.data
}

export async function updateThreatIndicator(
  id: number,
  payload: IndicatorPayload,
): Promise<IndicatorRow> {
  const response = await api.put<IndicatorRow>(`/api/threat-indicators/${id}`, payload)
  return response.data
}

export async function deleteThreatIndicator(id: number): Promise<void> {
  await api.delete(`/api/threat-indicators/${id}`)
}
