import { API_URL } from './constants'
import type { EmissionData, CalcPreview, Report } from '@/types'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sustain_token') : null
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Sunucu hatası' }))
    throw new Error(err.detail || 'Bir hata oluştu')
  }
  return res.json()
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ access_token: string; user: { id: string; email: string; name: string } }>(
        '/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }
      ),
    register: (data: {
      name: string
      email: string
      password: string
      company_name: string
      tax_id?: string
      sector?: string
      employee_count?: number
    }) =>
      request<{ access_token: string; user: { id: string; email: string; name: string } }>(
        '/auth/register', { method: 'POST', body: JSON.stringify(data) }
      ),
    me: () => request<{ id: string; email: string; name: string; company_id: string }>('/auth/me'),
  },

  emissions: {
    calculate: (data: Partial<EmissionData>) =>
      request<CalcPreview>('/emissions/calculate', { method: 'POST', body: JSON.stringify(data) }),
    save: (data: Partial<EmissionData>) =>
      request<{ id: string } & EmissionData>('/emissions', { method: 'POST', body: JSON.stringify(data) }),
    list: () =>
      request<EmissionData[]>('/emissions'),
    get: (id: string) => request<EmissionData>(`/emissions/${id}`),
  },

  reports: {
    generate: (payload: { emission_id: string; standard: string; language?: string; assurance_firm?: string }) =>
      request<{ id: string; status: string }>(
        '/reports/generate', { method: 'POST', body: JSON.stringify(payload) }
      ),
    get: (id: string) => request<Report>(`/reports/${id}`),
    list: () => request<Report[]>('/reports'),
    status: (reportId: string) => request<Report>(`/reports/${reportId}/status`),
  },

  companies: {
    get: (id: string) => request<{ id: string; name: string; sector: string }>(`/companies/${id}`),
    update: (id: string, data: Partial<{ sector: string; employee_count: number }>) =>
      request(`/companies/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },

  satellite: {
    getRisk: (lat: number, lng: number) =>
      request<{ earthquake_zone: string; flood_risk: string; drought_risk: string }>(
        `/satellite/risk?lat=${lat}&lng=${lng}`
      ),
  },

  subsidies: {
    calculate: (companyId?: string) =>
      request<{ subsidies: Array<{ program: string; is_eligible: boolean; annual_potential_tl: number }> }>(
        companyId ? `/subsidies/${companyId}` : '/subsidies'
      ),
  },
}
