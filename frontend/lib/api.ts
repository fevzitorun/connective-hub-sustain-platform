import { API_URL } from './constants'
import type { EmissionData, CalcPreview, Report, UserProfile } from '@/types'

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
  if (res.status === 204) return undefined as T
  return res.json()
}

async function requestForm<T>(path: string, form: FormData): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sustain_token') : null
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: form,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Sunucu hatası' }))
    throw new Error(err.detail || 'Bir hata oluştu')
  }
  return res.json()
}

async function requestBlob(path: string): Promise<Blob> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sustain_token') : null
  const res = await fetch(`${API_URL}${path}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Sunucu hatası' }))
    throw new Error(err.detail || 'İndirme başarısız')
  }
  return res.blob()
}

export type BulkUploadResult = {
  processed: number
  success: number
  errors: Array<{ row: number; message: string }>
  saved_ids: string[]
}

export type ReportVersion = {
  id: string
  version_number: number
  status: string
  compliance_score?: number
  compliance_grade?: string
  ai_model?: string
  created_at: string
}

export type ReportDraft = {
  id: string
  standard: string
  language: string
  assurance_firm?: string
  form_data?: Record<string, unknown>
  updated_at: string
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
    me: () => request<{ id: string; email: string; name: string; company_id: string; role: string }>('/auth/me'),
  },

  emissions: {
    calculate: (data: Partial<EmissionData>) =>
      request<CalcPreview>('/emissions/calculate', { method: 'POST', body: JSON.stringify(data) }),
    save: (data: Partial<EmissionData>) =>
      request<{ id: string } & EmissionData>('/emissions', { method: 'POST', body: JSON.stringify(data) }),
    list: () =>
      request<EmissionData[]>('/emissions'),
    get: (id: string) => request<EmissionData>(`/emissions/${id}`),
    bulkUpload: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return requestForm<BulkUploadResult>('/emissions/bulk-upload', form)
    },
  },

  reports: {
    generate: (payload: { emission_id: string; standard: string; language?: string; assurance_firm?: string }) =>
      request<{ id: string; status: string; version_number: number }>(
        '/reports/generate', { method: 'POST', body: JSON.stringify(payload) }
      ),
    get: (id: string) => request<Report>(`/reports/${id}`),
    list: () => request<Report[]>('/reports'),
    status: (reportId: string) => request<Report>(`/reports/${reportId}/status`),
    versions: (reportId: string) => request<ReportVersion[]>(`/reports/${reportId}/versions`),
    pending: () => request<Report[]>('/reports/pending'),
    submit: (reportId: string) =>
      request<{ id: string; status: string; submitted_at: string }>(`/reports/${reportId}/submit`, { method: 'POST' }),
    approve: (reportId: string) =>
      request<{ id: string; status: string; approved_at: string }>(`/reports/${reportId}/approve`, { method: 'POST' }),
    reject: (reportId: string, reason?: string) =>
      request<{ id: string; status: string; rejection_reason?: string }>(
        `/reports/${reportId}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }
      ),
    saveDraft: (data: { standard?: string; language?: string; assurance_firm?: string; form_data?: Record<string, unknown> }) =>
      request<{ id: string; updated_at: string }>('/reports/drafts', { method: 'POST', body: JSON.stringify(data) }),
    getDraft: () => request<ReportDraft>('/reports/drafts/latest'),
    clearDraft: () => request<void>('/reports/drafts', { method: 'DELETE' }),
  },

  templates: {
    downloadEmissions: () => requestBlob('/templates/emissions'),
  },

  users: {
    list: () => request<UserProfile[]>('/users'),
    invite: (data: { email: string; name: string; role: string }) =>
      request<{ id: string; email: string; name: string; role: string; role_label: string; temp_password: string }>(
        '/users/invite', { method: 'POST', body: JSON.stringify(data) }
      ),
    updateRole: (userId: string, role: string) =>
      request<{ id: string; role: string; role_label: string }>(
        `/users/${userId}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }
      ),
    remove: (userId: string) => request<void>(`/users/${userId}`, { method: 'DELETE' }),
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
