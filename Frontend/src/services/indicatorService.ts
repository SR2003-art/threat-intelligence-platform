import { api } from './api'

export type IndicatorRow = {
  id: number
  indicatorType: string
  indicatorValue: string
  confidence: number | null
  severity: string
  status: string
  sourceName: string | null
  sourceReference: string | null
  description: string | null
  lastSeenAt: string | null
}

export type IndicatorPayload = {
  indicatorType: string
  indicatorValue: string
  confidence: number | null
  severity: string
  status: string
  sourceName: string
  sourceReference: string
  description: string
}

export type PagedIndicatorResponse = {
  content: IndicatorRow[]
  totalElements: number
  page: number
  size: number
  totalPages: number
}

export type IndicatorStats = {
  totalIndicators: number
  activeIndicators: number
  highSeverityIndicators: number
  averageConfidence: number
  severityBreakdown: { severity: string; count: number }[]
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

export async function getThreatIndicatorsPaged(
  page: number,
  size: number,
  filters?: {
    q?: string
    status?: string
    fromDate?: string
    toDate?: string
  },
): Promise<PagedIndicatorResponse> {
  const response = await api.get<PagedIndicatorResponse>('/threat-indicators/all', {
    params: {
      page,
      size,
      q: filters?.q || undefined,
      status: filters?.status || undefined,
      fromDate: filters?.fromDate || undefined,
      toDate: filters?.toDate || undefined,
    },
  })
  const data = response.data
  return {
    ...data,
    content: normalizeResponse(data.content),
    totalElements: data.totalElements ?? 0,
    page: data.page ?? page,
    size: data.size ?? size,
    totalPages: data.totalPages ?? 0,
  }
}

export async function searchThreatIndicators(query: string): Promise<IndicatorRow[]> {
  const response = await api.get('/threat-indicators/search', {
    params: { q: query },
  })
  return normalizeResponse(response.data)
}

export async function createThreatIndicator(
  payload: IndicatorPayload,
): Promise<IndicatorRow> {
  const response = await api.post<IndicatorRow>('/threat-indicators', payload)
  return response.data
}

export async function updateThreatIndicator(
  id: number,
  payload: IndicatorPayload,
): Promise<IndicatorRow> {
  const response = await api.put<IndicatorRow>(`/threat-indicators/${id}`, payload)
  return response.data
}

export async function deleteThreatIndicator(id: number): Promise<void> {
  await api.delete(`/threat-indicators/${id}`)
}

export async function getThreatIndicatorById(id: number): Promise<IndicatorRow> {
  const response = await api.get<IndicatorRow>(`/threat-indicators/${id}`)
  return response.data
}

export async function getIndicatorStats(): Promise<IndicatorStats> {
  const response = await api.get<IndicatorStats>('/threat-indicators/stats')
  return response.data
}
