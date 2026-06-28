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
    exportUrl: (reportId: string) => `${API_URL}/reports/${reportId}/export`,
    exportDocxUrl: (reportId: string) => `${API_URL}/reports/${reportId}/export/docx`,
  },

  dashboard: {
    summary: () => request<{
      reporting_year: number
      emissions: { scope1: number; scope2: number; scope3: number; total: number; unit: string }
      energy: { electricity_kwh: number; renewable_pct: number }
      reports: { total: number; approved: number; recent: Report[] }
      compliance: { score: number | null; grade: string | null }
    }>('/dashboard/summary'),
  },

  templates: {
    list: () => request<{ templates: Array<{ id: string; name: string; standard: string; language: string; description: string }> }>('/templates'),
    get: (id: string) => request<{ id: string; name: string; required_sections: string[]; prompt_suffix: string }>(`/templates/${id}`),
  },

  benchmark: {
    calculate: (data: {
      sector: string; total_co2e: number; employee_count: number;
      electricity_kwh?: number; renewable_pct?: number; waste_recycling_pct?: number
    }) => request<{
      grade: string; overall_score: number; carbon_intensity: number;
      carbon_intensity_avg: number; sector_rank: string; recommendations: string[]
    }>('/benchmarks/calculate', { method: 'POST', body: JSON.stringify(data) }),
    eea: () => request<{ indicators: Record<string, { name: string; value: number; unit: string; trend: number; year: number }> }>('/benchmarks/eea-indicators'),
    radar: (companyId: string, sector = 'bankacılık') =>
      request<{ axes: string[]; company: number[]; sector_avg: number[]; global_avg: number[] }>(
        `/benchmarks/radar/${companyId}?sector=${encodeURIComponent(sector)}`
      ),
  },

  cbam: {
    calculate: (data: { sector: string; goods_tons: number; eu_ets_price?: number }) =>
      request<{ cbam_duty_eur: number; embedded_co2_total: number; eu_ets_price: number }>(
        '/cbam/calculate', { method: 'POST', body: JSON.stringify(data) }
      ),
  },

  audit: {
    logs: (params?: { entity_type?: string; status?: string }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString()
      return request<{ total: number; logs: unknown[] }>(`/audit/logs${q ? '?' + q : ''}`)
    },
    exportUrl: () => `${API_URL}/audit/logs/export`,
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
    getByCoords: (lat: number, lng: number, city = 'istanbul', year = 2024) =>
      request<unknown>(`/satellite/risk?lat=${lat}&lng=${lng}&city=${city}&year=${year}`),
    getByCompany: (companyId: string) =>
      request<unknown>(`/satellite/risk/${companyId}`),
  },

  materiality: {
    topics: () => request<{ topics: unknown[] }>('/materiality/topics'),
    assess: (data: { sector?: string; custom_scores?: Record<string, { impact: number; financial: number }> }) =>
      request<unknown>('/materiality/assess', { method: 'POST', body: JSON.stringify(data) }),
    myMatrix: () => request<unknown>('/materiality/my/matrix'),
    matrix: (companyId: string) => request<unknown>(`/materiality/${companyId}/matrix`),
  },

  creditScore: {
    get: (companyId: string) => request<unknown>(`/credit-score/${companyId}`),
    demo: () => request<unknown>('/credit-score/demo/preview'),
  },

  targets: {
    fromReport: (reportId: string) => request<unknown>(`/reports/${reportId}/targets`),
  },

  subsidies: {
    calculate: (companyId?: string) =>
      request<{ subsidies: Array<{ program: string; is_eligible: boolean; annual_potential_tl: number }> }>(
        companyId ? `/subsidies/${companyId}` : '/subsidies'
      ),
  },

  payments: {
    plans: () =>
      request<{ plans: unknown[] }>('/payments/plans'),
    plan: (planId: string) =>
      request<unknown>(`/payments/plans/${planId}`),
    createCheckout: (data: { plan_id: string; billing: string; success_url?: string; cancel_url?: string }) =>
      request<{ checkout_url: string; session_id: string }>(
        '/payments/create-checkout-session', { method: 'POST', body: JSON.stringify(data) }
      ),
    subscription: () =>
      request<{ plan: unknown; stripe_customer_id: string | null; stripe_subscription_id: string | null }>(
        '/payments/subscription'
      ),
    portal: () =>
      request<{ portal_url: string }>('/payments/portal', { method: 'POST' }),
  },

  macc: {
    calculate: (data: {
      company_id: string
      sector: string
      total_emissions?: number
      sbti_gap_2030?: number
      budget_limit_tl?: number
    }) => request<unknown>('/macc/calculate', { method: 'POST', body: JSON.stringify(data) }),
    demo: (sector: string) => request<unknown>(`/macc/demo/${sector}`),
  },

  university: {
    ranking: () => request<unknown>('/university/ranking'),
    calculate: (data: {
      ev_fleet_percentage: number
      renewable_energy_percentage: number
      recycling_rate?: number
      water_recycling_pct?: number
    }) => request<unknown>('/university/calculate', { method: 'POST', body: JSON.stringify(data) }),
    demo: () => request<unknown>('/university/demo'),
  },

  library: {
    papers: () => request<unknown>('/library/papers'),
    papersPublic: () => request<unknown>('/library/papers/public'),
    recommend: (topic: string) => request<unknown>(`/library/recommend?topic=${encodeURIComponent(topic)}`),
  },
}
