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
    me: () => request<{ id: string; email: string; name: string; company_id: string; role: string }>('/auth/me'),
    forgotPassword: (email: string) =>
      request<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  },

  emissions: {
    calculate: (data: Partial<EmissionData>) =>
      request<CalcPreview>('/emissions/calculate', { method: 'POST', body: JSON.stringify(data) }),
    save: (data: Partial<EmissionData>) =>
      request<{ id: string } & EmissionData>('/emissions', { method: 'POST', body: JSON.stringify(data) }),
    saveScope3: (data: { year: number; breakdown: Record<string, number>; activity_metric?: Record<string, number> }) =>
      request<{ success: boolean; scope3_co2e: number }>('/emissions/scope3', { method: 'POST', body: JSON.stringify(data) }),
    list: () =>
      request<EmissionData[]>('/emissions'),
    get: (id: string) => request<EmissionData>(`/emissions/${id}`),
  },

  iso14064: {
    calculate: (data: Partial<EmissionData>) =>
      request<{ status: string; iso14064_result: any }>('/iso14064/calculate', { method: 'POST', body: JSON.stringify(data) }),
    report: (year: number) => 
      request<{ status: string; year: number; iso14064_result: any; company_id: string }>(`/iso14064/report/${year}`),
    exportDocxUrl: (year: number) => `${API_URL}/iso14064/export/${year}?format=docx`,
    trend: (companyId: string, years: string = "2022,2023,2024") =>
      request<{ base_year: number; base_year_total: number; latest_year: number; latest_total: number; total_reduction_pct: number; trend: any[] }>(`/iso14064/trend/${companyId}?years=${years}`),
  },

  pcf: {
    calculate: (data: {
      product_name?: string; functional_unit?: string; functional_unit_quantity?: number
      system_boundary?: string; sector?: string; annual_production_units?: number
      cbam_product_category?: string; stages?: Record<string, Record<string, number>>
    }) => request<{ status: string; result: any }>('/pcf/calculate', { method: 'POST', body: JSON.stringify(data) }),
    demo: (productKey: string) => request<{ status: string; product_key: string; result: any }>(`/pcf/demo/${productKey}`),
    emissionFactors: () => request<{ emission_factors: Record<string, number>; sources: string[] }>('/pcf/emission-factors'),
    benchmarks: () => request<{ benchmarks: Record<string, any> }>('/pcf/benchmarks'),
  },

  ukSdr: {
    assess: (data: {
      company_name?: string; maturity_score: number
      scope1_co2e?: number; scope2_co2e?: number; scope3_co2e?: number
      uk_revenue_pct?: number; eu_revenue_pct?: number
      taxonomy_alignment_pct?: number; sustainable_investment_pct?: number
      has_science_targets?: boolean; has_verified_data?: boolean; entity_type?: string
    }) => request<{ status: string; result: any }>('/uk-sdr/assess', { method: 'POST', body: JSON.stringify(data) }),
    demo: () => request<{ status: string; result: any }>('/uk-sdr/demo'),
    paiIndicators: () => request<{ indicators: any[]; total: number }>('/uk-sdr/pai-indicators'),
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
    validateiXBRL: (id: string) =>
      request<unknown>(`/reports/${id}/validate-ixbrl`, { method: 'POST' }),
    publicView: (token: string, password?: string) =>
      request<{
        id: string
        status: string
        content_text: string
        compliance_score: number | null
        compliance_grade: string | null
        created_at: string
        version_number: number
      }>(`/reports/public/${token}${password ? `?password=${encodeURIComponent(password)}` : ''}`),
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
    importPreview: (year: number) =>
      request<{ sector: string; embedded_co2: number; goods_tons?: number }>(`/cbam/import-preview/${year}`),
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
    demo: (city = 'istanbul') =>
      request<unknown>(`/satellite/demo?city=${encodeURIComponent(city)}`),
    cities: () =>
      request<{ cities: string[] }>('/satellite/cities'),
    analyzeCoordinates: (lat: number, lng: number, facilityName?: string) =>
      request<unknown>('/satellite/analyze-coordinates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, facility_name: facilityName })
      }),
  },

  nhs: {
    assess: (companyId: string, year = 2024) =>
      request<unknown>('/nhs/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId, year })
      }),
    generateCRP: (companyId: string, selectedActions: string[] = [], year = 2024) =>
      request<{ html: string }>('/nhs/generate-crp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId, selected_actions: selectedActions, year })
      }),
  },

  grid: {
    getLiveMeter: (companyId: string) =>
      request<unknown>(`/grid/live-meter?company_id=${companyId}`),
    getEfficiency: (companyId: string) =>
      request<{ analysis: any }>(`/grid/efficiency?company_id=${companyId}`),
    syncToEmissions: (companyId: string, cumulativeKwh: number, year = 2024) =>
      request<unknown>('/grid/sync-to-emissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId, cumulative_kwh: cumulativeKwh, year })
      }),
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

  suppliers: {
    invite: (data: { name: string; email: string }) =>
      request<{ invite_link: string }>('/suppliers/invite', { method: 'POST', body: JSON.stringify(data) }),
    list: () => request<unknown[]>('/suppliers'),
  },

  import: {
    preview: async (file: File) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('sustain_token') : null
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${API_URL}/import/preview`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: form,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Import hatası' }))
        throw new Error(err.detail || 'Import hatası')
      }
      return res.json() as Promise<{
        filename: string
        row_count: number
        mapped_count: number
        unmapped_columns: string[]
        column_mappings: Array<{
          original_name: string
          mapped_field: string | null
          confidence: number
          sample_values: string[]
          unit_hint: string
        }>
      }>
    },
    confirm: (body: {
      filename: string
      year: number
      sector: string
      reporting_boundary: string
      column_mappings: Array<{ original_name: string; target_field: string | null }>
      raw_rows: Record<string, unknown>[]
    }) => request<{ success: boolean; record_id: string; records_processed: number; message: string }>(
      '/import/confirm', { method: 'POST', body: JSON.stringify(body) }
    ),
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

  healthCheck: {
    estimate: (data: { sector: string; employee_count: number; electricity_kwh?: number; natural_gas_m3?: number }) =>
      request<{
        score: number; grade: string; grade_color: string; grade_bg: string
        percentile: number; total_tco2e: number; intensity_per_employee: number
        sector_avg_intensity: number; sector_label: string
        vs_sector: string; quick_wins: string[]; cta: string
        estimated_electricity_kwh?: number
        estimated_natural_gas_m3?: number
      }>('/health-check/estimate', { method: 'POST', body: JSON.stringify(data) }),
  },

  sroi: {
    catalog: () => request<{ catalog: Record<string, { label: string; unit: string; proxy_eur: number; description: string; sdg: string }> }>('/sroi/catalog'),
    calculate: (data: { investment_eur: number; inputs: Record<string, number> }) =>
      request<{
        sroi_ratio: number; sroi_label: string; total_investment_eur: number
        total_social_value_eur: number; summary: string
        line_items: Array<{ label: string; quantity: number; unit: string; proxy_eur: number; total_value_eur: number; sdg: string }>
        breakdown_pct: Record<string, number>; un_sdgs: string[]
      }>('/sroi/calculate', { method: 'POST', body: JSON.stringify(data) }),
    demo: () => request<unknown>('/sroi/demo'),
  },

  advisory: {
    createNote: (data: { company_id: string; content: string; priority?: string; author_title?: string }) =>
      request<{ id: string; author_name: string; content: string; priority: string; created_at: string }>(
        '/advisory/notes', { method: 'POST', body: JSON.stringify(data) }
      ),
    getCompanyNotes: (companyId: string) =>
      request<{ notes: Array<{ id: string; author_name: string; author_title: string; content: string; priority: string; is_read: boolean; created_at: string }>; unread_count: number }>(
        `/advisory/notes/company/${companyId}`
      ),
    getMyCompanyNotes: () =>
      request<{ notes: Array<{ id: string; author_name: string; author_title: string; content: string; priority: string; is_read: boolean; created_at: string }>; unread_count: number }>(
        '/advisory/notes/my-company'
      ),
    markRead: (noteId: string) =>
      request<{ ok: boolean }>(`/advisory/notes/${noteId}/read`, { method: 'PATCH' }),
  },

  tcfd: {
    scenarios: (data: { sector: string; annual_revenue_eur: number; total_co2e: number; goods_exported_tons?: number; eu_ets_price?: number; physical_risk_base?: number }) =>
      request<unknown>('/tcfd/scenarios', { method: 'POST', body: JSON.stringify(data) }),
    demo: () => request<unknown>('/tcfd/demo', { method: 'POST' }),
  },

  copilot: {
    chat: (messages: { role: string; content: string }[], companyContext?: Record<string, string>) =>
      request<{ content: string; role: string; tokens_used: number }>(
        '/copilot/chat',
        { method: 'POST', body: JSON.stringify({ messages, company_context: companyContext }) }
      ),
    prompts: () =>
      request<{ prompts: Array<{ tr: string; en: string; icon: string }> }>('/copilot/prompts'),
    health: () =>
      request<{ status: string; api_key_configured: boolean }>('/copilot/health'),
  },

  gar: {
    demo: (jurisdiction: 'bddk' | 'fca' | 'trnc' | 'consolidated' = 'bddk') =>
      request<{
        portfolio: {
          jurisdiction: string; currency: string; total_outstanding_eur: number
          gar_ratio_pct: number; green_eur: number; transition_eur: number; brown_eur: number
          taxonomy_breakdown_pct: { green: number; transition: number; brown: number }
        }
        pcaf: {
          scope3_cat15_tco2e: number; total_financed_emissions_tco2e: number
          data_quality_avg: number; standard: string; methodology: string
        }
        borrowers: Array<{
          name: string; sector: string; nace_code: string; taxonomy_status: string
          outstanding_eur: number; attribution_factor_pct: number
          financed_emissions_tco2e: number; data_quality: number
          esg_score: number; esg_grade: string; emission_intensity: number
        }>
        stress_test: {
          iea_nz_2050: { scenario: string; portfolio_at_risk_pct: number; stranded_asset_risk_eur: number; transition_cost_eur: number }
          ngfs_delayed: { scenario: string; portfolio_at_risk_pct: number; stranded_asset_risk_eur: number; transition_cost_eur: number }
        }
        compliance: Record<string, string>
      }>(`/gar/demo?jurisdiction=${jurisdiction}`),
    calculate: (data: {
      borrowers: Array<{
        name: string; sector_key: string; nace_code: string
        outstanding_eur: number; evic_eur: number; revenue_eur: number
        reported_emissions_tco2e?: number; data_quality?: number
      }>
      jurisdiction?: string; currency?: string
    }) => request<unknown>('/gar/calculate', { method: 'POST', body: JSON.stringify(data) }),
    taxonomySectors: () => request<{ nace_taxonomy: Record<string, string>; sector_intensity_tco2e_per_eur_m: Record<string, number> }>('/gar/taxonomy/sectors'),
  },

  supplierAudit: {
    questions: () => request<{ questions: Array<{ id: string; category: string; question: string; weight: number; red_flag_if: string | null }> }>('/supplier-audit/questions'),
    score: (data: { supplier_name: string; responses: Record<string, string>; notes?: string }) =>
      request<{
        supplier_name: string; score_pct: number; grade: string; grade_color: string
        red_flags: Array<{ question_id: string; category: string; question: string; answer: string; severity: string }>
        critical_flag_count: number; requires_immediate_action: boolean
        category_breakdown: Record<string, number>; recommendation: string
      }>('/supplier-audit/score', { method: 'POST', body: JSON.stringify(data) }),
  },

  sbti: {
    demo: () => request<unknown>('/api/sbti/demo'),
    assess: (data: {
      company_name: string; sector: string; base_year: number
      total_emissions_tco2e: number; current_annual_reduction_pct: number
      commitment_stage: string; has_flag: boolean
    }) => request<unknown>('/api/sbti/assess', { method: 'POST', body: JSON.stringify(data) }),
    sectors: () => request<{ sectors: unknown[]; flag_sectors: string[] }>('/api/sbti/sectors'),
    stages: () => request<{ stages: unknown[] }>('/api/sbti/commitment-stages'),
  },

  scope3: {
    demo: () => request<unknown>('/api/scope3/demo'),
    calculate: (data: { category_inputs: Record<number, number>; total_scope1_2: number }) =>
      request<unknown>('/api/scope3/calculate', { method: 'POST', body: JSON.stringify(data) }),
    categories: () => request<{ categories: unknown[] }>('/api/scope3/categories'),
  },

  esgBenchmark: {
    demo: () => request<unknown>('/api/esg-benchmark/demo'),
    assess: (data: { company_name: string; sector: string; company_scores: Record<string, number> }) =>
      request<unknown>('/api/esg-benchmark/assess', { method: 'POST', body: JSON.stringify(data) }),
    dimensions: () => request<unknown[]>('/api/esg-benchmark/dimensions'),
    sectors: () => request<string[]>('/api/esg-benchmark/sectors'),
  },

  waterEsrs: {
    demo: () => request<unknown>('/api/water-esrs/demo'),
    assess: (data: {
      company_name: string; sector: string
      water_withdrawal_m3: number; water_consumed_m3: number
      operates_in_high_stress?: boolean; completed_disclosures?: string[]
      waste_generated_tonnes?: number; recycled_pct?: number
    }) => request<unknown>('/api/water-esrs/assess', { method: 'POST', body: JSON.stringify(data) }),
    standards: () => request<unknown>('/api/water-esrs/standards'),
  },

  sasbSdg: {
    demo: () => request<unknown>('/api/sasb-sdg/demo'),
    assess: (data: { company_name: string; sector_id: string; metric_values?: Record<string, number>; relevant_sdgs?: number[] | null }) =>
      request<unknown>('/api/sasb-sdg/assess', { method: 'POST', body: JSON.stringify(data) }),
    sectors: () => request<unknown[]>('/api/sasb-sdg/sectors'),
    sdgs: () => request<unknown[]>('/api/sasb-sdg/sdgs'),
  },

  reportBuilder: {
    demo: () => request<unknown>('/api/report-builder/demo'),
    build: (data: { company_name: string; report_year: number; frameworks: string[]; extra_sections?: string[]; language?: string }) =>
      request<unknown>('/api/report-builder/build', { method: 'POST', body: JSON.stringify(data) }),
    frameworks: () => request<unknown[]>('/api/report-builder/frameworks'),
    templates: () => request<unknown[]>('/api/report-builder/templates'),
    sections: () => request<unknown[]>('/api/report-builder/sections'),
  },

  tsrs: {
    demo: () => request<unknown>('/api/tsrs/demo'),
    assess: (data: {
      company_name: string; segment: string
      pillar_scores: Record<string, number>; checklist_done: string[]
      scope1_tco2e: number; scope2_tco2e: number; scope3_tco2e: number
      scenarios_count?: number; has_target?: boolean
    }) => request<unknown>('/api/tsrs/assess', { method: 'POST', body: JSON.stringify(data) }),
    standards: () => request<unknown>('/api/tsrs/standards'),
  },

  issb: {
    demo: () => request<unknown>('/api/issb/demo'),
    assess: (data: {
      company_name: string; sector: string
      scope1_tco2e: number; scope2_tco2e: number; scope3_tco2e: number
      pillar_scores?: Record<string, number> | null
      scenarios_analysed?: string[] | null
      has_sbti_target?: boolean; internal_carbon_price?: number | null; exec_pay_linked?: boolean
    }) => request<unknown>('/api/issb/assess', { method: 'POST', body: JSON.stringify(data) }),
    standards: () => request<unknown>('/api/issb/standards'),
    tcfdCrosswalk: () => request<unknown[]>('/api/issb/tcfd-crosswalk'),
  },

  gri: {
    demo: () => request<unknown>('/api/gri/demo'),
    assess: (data: { completed_ids: string[]; maturity_score: number }) =>
      request<unknown>('/api/gri/assess', { method: 'POST', body: JSON.stringify(data) }),
    standards: () => request<{ standards: unknown[] }>('/api/gri/standards'),
  },

  tnfd: {
    demo: () => request<unknown>('/api/tnfd/demo'),
    assess: (data: { sector: string; completed_disclosures: string[]; leap_progress?: Record<string, number> }) =>
      request<unknown>('/api/tnfd/assess', { method: 'POST', body: JSON.stringify(data) }),
    leapPhases: () => request<{ phases: unknown[] }>('/api/tnfd/leap-phases'),
    disclosures: () => request<{ disclosures: unknown[] }>('/api/tnfd/disclosures'),
    sectors: () => request<{ sectors: string[]; risk_categories: unknown[] }>('/api/tnfd/sectors'),
  },

  cdp: {
    demo: () => request<unknown>('/api/cdp/demo'),
    assess: (data: {
      company_name: string; maturity_score: number
      has_scope3: boolean; has_sbti: boolean; has_verification: boolean; has_re_target: boolean; sector: string
      custom_answers?: Record<string, number>
    }) => request<unknown>('/api/cdp/assess', { method: 'POST', body: JSON.stringify(data) }),
    questionnaire: () => request<{ sections: unknown[]; bands: unknown[] }>('/api/cdp/questionnaire'),
  },

  euTaxonomy: {
    demo: () => request<unknown>('/api/eu-taxonomy/demo'),
    assess: (data: {
      nace_code: string; emissions_intensity?: number
      renewable_pct: number; recycling_rate: number; water_intensity?: number
      has_biodiversity_plan: boolean; has_pollution_controls: boolean; climate_adaptation_plan: boolean
      dnsh_answers?: Record<string, boolean>
    }) => request<unknown>('/api/eu-taxonomy/assess', { method: 'POST', body: JSON.stringify(data) }),
    objectives: () => request<{ objectives: unknown[] }>('/api/eu-taxonomy/objectives'),
    naceSectors: () => request<{ sectors: unknown[] }>('/api/eu-taxonomy/nace-sectors'),
  },

  autopilot: {
    demo: () => request<{
      rules: Array<{
        id: string; name: string; rule_type: string
        standard: string; standard_label: string; standard_color: string; standard_icon: string
        frequency: string; frequency_label: string
        is_active: boolean; notify_email: boolean; run_count: number
        last_run_at: string | null; next_run_at: string | null; created_at: string
      }>
      runs: Array<{
        id: string; rule_id: string; status: string; triggered_by: string
        output_summary: string | null; error_message?: string
        started_at: string | null; finished_at: string | null
      }>
      stats: { total_rules: number; active_rules: number; total_runs: number; success_rate: number; reports_generated: number }
      standards: Record<string, { label: string; color: string; icon: string }>
      frequency_labels: Record<string, string>
    }>('/api/autopilot/demo'),
    listRules: () => request<{ rules: unknown[] }>('/api/autopilot/rules'),
    createRule: (data: { name: string; rule_type: string; standard: string; frequency: string; notify_email: boolean; day_of_month?: number; notify_days_before?: number }) =>
      request<{ status: string; rule: unknown }>('/api/autopilot/rules', { method: 'POST', body: JSON.stringify(data) }),
    toggleRule: (ruleId: string) =>
      request<{ rule_id: string; is_active: boolean }>(`/api/autopilot/rules/${ruleId}/toggle`, { method: 'PATCH' }),
    deleteRule: (ruleId: string) =>
      request<{ status: string }>(`/api/autopilot/rules/${ruleId}`, { method: 'DELETE' }),
    manualRun: (ruleId: string) =>
      request<{ status: string; rule_id: string; message: string }>(`/api/autopilot/rules/${ruleId}/run`, { method: 'POST' }),
    listRuns: (limit = 20) => request<{ runs: unknown[] }>(`/api/autopilot/runs?limit=${limit}`),
  },

  kobiCreditScore: {
    demo: () => request<unknown>('/kobi-credit-score/demo'),
    assess: (data: { company_name: string; sector: string; answers: Record<string, number> }) =>
      request<unknown>('/kobi-credit-score/assess', { method: 'POST', body: JSON.stringify(data) }),
    questions: () => request<unknown[]>('/kobi-credit-score/questions'),
    bankCategories: () => request<unknown[]>('/kobi-credit-score/bank-categories'),
    sectors: () => request<unknown>('/kobi-credit-score/sectors'),
  },

  stats: {
    global: () => request<{
      platform: string
      last_updated: string
      metrics: {
        companies_onboarded: number
        active_users: number
        reports_generated: number
        carbon_prevented_tco2e: number
        green_investment_eur: number
        countries_active: number
        satellite_verifications: number
      }
      raw: {
        real_companies: number
        real_users: number
        real_reports: number
        real_emissions_tracked: number
      }
    }>('/stats/global'),
    adminCompanies: () => request<{ companies: unknown[]; total: number }>('/stats/admin/companies'),
    adminOverview: () => request<{
      company_count: number
      user_count: number
      report_count: number
      emission_records: number
      plan_distribution: Record<string, number>
    }>('/stats/admin/overview'),
  },

  integration: {
    providers: () => request<{
      providers: Array<{
        provider: string
        display_name: string
        maturity: 'available' | 'beta' | 'planned'
        description: string
        required_config: string[]
      }>
    }>('/integration/providers'),
    testConnection: (provider: string, config: Record<string, string> = {}) =>
      request<{ provider: string; ok: boolean; status?: string; message: string }>(
        `/integration/providers/${provider}/test`,
        { method: 'POST', body: JSON.stringify({ config }) },
      ),
  },
}
