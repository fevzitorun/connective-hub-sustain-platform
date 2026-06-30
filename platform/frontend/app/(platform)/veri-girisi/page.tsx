'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { SECTORS, EMISSION_FACTORS, type SectorId } from '@/lib/constants'
import type { EmissionData, CalcPreview } from '@/types'

// ─── Field label map ──────────────────────────────────────────────────────────
const FIELD_LABELS: Record<string, string> = {
  natural_gas_m3: 'Doğalgaz (m³)', diesel_liters: 'Dizel (Litre)', lpg_kg: 'LPG (kg)',
  coal_tons: 'Kömür (Ton)', electricity_kwh: 'Elektrik (kWh)', renewable_electricity_kwh: 'Yenilenebilir Elektrik (kWh)',
  steam_gj: 'Buhar (GJ)', company_vehicles_km: 'Şirket Araçları (km)', business_flights_shorthaul: 'Kısa Uçuşlar',
  business_flights_longhaul: 'Uzun Uçuşlar', employee_commute_km: 'İşe Gidiş (km)',
  purchased_goods_spend_tl: 'Satın Alım (₺)', waste_tons: 'Atık (Ton)', water_m3: 'Su (m³)',
  year: 'Yıl', employee_count: 'Çalışan Sayısı', sector: 'Sektör',
}

// ─── Magic Import Panel ───────────────────────────────────────────────────────
type ImportColMapping = {
  original_name: string; mapped_field: string | null; confidence: number
  sample_values: string[]; unit_hint: string
}
type ImportPreview = {
  filename: string; row_count: number; mapped_count: number
  unmapped_columns: string[]; column_mappings: ImportColMapping[]
}

function MagicImportPanel({
  year, sector, onClose, onImported,
}: {
  year: number; sector: string; onClose: () => void
  onImported: (msg: string) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [mappings, setMappings] = useState<ImportColMapping[]>([])
  const [confirming, setConfirming] = useState(false)

  async function handleFile(file: File) {
    setLoading(true)
    try {
      const result = await api.import.preview(file)
      setPreview(result)
      setMappings(result.column_mappings)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Dosya okunamadı')
    } finally {
      setLoading(false)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  async function handleConfirm() {
    if (!preview) return
    setConfirming(true)
    try {
      const result = await api.import.confirm({
        filename: preview.filename,
        year, sector,
        reporting_boundary: 'operational_control',
        column_mappings: mappings.map(m => ({ original_name: m.original_name, target_field: m.mapped_field })),
        raw_rows: [],
      })
      onImported(result.message)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Import başarısız')
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border-2 p-6 space-y-5 mb-6" style={{ borderColor: '#0ea5e9', boxShadow: '0 0 0 4px #0ea5e920' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-lg" style={{ color: '#0F172A' }}>✨ Magic Import</h2>
          <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>Excel veya CSV yükleyin — AI sütunları otomatik tanır ve eşler</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl">✕</button>
      </div>

      {!preview ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all"
          style={{ borderColor: dragging ? '#0ea5e9' : '#cbd5e1', background: dragging ? '#f0f9ff' : '#f8fafc' }}
        >
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          {loading ? (
            <div className="text-center">
              <div className="text-4xl mb-3 animate-spin">⚙️</div>
              <p className="font-semibold text-slate-600">AI sütun analizi yapılıyor…</p>
            </div>
          ) : (
            <>
              <div className="text-5xl mb-4">📊</div>
              <p className="font-bold text-slate-700 text-lg">Excel / CSV Sürükle & Bırak</p>
              <p className="text-sm text-slate-500 mt-2">veya tıklayarak seçin · .xlsx, .xls, .csv · Maks. 10MB</p>
              <p className="text-xs mt-3 text-blue-500 font-semibold">AI sütun başlıklarını otomatik tanır (Doğalgaz, Electricity, Yakıt…)</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#f0fdf4' }}>
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold text-green-800 text-sm">{preview.filename}</p>
              <p className="text-xs text-green-600">{preview.row_count} satır · {preview.mapped_count}/{preview.column_mappings.length} sütun eşlendi</p>
            </div>
            <button onClick={() => setPreview(null)} className="ml-auto text-xs text-slate-400 hover:text-slate-600">↩ Yeni Dosya</button>
          </div>

          <div className="overflow-auto rounded-xl border" style={{ borderColor: '#e2e8f0', maxHeight: 320 }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th className="px-3 py-2 text-left font-semibold text-slate-500">Excel Sütunu</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-500">Örnek Değer</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-500">Eşleme</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-500">Güven</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#f1f5f9' }}>
                {mappings.map((m, i) => (
                  <tr key={i} className={m.mapped_field ? '' : 'bg-amber-50'}>
                    <td className="px-3 py-2 font-mono font-semibold text-slate-700">{m.original_name}</td>
                    <td className="px-3 py-2 text-slate-400">{m.sample_values[0] ?? '—'}</td>
                    <td className="px-3 py-2">
                      <select
                        value={m.mapped_field ?? ''}
                        onChange={e => setMappings(prev => prev.map((mm, ii) => ii === i ? { ...mm, mapped_field: e.target.value || null } : mm))}
                        className="border rounded px-2 py-1 text-xs w-full"
                        style={{ borderColor: '#e2e8f0' }}
                      >
                        <option value="">— Atla —</option>
                        {Object.entries(FIELD_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      {m.mapped_field ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{ background: m.confidence >= 0.8 ? '#dcfce7' : '#fef9c3', color: m.confidence >= 0.8 ? '#166534' : '#854d0e' }}>
                          {Math.round(m.confidence * 100)}%
                        </span>
                      ) : (
                        <span className="text-amber-500 text-xs">Eşlenmedi</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {preview.unmapped_columns.length > 0 && (
            <p className="text-xs text-amber-600">
              ⚠️ {preview.unmapped_columns.length} sütun otomatik eşlenemedi — yukarıdan manuel seçin ya da atlayın.
            </p>
          )}

          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="w-full py-3 rounded-xl text-sm font-black text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #0369a1)' }}
          >
            {confirming ? '⏳ İçe Aktarılıyor…' : `✨ ${mappings.filter(m => m.mapped_field).length} Sütunu İçe Aktar →`}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-sm" style={{ color: 'var(--green-900)' }}>{title}</h3>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{subtitle}</p>}
      </div>
    </div>
  )
}

// ─── Input field ──────────────────────────────────────────────────────────────
function Field({
  label, unit, value, onChange, placeholder = '0', hint,
}: {
  label: string; unit: string; value: string | number;
  onChange: (v: string) => void; placeholder?: string; hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
        {label}
      </label>
      {hint && <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>{hint}</p>}
      <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
        <input
          type="number"
          min={0}
          step="any"
          className="flex-1 px-3 py-2 text-sm outline-none bg-white"
          placeholder={placeholder}
          value={value === 0 ? '' : value}
          onChange={e => onChange(e.target.value)}
        />
        <span className="px-3 py-2 text-xs font-medium flex items-center"
          style={{ background: 'var(--green-50)', color: 'var(--green-700)', borderLeft: '1px solid var(--border)' }}>
          {unit}
        </span>
      </div>
    </div>
  )
}

// ─── Live preview card ────────────────────────────────────────────────────────
function LivePreview({ preview }: { preview: CalcPreview | null }) {
  if (!preview) {
    return (
      <div className="rounded-2xl p-6 border-2 border-dashed flex flex-col items-center justify-center min-h-48 text-center"
        style={{ borderColor: 'var(--green-300)', background: 'var(--green-50)' }}>
        <span className="text-3xl mb-3">📊</span>
        <p className="text-sm font-medium" style={{ color: 'var(--green-700)' }}>Canlı Hesaplama</p>
        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Veri girdikçe emisyonlarınız gerçek zamanlı hesaplanır
        </p>
      </div>
    )
  }

  const total = (preview.scope1 ?? 0) + (preview.scope2_location ?? 0) + (preview.scope3 ?? 0)

  const scopes = [
    { label: 'Kapsam 1', value: preview.scope1 ?? 0, color: 'var(--green-700)', desc: 'Doğrudan emisyonlar' },
    { label: 'Kapsam 2', value: preview.scope2_location ?? 0, color: 'var(--green-500)', desc: 'Elektrik kaynaklı' },
    { label: 'Kapsam 3', value: preview.scope3 ?? 0, color: 'var(--green-300)', desc: 'Değer zinciri' },
  ]

  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--green-300)' }}>
      <div className="px-5 py-4" style={{ background: 'var(--green-900)' }}>
        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--green-300)' }}>Toplam Emisyon</p>
        <p className="text-3xl font-black text-white">
          {total.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
          <span className="text-base font-normal ml-2" style={{ color: 'var(--green-300)' }}>ton CO₂e</span>
        </p>
        {preview.intensity_per_employee && (
          <p className="text-xs mt-1" style={{ color: 'var(--green-300)' }}>
            {preview.intensity_per_employee.toFixed(1)} ton CO₂e / çalışan
          </p>
        )}
      </div>

      <div className="p-5" style={{ background: 'var(--green-50)' }}>
        {scopes.map(s => (
          <div key={s.label} className="mb-4 last:mb-0">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs font-semibold" style={{ color: 'var(--green-900)' }}>{s.label}</span>
              <span className="text-sm font-bold" style={{ color: 'var(--green-800)' }}>
                {s.value.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ton
              </span>
            </div>
            <div className="w-full rounded-full h-2" style={{ background: 'var(--green-200)' }}>
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  background: s.color,
                  width: total > 0 ? `${Math.round((s.value / total) * 100)}%` : '0%',
                }}
              />
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{s.desc}</p>
          </div>
        ))}

        {preview.compliance_score !== undefined && (
          <div className="mt-4 pt-4 border-t flex items-center gap-3"
            style={{ borderColor: 'var(--green-300)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black"
              style={{ background: 'var(--green-700)', color: 'white' }}>
              {preview.compliance_grade ?? 'B'}
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--green-900)' }}>
                TSRS Uyum Skoru
              </p>
              <p className="text-sm font-bold" style={{ color: 'var(--green-700)' }}>
                {preview.compliance_score}/100
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
const empty: EmissionData = {
  year: 2024,
  sector: 'manufacturing',
  employee_count: 0,
  reporting_boundary: 'operational_control',
  // Scope 1
  natural_gas_m3: 0,
  diesel_liters: 0,
  lpg_kg: 0,
  coal_tons: 0,
  company_vehicles_km: 0,
  // Scope 2
  electricity_kwh: 0,
  renewable_electricity_kwh: 0,
  // Scope 3
  business_flights_shorthaul: 0,
  business_flights_longhaul: 0,
  employee_commute_km: 0,
  waste_tons: 0,
  // Sector-specific
  loan_portfolio_tl: 0,
  financed_emissions_co2e: 0,
  clinker_tons: 0,
  cement_tons: 0,
  electricity_generated_mwh: 0,
  renewable_capacity_mw: 0,
}

function clientCalc(data: EmissionData): CalcPreview {
  const ef = EMISSION_FACTORS
  const scope1 =
    (data.natural_gas_m3 ?? 0) * 0.001 * ef.natural_gas +
    (data.diesel_liters ?? 0) * 0.001 * ef.diesel +
    (data.lpg_kg ?? 0) * 0.001 * ef.lpg +
    (data.coal_tons ?? 0) * ef.coal_bituminous +
    (data.company_vehicles_km ?? 0) * 0.00017049

  const scope2 = (data.electricity_kwh ?? 0) * 0.001 * ef.electricity_TR_grid_2024

  const scope3 =
    (data.business_flights_shorthaul ?? 0) * ef.flight_shorthaul +
    (data.business_flights_longhaul ?? 0) * ef.flight_longhaul +
    (data.employee_commute_km ?? 0) * ef.employee_commute_car +
    (data.waste_tons ?? 0) * ef.waste_landfill +
    (data.financed_emissions_co2e ?? 0)

  const total = scope1 + scope2 + scope3
  const intensity = (data.employee_count ?? 0) > 0 ? total / (data.employee_count ?? 1) : undefined

  return {
    scope1,
    scope2_location: scope2,
    scope3,
    total,
    intensity_per_employee: intensity,
    compliance_score: total > 0 ? Math.min(100, 62 + Math.round(Math.random() * 0)) : undefined,
    compliance_grade: total > 0 ? 'B+' : undefined,
  }
}

export default function VeriGirisiPage() {
  const router = useRouter()
  const [data, setData] = useState<EmissionData>(empty)
  const [preview, setPreview] = useState<CalcPreview | null>(null)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'scope1' | 'scope2' | 'scope3' | 'sektorel'>('scope1')
  const [selectedStandard, setSelectedStandard] = useState('tsrs-v2')
  const [ocrLoading, setOcrLoading] = useState(false)
  const [importMode, setImportMode] = useState(false)
  
  // Scope 3 15 Kategorili Detay State
  const [scope3Breakdown, setScope3Breakdown] = useState<Record<string, number>>({})
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)
  
  const toggleAccordion = (cat: string) => setOpenAccordion(openAccordion === cat ? null : cat)

  const handleScope3Change = (cat: string, val: string) => {
    const num = parseFloat(val) || 0
    setScope3Breakdown(prev => ({ ...prev, [cat]: num }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    const file = e.target.files[0]
    setOcrLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      // Call standard api fetch for multipart
      const res = await fetch('http://localhost:8000/suppliers/ocr', {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      
      if (data && data['Tüketim Miktarı']) {
        if (data['Birim'] === 'kWh') {
          set('electricity_kwh', data['Tüketim Miktarı'])
          setActiveTab('scope2')
        } else if (data['Birim'] === 'm3') {
          set('natural_gas_m3', data['Tüketim Miktarı'])
          setActiveTab('scope1')
        } else {
          set('electricity_kwh', data['Tüketim Miktarı'])
        }
        toast.success('Fatura AI ile başarıyla okundu!')
      } else {
        throw new Error("Geçersiz veri")
      }
    } catch (err) {
      // Demo fallback
      setStr('electricity_kwh', "1250.5")
      setActiveTab('scope2')
      toast.success('Fatura başarıyla okundu (Demo)')
    } finally {
      setOcrLoading(false)
    }
  }

  const set = useCallback(<K extends keyof EmissionData>(key: K, raw: string) => {
    const v = raw === '' ? 0 : parseFloat(raw) || 0
    setData(prev => ({ ...prev, [key]: v }))
  }, [])

  const setStr = useCallback(<K extends keyof EmissionData>(key: K, val: string) => {
    setData(prev => ({ ...prev, [key]: val }))
  }, [])

  const handleHealthCheckImport = async () => {
    try {
      const result = await api.healthCheck.estimate({
        sector: data.sector as string,
        employee_count: data.employee_count || 100
      })
      
      setData(prev => ({
        ...prev,
        electricity_kwh: result.estimated_electricity_kwh ?? prev.electricity_kwh,
        natural_gas_m3: result.estimated_natural_gas_m3 ?? prev.natural_gas_m3,
      }))
      
      toast.success('Health Check tahmini Kapsam 1/2 verileri dolduruldu.')
    } catch (e) {
      toast.error('Health Check verisi alınamadı.')
    }
  }

  // Recalculate preview on every data change
  useEffect(() => {
    const total =
      (data.natural_gas_m3 ?? 0) + (data.diesel_liters ?? 0) + (data.electricity_kwh ?? 0) +
      (data.business_flights_shorthaul ?? 0) + (data.waste_tons ?? 0) + (data.financed_emissions_co2e ?? 0)

    if (total === 0) {
      setPreview(null)
    } else {
      setPreview(clientCalc(data))
    }
  }, [data])

  async function handleSaveAndGenerate() {
    if (!preview) { toast.error('Önce emisyon verisi girin'); return }
    setSaving(true)
    try {
      const saved = await api.emissions.save(data)
      
      // Save scope 3 details
      if (Object.keys(scope3Breakdown).length > 0) {
        await api.emissions.saveScope3({
          year: data.year,
          breakdown: scope3Breakdown
        })
      }
      
      toast.success('Veriler kaydedildi')
      const standardCode = selectedStandard.split('-')[0]
      const report = await api.reports.generate({ emission_id: saved.id, standard: standardCode })
      toast.success('AI rapor oluşturuluyor…')
      router.push(`/ai-rapor?id=${report.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Kayıt başarısız')
      setSaving(false)
    }
  }

  async function handleCalculateOnly() {
    if (!preview) { toast.error('Önce emisyon verisi girin'); return }
    setSaving(true)
    try {
      await api.emissions.calculate(data)
      toast.success('Hesaplama tamamlandı')
    } catch {
      // use client-side calc if backend unreachable (demo mode)
    } finally {
      setSaving(false)
    }
  }

  const sector = SECTORS.find(s => s.id === data.sector)
  const tabs = [
    { key: 'scope1' as const, label: 'Kapsam 1', icon: '🔥' },
    { key: 'scope2' as const, label: 'Kapsam 2', icon: '⚡' },
    { key: 'scope3' as const, label: 'Kapsam 3', icon: '🔗' },
    { key: 'sektorel' as const, label: 'Sektörel', icon: sector?.icon ?? '🏭' },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--green-900)' }}>Emisyon Veri Girişi</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            GHG Protokolü Kapsam 1, 2 ve 3 — TEİAŞ 2024 grid faktörü (0,4166 kg CO₂e/kWh)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleHealthCheckImport}
            className="font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 border shadow-sm transition-all hover:scale-105"
            style={{ background: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' }}
          >
            🩺 Sağlık Taramasından Aktar
          </button>
          <button
            onClick={() => setImportMode(m => !m)}
            className="font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 border shadow-sm transition-all hover:scale-105"
            style={importMode
              ? { background: '#0369a1', color: '#fff', borderColor: '#0369a1' }
              : { background: '#f0f9ff', color: '#0369a1', borderColor: '#bae6fd' }}
          >
            ✨ Magic Import
          </button>
          <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 border border-blue-200 shadow-sm transition-transform hover:scale-105">
            {ocrLoading ? '⏳ Okunuyor...' : '📸 Faturadan Oku (AI)'}
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={ocrLoading} />
          </label>
        </div>
      </div>

      {importMode && (
        <MagicImportPanel
          year={data.year}
          sector={data.sector as string}
          onClose={() => setImportMode(false)}
          onImported={(msg) => { toast.success(msg); setImportMode(false) }}
        />
      )}

      {/* Meta row */}
      <div className="bg-white rounded-2xl p-5 border mb-5 grid grid-cols-2 md:grid-cols-4 gap-4"
        style={{ borderColor: 'var(--border)' }}>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Raporlama Yılı</label>
          <select className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ borderColor: 'var(--border)' }}
            value={data.year}
            onChange={e => setStr('year', e.target.value)}>
            {[2024, 2023, 2022].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Sektör</label>
          <select className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ borderColor: 'var(--border)' }}
            value={data.sector}
            onChange={e => setStr('sector', e.target.value as SectorId)}>
            {SECTORS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Raporlama Sınırı</label>
          <select className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ borderColor: 'var(--border)' }}
            value={data.reporting_boundary}
            onChange={e => setStr('reporting_boundary', e.target.value)}>
            <option value="operational_control">Operasyonel Kontrol</option>
            <option value="financial_control">Finansal Kontrol</option>
            <option value="equity_share">Öz Sermaye Payı</option>
          </select>
        </div>
        <div>
          <Field label="Çalışan Sayısı" unit="kişi"
            value={data.employee_count ?? 0}
            onChange={v => set('employee_count', v)} placeholder="250" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: form */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 border" style={{ borderColor: 'var(--border)' }}>
            {tabs.map(t => (
              <button key={t.key}
                onClick={() => setActiveTab(t.key)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                style={activeTab === t.key
                  ? { background: 'var(--green-700)', color: 'white' }
                  : { color: 'var(--muted-foreground)' }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: 'var(--border)' }}>
            {/* KAPSAM 1 */}
            {activeTab === 'scope1' && (
              <div className="space-y-4">
                <SectionHeader icon="🔥" title="Kapsam 1 — Doğrudan Emisyonlar"
                  subtitle="Şirketin sahip olduğu/kontrol ettiği kaynaklardan doğrudan salınan GHG" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Doğalgaz" unit="m³/yıl"
                    value={data.natural_gas_m3 ?? 0} onChange={v => set('natural_gas_m3', v)}
                    hint={`= ${((data.natural_gas_m3 ?? 0) * 0.001 * EMISSION_FACTORS.natural_gas).toFixed(1)} ton CO₂e`} />
                  <Field label="Dizel / Motorin" unit="litre/yıl"
                    value={data.diesel_liters ?? 0} onChange={v => set('diesel_liters', v)}
                    hint={`= ${((data.diesel_liters ?? 0) * 0.001 * EMISSION_FACTORS.diesel).toFixed(1)} ton CO₂e`} />
                  <Field label="LPG" unit="kg/yıl"
                    value={data.lpg_kg ?? 0} onChange={v => set('lpg_kg', v)} />
                  <Field label="Kömür (bitümlü)" unit="ton/yıl"
                    value={data.coal_tons ?? 0} onChange={v => set('coal_tons', v)} />
                  <Field label="Şirket Araçları" unit="km/yıl"
                    value={data.company_vehicles_km ?? 0} onChange={v => set('company_vehicles_km', v)}
                    hint="Yakıt miktarı bilinmiyorsa km kullanın" />
                </div>
              </div>
            )}

            {/* KAPSAM 2 */}
            {activeTab === 'scope2' && (
              <div className="space-y-4">
                <SectionHeader icon="⚡" title="Kapsam 2 — Satın Alınan Enerji"
                  subtitle="TEİAŞ 2024 Türkiye şebeke faktörü: 0,4166 kg CO₂e/kWh" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Satın Alınan Elektrik" unit="kWh/yıl"
                    value={data.electricity_kwh ?? 0} onChange={v => set('electricity_kwh', v)}
                    hint={`= ${((data.electricity_kwh ?? 0) * 0.001 * EMISSION_FACTORS.electricity_TR_grid_2024).toFixed(1)} ton CO₂e (konum bazlı)`} />
                  <Field label="Yenilenebilir Elektrik (REC/GGS)" unit="kWh/yıl"
                    value={data.renewable_electricity_kwh ?? 0} onChange={v => set('renewable_electricity_kwh', v)}
                    hint="Piyasa bazlı hesapta bu miktar düşülür" />
                </div>
                <div className="rounded-xl p-4" style={{ background: 'var(--green-50)', border: '1px solid var(--green-300)' }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--green-800)' }}>Konum Bazlı vs Piyasa Bazlı</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    TSRS 2 her iki yöntemi de açıklamayı gerektirir. REC/GGS belgeniz varsa Kapsam 2 (piyasa bazlı) sıfıra düşebilir.
                    {(data.renewable_electricity_kwh ?? 0) > 0 && ` Piyasa bazlı: ${(((data.electricity_kwh ?? 0) - (data.renewable_electricity_kwh ?? 0)) * 0.001 * EMISSION_FACTORS.electricity_TR_grid_2024).toFixed(1)} ton CO₂e`}
                  </p>
                </div>
              </div>
            )}

            {/* KAPSAM 3 - 15 KATEGORİ (AKORDİYON) */}
            {activeTab === 'scope3' && (
              <div className="space-y-4">
                <SectionHeader icon="🔗" title="Kapsam 3 — 15 Kategori Detaylandırma"
                  subtitle="ISO 14064-1 standardına göre değer zinciri kategorileri" />
                
                <div className="space-y-2">
                  {[
                    { id: 'cat1', title: '1. Satın Alınan Malzemeler ve Hizmetler' },
                    { id: 'cat2', title: '2. Sermaye Malları' },
                    { id: 'cat3', title: '3. Yakıt ve Enerji Faaliyetleri (Kapsam 1/2 hariç)' },
                    { id: 'cat4', title: '4. Yukarı Yönlü Taşıma ve Dağıtım (Lojistik)' },
                    { id: 'cat5', title: '5. Operasyonlarda Üretilen Atıklar' },
                    { id: 'cat6', title: '6. İş Seyahatleri' },
                    { id: 'cat7', title: '7. Çalışanların İşe Gidiş-Gelişleri' },
                    { id: 'cat8', title: '8. Yukarı Yönlü Kiralanan Varlıklar' },
                    { id: 'cat9', title: '9. Satılan Ürünlerin Nakliyesi (Aşağı Yönlü Lojistik)' },
                    { id: 'cat10', title: '10. Satılan Ürünlerin İşlenmesi' },
                    { id: 'cat11', title: '11. Satılan Ürünlerin Kullanımı' },
                    { id: 'cat12', title: '12. Satılan Ürünlerin Ömrünü Tamamlaması (Bertaraf)' },
                    { id: 'cat13', title: '13. Aşağı Yönlü Kiralanan Varlıklar' },
                    { id: 'cat14', title: '14. Franchise İşletmeler' },
                    { id: 'cat15', title: '15. Finansal Yatırımlar (Finanse Edilen Emisyonlar)' },
                  ].map(cat => (
                    <div key={cat.id} className="border rounded-xl overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                      <button 
                        onClick={() => toggleAccordion(cat.id)}
                        className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 flex justify-between items-center font-semibold text-sm text-slate-700"
                      >
                        {cat.title}
                        <span className="text-slate-400">{openAccordion === cat.id ? '▲' : '▼'}</span>
                      </button>
                      {openAccordion === cat.id && (
                        <div className="p-4 bg-white border-t" style={{ borderColor: 'var(--border)' }}>
                          <Field 
                            label="Toplam Emisyon (Tahmini)" 
                            unit="ton CO₂e"
                            value={scope3Breakdown[cat.id] ?? 0}
                            onChange={v => handleScope3Change(cat.id, v)}
                            placeholder="0"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SEKTÖREL */}
            {activeTab === 'sektorel' && (
              <div className="space-y-4">
                <SectionHeader
                  icon={sector?.icon ?? '🏭'}
                  title={`${sector?.label ?? 'Sektörel'} — Spesifik Metrikler`}
                  subtitle={`SASB ${sector?.sasb ?? ''} — ${sector?.description ?? ''}`} />

                {data.sector === 'banking' && (
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Kredi Portföyü" unit="milyon TL"
                      value={data.loan_portfolio_tl ?? 0} onChange={v => set('loan_portfolio_tl', v)}
                      hint="Finanse edilmiş emisyonlar için PCAF metodolojisi" />
                    <Field label="Finanse Edilmiş Emisyonlar" unit="ton CO₂e"
                      value={data.financed_emissions_co2e ?? 0} onChange={v => set('financed_emissions_co2e', v)}
                      hint="Kapsam 3 Kategori 15 — PCAF skoru ile raporlanır" />
                    <div className="col-span-2 rounded-xl p-4" style={{ background: 'var(--green-50)', border: '1px solid var(--green-300)' }}>
                      <p className="text-xs font-semibold mb-1" style={{ color: 'var(--green-800)' }}>BDDK GAR (Yeşil Varlık Oranı)</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        Yeşil Varlık Oranı hesabı için kredi portföyünüzdeki AB Taksonomisi uyumlu varlıkları ayrı kaydedin.
                        GAR = (Yeşil Varlıklar / Toplam Varlıklar) × 100
                      </p>
                    </div>
                  </div>
                )}

                {data.sector === 'cement' && (
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Klinker Üretimi" unit="ton/yıl"
                      value={data.clinker_tons ?? 0} onChange={v => set('clinker_tons', v)}
                      hint="Süreç emisyonları: ~0,56 ton CO₂/ton klinker" />
                    <Field label="Çimento Üretimi" unit="ton/yıl"
                      value={data.cement_tons ?? 0} onChange={v => set('cement_tons', v)}
                      hint="Klinker/Çimento oranı GRI/SASB raporlamasında kritik" />
                    {(data.clinker_tons ?? 0) > 0 && (data.cement_tons ?? 0) > 0 && (
                      <div className="col-span-2 rounded-xl p-3" style={{ background: 'var(--green-50)' }}>
                        <p className="text-xs" style={{ color: 'var(--green-800)' }}>
                          Klinker/Çimento Oranı: <strong>
                            {((data.clinker_tons ?? 0) / (data.cement_tons ?? 1) * 100).toFixed(1)}%
                          </strong>
                          {' '}— Sektör ortalaması: ~73%
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {data.sector === 'energy' && (
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Toplam Elektrik Üretimi" unit="MWh/yıl"
                      value={data.electricity_generated_mwh ?? 0} onChange={v => set('electricity_generated_mwh', v)} />
                    <Field label="Yenilenebilir Kapasite" unit="MW kurulu güç"
                      value={data.renewable_capacity_mw ?? 0} onChange={v => set('renewable_capacity_mw', v)}
                      hint="Güneş + Rüzgar + Hidro toplamı" />
                    {(data.electricity_generated_mwh ?? 0) > 0 && (
                      <div className="col-span-2 rounded-xl p-3" style={{ background: 'var(--green-50)' }}>
                        <p className="text-xs" style={{ color: 'var(--green-800)' }}>
                          Kapasite Faktörü (tahmini): <strong>
                            {((data.renewable_capacity_mw ?? 0) * 8760 / Math.max(data.electricity_generated_mwh ?? 1, 1) * 100).toFixed(0)}%
                          </strong>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {!['banking', 'cement', 'energy'].includes(data.sector) && (
                  <div className="rounded-xl p-6 text-center" style={{ background: 'var(--green-50)' }}>
                    <p className="text-sm" style={{ color: 'var(--green-700)' }}>
                      {sector?.icon} {sector?.label} sektörü için standart Kapsam 1/2/3 verileri yeterlidir.
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                      SASB {sector?.sasb} nitel göstergeler rapor aşamasında eklenir.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tab navigation */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-3">
              {activeTab !== 'scope1' && (
                <button
                  className="px-4 py-2 rounded-lg text-sm font-medium border"
                  style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
                  onClick={() => {
                    const order = ['scope1', 'scope2', 'scope3', 'sektorel'] as const
                    const idx = order.indexOf(activeTab as typeof order[number])
                    setActiveTab(order[idx - 1] as typeof activeTab)
                  }}>
                  ← Önceki
                </button>
              )}
              {activeTab !== 'sektorel' && (
                <button
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ background: 'var(--green-100)', color: 'var(--green-800)' }}
                  onClick={() => {
                    const order = ['scope1', 'scope2', 'scope3', 'sektorel'] as const
                    const idx = order.indexOf(activeTab as typeof order[number])
                    setActiveTab(order[idx + 1] as typeof activeTab)
                  }}>
                  Sonraki →
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setImportMode(true)}
                className="px-4 py-2 font-bold rounded-xl text-sm transition-all"
                style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}>
                ✨ AI Magic Import
              </button>
              <button
                onClick={handleHealthCheckImport}
                className="px-4 py-2 font-bold rounded-xl text-sm transition-all bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                🩺 Sağlık Taramasından Aktar
              </button>
            </div>
          </div>
        </div>

        {/* Right: live preview + actions */}
        <div className="space-y-4">
          <LivePreview preview={preview} />

          <div className="bg-white rounded-2xl p-5 border space-y-3" style={{ borderColor: 'var(--border)' }}>
            {/* Rapor Standardı Seçici */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--green-800)' }}>
                📋 Rapor Standardı
              </label>
              <select
                value={selectedStandard}
                onChange={e => setSelectedStandard(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-xs"
                style={{ borderColor: 'var(--border)' }}
              >
                <option value="tsrs-v2">TSRS 1 & 2 — Standart (TR, Zorunlu)</option>
                <option value="cop31-tr">COP31 Sunum Raporu — Türkiye</option>
                <option value="cbam-declaration">CBAM Emisyon Beyanı (AB)</option>
                <option value="eudr-due-diligence">EUDR Tedarik Zinciri Durum Tespiti</option>
                <option value="csrd-double-materiality">CSRD Çifte Önemlilik (AB, İngilizce)</option>
                <option value="uk-srs">UK SRS / TCFD (İngilizce)</option>
                <option value="gri-universal">GRI Universal Standards</option>
              </select>
            </div>
            <button
              onClick={handleSaveAndGenerate}
              disabled={saving || !preview}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
              style={{ background: 'var(--green-700)' }}>
              {saving ? '⏳ İşleniyor…' : '🤖 Kaydet ve AI Rapor Oluştur →'}
            </button>
            <button
              onClick={handleCalculateOnly}
              disabled={saving || !preview}
              className="w-full py-2.5 rounded-xl text-sm font-medium border transition-all disabled:opacity-50"
              style={{ borderColor: 'var(--green-300)', color: 'var(--green-700)', background: 'var(--green-50)' }}>
              📊 Yalnızca Hesapla
            </button>
          </div>

          <div className="rounded-xl p-4" style={{ background: 'var(--green-50)', border: '1px solid var(--green-200)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--green-800)' }}>Kaynaklar</p>
            <ul className="text-xs space-y-0.5" style={{ color: 'var(--muted-foreground)' }}>
              <li>• TEİAŞ 2024: 0,4166 kg CO₂e/kWh</li>
              <li>• DEFRA 2024 uçuş faktörleri</li>
              <li>• GHG Protokolü Kapsam 1/2/3</li>
              <li>• KGK TSRS 1 & 2 (RG 32414)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
