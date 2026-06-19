export const EMISSION_FACTORS = {
  electricity_TR_grid_2024: 0.4166,
  electricity_TR_grid_2023: 0.4489,
  electricity_TR_grid_2022: 0.4816,
  natural_gas: 2.0404,
  diesel: 2.6762,
  lpg: 1.6318,
  coal_bituminous: 2.4248,
  flight_shorthaul: 0.15530,
  flight_longhaul: 0.19085,
  employee_commute_car: 0.17049,
  waste_landfill: 0.5858,
} as const

export const SECTORS = [
  { id: 'banking', label: 'Bankacılık', icon: '🏦', sasb: 'Cilt 16 + 19', description: 'PCAF finanse edilmiş emisyonlar' },
  { id: 'cement', label: 'Çimento', icon: '🏭', sasb: 'Cilt 10', description: 'Klinker/çimento oranı' },
  { id: 'energy', label: 'Enerji / Elektrik', icon: '⚡', sasb: 'Cilt 32', description: 'Yenilenebilir kapasite oranı' },
  { id: 'construction', label: 'İnşaat / Holding', icon: '🏗️', sasb: 'Cilt 33', description: 'Çok sektörlü konsolidasyon' },
  { id: 'retail', label: 'Perakende', icon: '🛒', sasb: 'Cilt 22', description: 'Gıda israfı metrikleri' },
  { id: 'insurance', label: 'Sigorta / Sağlık', icon: '🏥', sasb: 'Cilt 20 + 21', description: 'Underwriting riski' },
  { id: 'manufacturing', label: 'Beyaz Eşya / Sanayi', icon: '🏠', sasb: 'Cilt 26', description: 'Kapsam 3 ürün kullanımı' },
  { id: 'refinery', label: 'Rafineri / Petrol', icon: '🛢️', sasb: 'Cilt 31', description: 'AB Taksonomisi uyumu' },
] as const

export type SectorId = typeof SECTORS[number]['id']

export const REPORTING_BOUNDARIES = [
  { value: 'operational_control', label: 'Operasyonel Kontrol' },
  { value: 'financial_control', label: 'Finansal Kontrol' },
  { value: 'equity_share', label: 'Öz Sermaye Payı' },
] as const

export const REPORT_STANDARDS = [
  { value: 'tsrs', label: 'TSRS 1 & 2 (KGK)' },
  { value: 'gri', label: 'GRI Universal Standards 2021' },
  { value: 'tcfd', label: 'TCFD Çerçevesi' },
  { value: 'integrated', label: 'Entegre Rapor (TSRS + Yıllık Faaliyet)' },
  { value: 'uk_srs', label: 'UK SRS (FCA)' },
] as const

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
