'use client'
import { useState } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts'

// ── Types ─────────────────────────────────────────────────────────────────────
interface StageResult {
  name: string
  inputs: Record<string, number>
  total_co2e: number
  pct: number
}
interface PCFResult {
  product_name: string
  functional_unit: string
  system_boundary: string
  total_pcf_kg_co2e: number
  cbam_embedded_co2e: number
  stage_breakdown: Record<string, StageResult>
  hotspots: { stage: string; name: string; co2e: number; pct: number }[]
  benchmark: {
    sector: string; your_pcf: number; sector_avg: number; sector_best: number
    unit: string; vs_avg_pct: number; performance: string
  } | null
  annual_total_tco2e: number | null
  epd_ready: boolean
  cbam_product_category: string | null
  methodology: string[]
}

// ── Emission factor keys (label map for form display) ────────────────────────
const EF_LABELS: Record<string, string> = {
  elektrik_tr_kwh: 'Elektrik (kWh)',
  dogalgaz_m3: 'Doğalgaz (m³)',
  motorin_litre: 'Motorin (litre)',
  benzin_litre: 'Benzin (litre)',
  lpg_kg: 'LPG (kg)',
  celik_ton: 'Çelik (ton)',
  aluminyum_primer_ton: 'Alüminyum Primer (ton)',
  aluminyum_sekonder_ton: 'Alüminyum Sekonder (ton)',
  pamuk_kg: 'Pamuk (kg)',
  polyester_kg: 'Polyester (kg)',
  kumas_dokuma_kg: 'Kumaş/Dokuma (kg)',
  cimento_ton: 'Çimento (ton)',
  cam_ton: 'Cam (ton)',
  kagit_ton: 'Kağıt (ton)',
  plastik_pet_kg: 'Plastik PET (kg)',
  kara_tir_tkm: 'Kara TIR (ton-km)',
  denizyolu_tkm: 'Denizyolu (ton-km)',
  havayolu_tkm: 'Havayolu (ton-km)',
  demiryolu_tkm: 'Demiryolu (ton-km)',
  atik_duzenli_depolama_kg: 'Atık-Depolama (kg)',
  atik_yakilma_kg: 'Atık-Yakma (kg)',
  geri_donusum_kredi_kg: 'Geri Dönüşüm Kredisi (kg)',
}

const STAGES_META: { code: string; label: string; group: string; color: string }[] = [
  { code: 'A1', label: 'A1 — Ham Madde Çıkarımı',   group: 'Üretim',  color: '#ef4444' },
  { code: 'A2', label: 'A2 — Ham Madde Nakliyesi',   group: 'Üretim',  color: '#f87171' },
  { code: 'A3', label: 'A3 — Üretim / İşleme',       group: 'Üretim',  color: '#fca5a5' },
  { code: 'A4', label: 'A4 — Teslimat Nakliyesi',    group: 'Teslimat',color: '#f59e0b' },
  { code: 'A5', label: 'A5 — Kurulum / Montaj',      group: 'Teslimat',color: '#fbbf24' },
  { code: 'B1', label: 'B1 — Kullanım',              group: 'Kullanım',color: '#3b82f6' },
  { code: 'B6', label: 'B6 — Operasyonel Enerji',    group: 'Kullanım',color: '#60a5fa' },
  { code: 'C3', label: 'C3 — Atık İşleme',           group: 'Sonu',    color: '#8b5cf6' },
  { code: 'C4', label: 'C4 — Bertaraf',              group: 'Sonu',    color: '#a78bfa' },
  { code: 'D',  label: 'D — Geri Dönüşüm Kredisi',  group: 'Ötesi',   color: '#10b981' },
]

const EF_BY_STAGE: Record<string, string[]> = {
  A1: ['celik_ton','aluminyum_primer_ton','aluminyum_sekonder_ton','pamuk_kg','polyester_kg','cimento_ton','cam_ton','kagit_ton','plastik_pet_kg'],
  A2: ['kara_tir_tkm','denizyolu_tkm','demiryolu_tkm','havayolu_tkm'],
  A3: ['elektrik_tr_kwh','dogalgaz_m3','motorin_litre','lpg_kg','kumas_dokuma_kg'],
  A4: ['kara_tir_tkm','denizyolu_tkm','demiryolu_tkm','havayolu_tkm'],
  A5: ['elektrik_tr_kwh','motorin_litre'],
  B1: [],
  B6: ['elektrik_tr_kwh','dogalgaz_m3'],
  C3: ['atik_yakilma_kg'],
  C4: ['atik_duzenli_depolama_kg'],
  D:  ['geri_donusum_kredi_kg'],
}

const STAGE_COLORS: Record<string, string> = Object.fromEntries(STAGES_META.map(s => [s.code, s.color]))
const DEMO_KEYS = ['tekstil', 'aluminyum', 'celik']
const DEMO_LABELS: Record<string, string> = { tekstil: '👕 Tekstil (Pamuk)', aluminyum: '🔩 Alüminyum Profil', celik: '🏗️ Çelik Boru' }

// ── Helpers ──────────────────────────────────────────────────────────────────
const perf_color = (perf: string) => perf === 'İyi' ? '#10b981' : perf === 'Ortalama' ? '#f59e0b' : '#ef4444'

export default function PCFPage() {
  const [result, setResult] = useState<PCFResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'calculator' | 'results' | 'cbam'>('calculator')

  // Form state
  const [productName, setProductName] = useState('Ürün A')
  const [functionalUnit, setFunctionalUnit] = useState('1 kg')
  const [systemBoundary, setSystemBoundary] = useState<'cradle-to-gate' | 'cradle-to-grave'>('cradle-to-gate')
  const [sector, setSector] = useState('')
  const [annualUnits, setAnnualUnits] = useState<string>('')
  const [cbamCategory, setCbamCategory] = useState('')

  // Stage inputs: { stageCode: { efKey: value } }
  const [stageInputs, setStageInputs] = useState<Record<string, Record<string, string>>>({})
  const [openStage, setOpenStage] = useState<string | null>('A1')

  const setStageValue = (stage: string, efKey: string, val: string) => {
    setStageInputs(prev => ({
      ...prev,
      [stage]: { ...(prev[stage] ?? {}), [efKey]: val },
    }))
  }

  const buildStages = () => {
    const stages: Record<string, Record<string, number>> = {}
    for (const [stage, kv] of Object.entries(stageInputs)) {
      const nums: Record<string, number> = {}
      for (const [k, v] of Object.entries(kv)) {
        const n = parseFloat(v)
        if (!isNaN(n) && n !== 0) nums[k] = n
      }
      if (Object.keys(nums).length > 0) stages[stage] = nums
    }
    return stages
  }

  const runCalculation = async () => {
    setLoading(true)
    try {
      const data = await api.pcf.calculate({
        product_name: productName,
        functional_unit: functionalUnit,
        system_boundary: systemBoundary,
        sector: sector || undefined,
        annual_production_units: annualUnits ? parseFloat(annualUnits) : undefined,
        cbam_product_category: cbamCategory || undefined,
        stages: buildStages(),
      })
      setResult(data.result)
      setActiveTab('results')
      toast.success('PCF hesaplama tamamlandı')
    } catch {
      toast.error('Hesaplama başarısız')
    } finally { setLoading(false) }
  }

  const loadDemo = async (key: string) => {
    setLoading(true)
    try {
      const data = await api.pcf.demo(key)
      setResult(data.result)
      setActiveTab('results')
      toast.success(`Demo yüklendi: ${data.result.product_name}`)
    } catch {
      toast.error('Demo yüklenemedi')
    } finally { setLoading(false) }
  }

  const activeStages = STAGES_META.filter(s =>
    systemBoundary === 'cradle-to-grave' || ['A1','A2','A3','A4','A5'].includes(s.code)
  )

  const barData = result ? Object.entries(result.stage_breakdown).map(([code, s]) => ({
    name: code, fullName: s.name, value: s.total_co2e, pct: s.pct, fill: STAGE_COLORS[code] ?? '#64748b',
  })) : []

  const pieData = barData.filter(d => d.value > 0)

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">ISO 14067 Ürün Karbon Ayak İzi (PCF)</h1>
          <p className="text-slate-400 text-sm mt-1">
            Yaşam Döngüsü Değerlendirmesi · CBAM Gömülü Emisyon Hesabı · EPD Hazırlık
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {DEMO_KEYS.map(k => (
            <button key={k} onClick={() => loadDemo(k)} disabled={loading}
              className="text-xs px-4 py-2 rounded-lg border border-emerald-500/30 text-emerald-400 hover:border-emerald-400 font-bold transition-colors">
              {DEMO_LABELS[k]}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1 w-fit">
        {[
          { k: 'calculator', l: '⚗️ Hesaplama' },
          { k: 'results', l: '📊 Sonuçlar' },
          { k: 'cbam', l: '🏭 CBAM Haritalama' },
        ].map(t => (
          <button key={t.k} onClick={() => setActiveTab(t.k as typeof activeTab)}
            className="text-sm font-semibold px-5 py-2 rounded-lg transition-all"
            style={{
              background: activeTab === t.k ? '#059669' : 'transparent',
              color: activeTab === t.k ? '#fff' : '#94a3b8',
            }}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ── Calculator Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'calculator' && (
        <div className="space-y-5">
          {/* Product info */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">Ürün Tanımı</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-slate-500 mb-1 block">Ürün Adı</label>
                <input value={productName} onChange={e => setProductName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Fonksiyonel Birim</label>
                <input value={functionalUnit} onChange={e => setFunctionalUnit(e.target.value)}
                  placeholder="1 kg, 1 adet, 1 m²"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Sistem Sınırı</label>
                <select value={systemBoundary} onChange={e => setSystemBoundary(e.target.value as typeof systemBoundary)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500">
                  <option value="cradle-to-gate">Cradle-to-Gate (A1-A4)</option>
                  <option value="cradle-to-grave">Cradle-to-Grave (A1-D)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Sektör Karşılaştırması</label>
                <select value={sector} onChange={e => setSector(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500">
                  <option value="">— Seçiniz —</option>
                  <option value="tekstil_kg">Tekstil (kg)</option>
                  <option value="aluminyum_profil_kg">Alüminyum Profil (kg)</option>
                  <option value="celik_boru_kg">Çelik Boru (kg)</option>
                  <option value="cimento_ton">Çimento (ton)</option>
                  <option value="yiyecek_icecek_kg">Gıda-İçecek (kg)</option>
                  <option value="elektronik_unit">Elektronik (adet)</option>
                  <option value="mobilya_unit">Mobilya (adet)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Yıllık Üretim Adedi</label>
                <input type="number" value={annualUnits} onChange={e => setAnnualUnits(e.target.value)}
                  placeholder="örn. 50000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">CBAM Ürün Kategorisi</label>
                <select value={cbamCategory} onChange={e => setCbamCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500">
                  <option value="">— CBAM Dışı —</option>
                  <option value="celik">Çelik</option>
                  <option value="aluminyum">Alüminyum</option>
                  <option value="cimento">Çimento</option>
                  <option value="gubre">Gübre</option>
                  <option value="elektrik">Elektrik</option>
                  <option value="hidrojen">Hidrojen</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stage inputs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
              <p className="text-sm font-bold text-white">Yaşam Döngüsü Aşamaları</p>
              <p className="text-xs text-slate-500 mt-0.5">Fonksiyonel birim başına girdi miktarlarını girin</p>
            </div>
            {activeStages.map(stage => {
              const isOpen = openStage === stage.code
              const efKeys = EF_BY_STAGE[stage.code] ?? []
              const stageTotal = Object.entries(stageInputs[stage.code] ?? {})
                .filter(([, v]) => parseFloat(v) > 0).length
              return (
                <div key={stage.code} className="border-b border-slate-800/60 last:border-0">
                  <button
                    onClick={() => setOpenStage(isOpen ? null : stage.code)}
                    className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-white/[0.02] transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: stage.color }} />
                      <span className="text-sm font-semibold text-white">{stage.label}</span>
                      <span className="text-xs text-slate-600">{stage.group}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {stageTotal > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400 font-bold">
                          {stageTotal} girdi
                        </span>
                      )}
                      <span className="text-slate-600 text-xs">{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </button>
                  {isOpen && efKeys.length > 0 && (
                    <div className="px-6 pb-5 grid grid-cols-2 md:grid-cols-3 gap-3 bg-slate-800/20">
                      {efKeys.map(efKey => (
                        <div key={efKey}>
                          <label className="text-xs text-slate-500 mb-1 block">{EF_LABELS[efKey] ?? efKey}</label>
                          <input
                            type="number"
                            min={0}
                            step="any"
                            placeholder="0"
                            value={stageInputs[stage.code]?.[efKey] ?? ''}
                            onChange={e => setStageValue(stage.code, efKey, e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {isOpen && efKeys.length === 0 && (
                    <p className="px-6 pb-4 text-xs text-slate-600">Bu aşama için doğrudan girdi yok.</p>
                  )}
                </div>
              )
            })}
          </div>

          <button onClick={runCalculation} disabled={loading}
            className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition-colors disabled:opacity-50">
            {loading ? '⏳ Hesaplanıyor...' : '🌿 PCF Hesapla'}
          </button>
        </div>
      )}

      {/* ── Results Tab ────────────────────────────────────────────────────── */}
      {activeTab === 'results' && !result && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">🌿</div>
          <p className="text-slate-400">Önce demo deneyin veya hesaplama sekmesinden değer girin.</p>
        </div>
      )}

      {activeTab === 'results' && result && (
        <div className="space-y-6">
          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Toplam PCF', value: `${result.total_pcf_kg_co2e.toLocaleString('tr-TR', { maximumFractionDigits: 3 })}`, unit: 'kg CO₂e', color: '#10b981' },
              { label: 'CBAM Gömülü', value: `${result.cbam_embedded_co2e.toLocaleString('tr-TR', { maximumFractionDigits: 3 })}`, unit: 'kg CO₂e (A1-A3)', color: '#f59e0b' },
              { label: 'Yıllık Toplam', value: result.annual_total_tco2e ? `${result.annual_total_tco2e.toLocaleString('tr-TR')}` : '—', unit: 'tCO₂e/yıl', color: '#3b82f6' },
              { label: 'EPD Hazır', value: result.epd_ready ? 'Evet' : 'Hayır', unit: 'Çevre Ürün Beyanı', color: result.epd_ready ? '#10b981' : '#ef4444' },
            ].map(k => (
              <div key={k.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="text-xs text-slate-500 mb-1">{k.label}</div>
                <div className="text-2xl font-black" style={{ color: k.color }}>{k.value}</div>
                <div className="text-xs text-slate-600 mt-0.5">{k.unit}</div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-sm font-bold text-white mb-4">Aşama Bazlı Emisyonlar (kg CO₂e)</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}`} />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10 }}
                      formatter={(v) => [`${Number(v ?? 0).toFixed(4)} kg CO₂e`, '']}
                      labelFormatter={(l) => barData.find(d => d.name === l)?.fullName ?? l}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {barData.map(d => <Cell key={d.name} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-sm font-bold text-white mb-4">Emisyon Dağılımı</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                      innerRadius={50} outerRadius={80} paddingAngle={2}
                      label={(props: { name?: string; pct?: number }) => `${props.name ?? ''} ${props.pct ?? 0}%`}
                      labelLine={{ stroke: '#334155' }}>
                      {pieData.map(d => <Cell key={d.name} fill={d.fill} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10 }}
                      formatter={(v) => [`${Number(v ?? 0).toFixed(4)} kg CO₂e`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Hotspots */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-sm font-bold text-white mb-4">🔥 Sıcak Nokta Analizi (Top 3)</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.hotspots.map((h, i) => (
                <div key={h.stage} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-black text-white">#{i + 1}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{ background: (STAGE_COLORS[h.stage] ?? '#64748b') + '30', color: STAGE_COLORS[h.stage] ?? '#64748b' }}>
                      {h.stage}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-1">{h.name}</p>
                  <p className="text-xl font-black text-white">{h.pct}%</p>
                  <p className="text-xs text-slate-500">{h.co2e.toFixed(4)} kg CO₂e</p>
                </div>
              ))}
            </div>
          </div>

          {/* Benchmark */}
          {result.benchmark && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-sm font-bold text-white mb-4">Sektör Karşılaştırması</p>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Sizin PCF', value: result.benchmark.your_pcf, color: '#10b981' },
                  { label: 'Sektör Ort.', value: result.benchmark.sector_avg, color: '#f59e0b' },
                  { label: 'Sektör İyisi', value: result.benchmark.sector_best, color: '#3b82f6' },
                ].map(b => (
                  <div key={b.label} className="text-center">
                    <div className="text-2xl font-black" style={{ color: b.color }}>{b.value.toFixed(1)}</div>
                    <div className="text-xs text-slate-500">{result.benchmark!.unit}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{b.label}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: perf_color(result.benchmark.performance) + '20', color: perf_color(result.benchmark.performance) }}>
                  {result.benchmark.performance}
                </span>
                <span className="text-sm text-slate-400">
                  Sektör ortalamasına göre{' '}
                  <span style={{ color: result.benchmark.vs_avg_pct < 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                    {result.benchmark.vs_avg_pct > 0 ? '+' : ''}{result.benchmark.vs_avg_pct}%
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Methodology */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-6 py-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Metodoloji</p>
            <div className="flex flex-wrap gap-2">
              {result.methodology.map((m, i) => (
                <span key={i} className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">{m}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CBAM Mapping Tab ────────────────────────────────────────────────── */}
      {activeTab === 'cbam' && (
        <div className="space-y-5">
          {result ? (
            <>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-2xl">🏭</span>
                  <div>
                    <p className="text-sm font-bold text-white">CBAM Gömülü Emisyon Raporu</p>
                    <p className="text-xs text-slate-500">AB Sınırda Karbon Düzenleme Mekanizması — Yönetmelik (AB) 2023/956</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Ürün', value: result.product_name },
                    { label: 'CBAM Kategorisi', value: result.cbam_product_category ?? 'Tanımsız' },
                    { label: 'Fonksiyonel Birim', value: result.functional_unit },
                    { label: 'Toplam PCF', value: `${result.total_pcf_kg_co2e} kg CO₂e` },
                    { label: 'Gömülü Emisyon (A1-A3)', value: `${result.cbam_embedded_co2e} kg CO₂e` },
                    { label: 'Gömülü Emisyon Payı', value: result.total_pcf_kg_co2e > 0 ? `%${(result.cbam_embedded_co2e / result.total_pcf_kg_co2e * 100).toFixed(1)}` : '—' },
                  ].map(r => (
                    <div key={r.label} className="bg-slate-800/40 rounded-xl px-4 py-3">
                      <div className="text-xs text-slate-500 mb-0.5">{r.label}</div>
                      <div className="text-sm font-bold text-white">{r.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-6 space-y-3">
                <p className="text-sm font-bold text-amber-400">📋 CBAM Beyan Gereksinimleri</p>
                {[
                  'Akredite doğrulayıcı tarafından onaylanmış gömülü emisyon değeri',
                  'AB CBAM Geçiş Kayıt Sistemi\'ne çeyreklik beyan (2024-2025)',
                  'Üretim tesisi sınırları ve giriş malzemeleri listesi',
                  'Kullanılan elektrik kaynağı ve emisyon faktörü beyanı',
                  '2026 sonrası: CBAM sertifikası satın alma zorunluluğu başlar',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-amber-400 mt-0.5 flex-shrink-0">▸</span>
                    <span className="text-amber-200/80">{item}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">🏭</div>
              <p className="text-slate-400">CBAM haritalama için önce PCF hesaplama yapın veya demo deneyin.</p>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-slate-700 text-center">
        ISO 14067:2018 · ISO 14044:2006 · IPCC AR5 GWP100 · DEFRA 2022 · ETKB 2022 · Ecoinvent 3.9
      </p>
    </div>
  )
}
