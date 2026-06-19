import { SectorId } from '@/lib/constants'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'editor' | 'viewer' | 'auditor' | 'data_entry'
  company_id: string
}

export interface UserProfile {
  id: string
  email: string
  name: string
  role: string
  role_label: string
  is_self?: boolean
  created_at: string
}

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Yönetici',
  editor: 'Editör',
  viewer: 'İzleyici',
  auditor: 'Denetçi',
  data_entry: 'Veri Girişi',
}

export interface Company {
  id: string
  name: string
  tax_id?: string
  sector: SectorId
  sasb_volume: string
  employee_count: number
  address?: string
  lat?: number
  lng?: number
  plan_type: 'free' | 'starter' | 'professional' | 'enterprise' | 'bank'
  is_regulated: boolean
  is_public: boolean
  is_exporter: boolean
  net_zero_target_year?: number
}

export interface EmissionData {
  id?: string
  company_id?: string
  year: number
  sector: SectorId | string
  reporting_boundary: 'operational_control' | 'financial_control' | 'equity_share'
  employee_count?: number

  // Kapsam 1
  natural_gas_m3?: number
  diesel_liters?: number
  lpg_kg?: number
  coal_tons?: number
  company_vehicles_km?: number

  // Kapsam 2
  electricity_kwh?: number
  renewable_electricity_kwh?: number
  steam_gj?: number

  // Kapsam 3
  business_flights_shorthaul?: number
  business_flights_longhaul?: number
  employee_commute_km?: number
  purchased_goods_spend_tl?: number
  waste_tons?: number
  water_m3?: number

  // Bankacılık (Kapsam 3 Kat. 15 — PCAF)
  loan_portfolio_tl?: number
  green_finance_ratio?: number
  financed_emissions_co2e?: number

  // Çimento
  clinker_tons?: number
  cement_tons?: number
  alternative_fuel_ratio?: number

  // Enerji
  electricity_generated_mwh?: number
  renewable_capacity_mw?: number
  renewable_ratio?: number

  // Hesaplanan (backend'den gelir)
  scope1_co2e?: number
  scope2_location_co2e?: number
  scope2_market_co2e?: number
  scope3_co2e?: number
  total_co2e?: number
}

export interface ComplianceScore {
  total_score: number
  passed: number
  total_checks: number
  missing: string[]
  grade: 'A' | 'B' | 'C' | 'D'
}

export interface Report {
  id: string
  company_id?: string
  year?: number
  standard?: 'tsrs' | 'gri' | 'tcfd' | 'integrated' | 'uk_srs'
  language?: 'tr' | 'en' | 'de'
  status: 'draft' | 'generating' | 'completed' | 'failed' | 'review' | 'published' | 'pending' | 'approved' | 'rejected'
  compliance_score?: number
  compliance_grade?: string
  content_text?: string
  content_json?: Record<string, unknown>
  ai_model?: string
  prompt_tokens?: number
  completion_tokens?: number
  pdf_url?: string
  word_url?: string
  assurance_firm?: string
  version_number?: number
  version_of?: string
  submitted_at?: string
  approved_at?: string
  approved_by?: string
  rejection_reason?: string
  created_at: string
  published_at?: string
}

export interface CalcPreview {
  scope1?: number
  scope2_location?: number
  scope2_market?: number
  scope3?: number
  total?: number
  intensity_per_employee?: number
  compliance_score?: number
  compliance_grade?: string
  breakdown?: Record<string, number>
}

export interface SatelliteRiskData {
  earthquake_zone: string
  flood_risk: 'Yüksek' | 'Orta' | 'Düşük'
  drought_risk: 'Yüksek' | 'Orta' | 'Düşük'
  ndvi_score?: number
  ndvi_change_pct?: number
  air_quality_pm25?: number
}

export interface SubsidyInfo {
  program: string
  is_eligible: boolean
  rate?: number
  annual_potential_tl?: number
  description: string
}
