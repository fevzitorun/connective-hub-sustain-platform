'use client'
import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine,
  ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area,
} from 'recharts'
import { api } from '@/lib/api'

// ── Types ─────────────────────────────────────────────────────────────────────
interface CommitmentStage { id: string; label: string; icon: string; color: string; desc: string }
interface NearTerm {
  base_year: number; target_year: number; method: string
  sector_label: string; pathway: string
  base_emissions: number; target_emissions: number; reduction_pct: number
  annual_reduction_needed: number; scope1_2_target: number; scope3_target: number
  flag_required: boolean; notes: string
  milestones: Array<{ year: number; emissions: number; reduction_pct_achieved: number }>
}
interface TempAlign {
  alignment: string; alignment_color: string; temp_label: string
  current_tco2e: number; reduction_rate_pct: number
  projected_2030: number; projected_2050: number
  required_1_5C: number; required_2C: number; gap_to_1_5C: number
}
interface SBTiResult {
  company_name: string; sector: string; base_year: number; total_emissions_tco2e: number
  commitment_stage: string; stage_info: CommitmentStage
  near_term: NearTerm; net_zero: { net_zero_year: number; residual_tco2e: number; abatement_pathway: string; removal_options: string[] }
  temperature_alignment: TempAlign
  sector_pathway: { label: string; icon: string; reduction_pct_2030: number; pathway: string; notes: string }
  flag_module: { required: boolean; note?: string; categories?: Array<{ id: string; title: string; target: string }> }
  commitment_stages: CommitmentStage[]
  next_actions: string[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const SECTORS = ['tekstil', 'gıda_içecek', 'steel', 'cement', 'enerji', 'finans', 'ulaşım', 'inşaat']
const SECTOR_LABELS: Record<string, string> = {
  tekstil: 'Tekstil', gıda_içecek: 'Gıda & İçecek', steel: 'Çelik', cement: 'Çimento',
  enerji: 'Enerji', finans: 'Finans', ulaşım: 'Ulaşım', inşaat: 'İnşaat',
}

function TempBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className="px-3 py-1.5 rounded-full text-sm font-bold border" style={{ color, backgroundColor: color + '22', borderColor: color + '44' }}>
      {label}
    </span>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SBTiPage() {
  const [result, setResult] = useState<SBTiResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'pathway' | 'flag' | 'form'>('overview')
  const [assessing, setAssessing] = useState(false)

  const [form, setForm] = useState({
    company_name: 'Demo Şirketi A.Ş.',
    sector: 'tekstil',
    base_year: 2021,
    total_emissions_tco2e: 12840,
    current_annual_reduction_pct: 2.5,
    commitment_stage: 'committed',
    has_flag: false,
  })

  useEffect(() => {
    api.sbti.demo().then(d => { setResult(d as SBTiResult); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  async function runAssessment() {
    setAssessing(true)
    try {
      const d = await api.sbti.assess(form)
      setResult(d as SBTiResult)
      setTab('overview')
    } catch { /* demo */ } finally { setAssessing(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-emerald-400 animate-pulse">SBTi değerlendirmesi yükleniyor…</div>
    </div>
  )

  const r = result!
  const nt = r.near_term
  const ta = r.temperature_alignment

  // Build pathway chart data
  const chartData: Array<{ year: number; current: number; target15: number; target2: number }> = []
  const base = r.total_emissions_tco2e
  for (let y = r.base_year; y <= 2050; y += 5) {
    const yrs = y - r.base_year
    chartData.push({
      year: y,
      current: Math.max(0, Math.round(base * Math.pow(1 - ta.reduction_rate_pct / 100, yrs))),
      target15: Math.max(0, Math.round(base * Math.pow(0.958, yrs))),
      target2: Math.max(0, Math.round(base * Math.pow(0.985, yrs))),
    })
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xl">🎯</div>
          <div>
            <h1 className="text-xl font-bold text-white">SBTi Science-Based Targets</h1>
            <p className="text-xs text-slate-400">Corporate Manual v2.0 · Near-term 2030 · Net Zero 2050 · FLAG Modülü</p>
          </div>
          <div className="ml-auto flex gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">SBTi v2.0</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Sprint 35</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Commitment stage track */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <div className="text-sm font-semibold text-slate-300 mb-4">Taahhüt Yolculuğu</div>
          <div className="flex items-center gap-0 overflow-x-auto">
            {r.commitment_stages.map((stage, i) => {
              const isActive = stage.id === r.commitment_stage
              const isPast = r.commitment_stages.findIndex(s => s.id === r.commitment_stage) > i
              return (
                <div key={stage.id} className="flex items-center">
                  <div className={`flex flex-col items-center min-w-[100px] px-2 ${isActive ? 'opacity-100' : isPast ? 'opacity-70' : 'opacity-30'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${isActive ? 'border-white scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: stage.color + '33', borderColor: isActive ? stage.color : 'transparent' }}>
                      {stage.icon}
                    </div>
                    <div className="text-xs text-center mt-1 font-medium" style={{ color: isActive ? stage.color : '#94a3b8' }}>
                      {stage.label}
                    </div>
                  </div>
                  {i < r.commitment_stages.length - 1 && (
                    <div className={`h-0.5 w-8 flex-shrink-0 ${isPast ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-3 text-sm text-slate-400">{r.stage_info.desc}</div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Sıcaklık Hizalaması', value: ta.temp_label, color: ta.alignment_color },
            { label: 'Baz Yılı Emisyon', value: `${r.total_emissions_tco2e.toLocaleString()} tCO₂e`, color: '#f59e0b' },
            { label: '2030 Hedefi', value: `${nt.target_emissions.toLocaleString()} tCO₂e`, color: '#3b82f6' },
            { label: 'Gerekli Azaltma', value: `%${nt.reduction_pct}`, color: '#10b981' },
          ].map(k => (
            <div key={k.label} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="text-xl font-bold" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Temp alignment banner */}
        <div className="rounded-xl border p-4 flex items-center gap-4"
          style={{ backgroundColor: ta.alignment_color + '18', borderColor: ta.alignment_color + '44' }}>
          <div className="text-3xl font-black" style={{ color: ta.alignment_color }}>{ta.temp_label}</div>
          <div className="flex-1">
            <div className="font-semibold text-white">{ta.alignment}</div>
            <div className="text-sm text-slate-400">
              Mevcut azaltma hızı: %{ta.reduction_rate_pct}/yıl · 1.5°C için %4.2/yıl gerekli
              {ta.gap_to_1_5C > 0 && ` · 2030 boşluğu: ${ta.gap_to_1_5C.toLocaleString()} tCO₂e`}
            </div>
          </div>
          <div className="flex gap-2">
            <TempBadge label="1.5°C" color="#10b981" />
            <TempBadge label="<2°C" color="#3b82f6" />
            <TempBadge label="2°C" color="#f59e0b" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800/50 border border-slate-700 rounded-xl p-1 w-fit">
          {([['overview', '📊 Genel Bakış'], ['pathway', '📈 Yol Haritası'], ['flag', '🌳 FLAG Modülü'], ['form', '⚙️ Hesapla']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === id ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ─────────────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Near-term targets */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-4">
              <div className="text-sm font-semibold text-slate-300">🎯 Near-term Hedef (2030)</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Baz Yılı', value: `${nt.base_year}`, sub: `${r.total_emissions_tco2e.toLocaleString()} tCO₂e` },
                  { label: 'Hedef Yılı', value: `${nt.target_year}`, sub: `${nt.target_emissions.toLocaleString()} tCO₂e` },
                  { label: 'Azaltma', value: `%${nt.reduction_pct}`, sub: `${nt.annual_reduction_needed}%/yıl` },
                  { label: 'Yöntem', value: nt.method, sub: nt.pathway },
                ].map(item => (
                  <div key={item.label} className="bg-slate-700/50 rounded-xl p-3">
                    <div className="text-xs text-slate-500 mb-0.5">{item.label}</div>
                    <div className="font-bold text-white">{item.value}</div>
                    <div className="text-xs text-slate-400">{item.sub}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Kapsam 1+2 Hedefi</span>
                  <span className="text-blue-400 font-bold">{nt.scope1_2_target.toLocaleString()} tCO₂e</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Kapsam 3 Hedefi (min %25)</span>
                  <span className="text-purple-400 font-bold">{nt.scope3_target.toLocaleString()} tCO₂e</span>
                </div>
              </div>
              {nt.notes && <p className="text-xs text-slate-500 italic">{nt.notes}</p>}
            </div>

            {/* Net Zero */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-4">
              <div className="text-sm font-semibold text-slate-300">🌍 Long-term Net Zero (2050)</div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xl">2050</div>
                  <div>
                    <div className="font-semibold text-white">%90 Mutlak Azaltma</div>
                    <div className="text-xs text-slate-400">SBTi Corporate Net-Zero Standard</div>
                  </div>
                </div>
                <p className="text-sm text-slate-400">{r.net_zero.abatement_pathway}</p>
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-400">Kalan Emisyon Nötralizasyonu:</div>
                  {r.net_zero.removal_options.map((opt, i) => (
                    <div key={i} className="text-xs text-slate-500 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      {opt}
                    </div>
                  ))}
                </div>
                <div className="bg-slate-700/50 rounded-xl p-3">
                  <div className="text-xs text-slate-500">Kalan Emisyon (Nötralize Edilecek)</div>
                  <div className="text-lg font-bold text-yellow-400">{r.net_zero.residual_tco2e.toLocaleString()} tCO₂e</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="md:col-span-2 space-y-2">
              <div className="text-sm font-semibold text-slate-300">⚡ Öncelikli Eylemler</div>
              {r.next_actions.map((a, i) => (
                <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <p className="text-sm text-slate-300">{a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PATHWAY CHART ─────────────────────────────────────────────────── */}
        {tab === 'pathway' && (
          <div className="space-y-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <div className="text-sm font-semibold text-slate-300 mb-4">Emisyon Azaltma Yolu (2024–2050)</div>
              <ResponsiveContainer width="100%" height={360}>
                <AreaChart data={chartData} margin={{ right: 20 }}>
                  <defs>
                    <linearGradient id="current" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={ta.alignment_color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={ta.alignment_color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => (v / 1000).toFixed(1) + 'k'} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                    formatter={(v) => [Number(v ?? 0).toLocaleString() + ' tCO₂e', '']}
                  />
                  <Legend />
                  <Area dataKey="current" name="Mevcut Yol" stroke={ta.alignment_color} fill="url(#current)" strokeWidth={2} />
                  <Line dataKey="target15" name="1.5°C Hedef" stroke="#10b981" strokeWidth={2} strokeDasharray="6 3" dot={false} />
                  <Line dataKey="target2" name="2°C Hedef" stroke="#3b82f6" strokeWidth={2} strokeDasharray="6 3" dot={false} />
                  <ReferenceLine x={2030} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '2030', fill: '#f59e0b', fontSize: 11 }} />
                  <ReferenceLine x={2050} stroke="#8b5cf6" strokeDasharray="4 4" label={{ value: '2050', fill: '#8b5cf6', fontSize: 11 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Milestones */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <div className="text-sm font-semibold text-slate-300 mb-4">📌 2030 Yol Haritası Kilometre Taşları</div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {nt.milestones.map(m => (
                  <div key={m.year} className="min-w-[120px] bg-slate-700/50 rounded-xl p-3 text-center flex-shrink-0">
                    <div className="text-xs text-slate-500 mb-1">{m.year}</div>
                    <div className="font-bold text-white">{m.emissions.toLocaleString()}</div>
                    <div className="text-xs text-emerald-400">tCO₂e</div>
                    <div className="text-xs text-slate-500 mt-1">-%{m.reduction_pct_achieved}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── FLAG MODULE ────────────────────────────────────────────────────── */}
        {tab === 'flag' && (
          <div className="space-y-4 max-w-2xl">
            <div className={`rounded-xl border p-5 ${r.flag_module.required ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🌳</span>
                <div>
                  <div className="font-bold text-white">FLAG — Forest, Land and Agriculture</div>
                  <div className="text-sm text-slate-400">SBTi FLAG Guidance (2023)</div>
                </div>
                <span className={`ml-auto px-2 py-1 rounded-full text-xs font-bold border ${r.flag_module.required ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                  {r.flag_module.required ? '⚠️ Zorunlu' : 'İsteğe Bağlı'}
                </span>
              </div>
              <p className="text-sm text-slate-400">{r.flag_module.note}</p>
            </div>

            {r.flag_module.required && r.flag_module.categories && (
              <div className="space-y-3">
                {r.flag_module.categories.map((cat: { id: string; title: string; target: string }) => (
                  <div key={cat.id} className="bg-slate-800/50 border border-green-500/20 rounded-xl p-4">
                    <div className="font-semibold text-white mb-1">{cat.title}</div>
                    <div className="text-sm text-slate-400">{cat.target}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-2 text-sm text-slate-400">
              <div className="font-semibold text-white">📎 FLAG Kaynakları</div>
              <div>• SBTi FLAG Guidance v1.0 (2023)</div>
              <div>• SBTN Land Targets Guidance</div>
              <div>• Global Forest Watch — Ormansızlaşma izleme</div>
              <div>• EUDR Kapsamında orman riski değerlendirmesi</div>
            </div>
          </div>
        )}

        {/* ── FORM ─────────────────────────────────────────────────────────── */}
        {tab === 'form' && (
          <div className="max-w-xl bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">SBTi Hedef Hesaplama</h2>
              <p className="text-sm text-slate-400">Şirket verilerinizden bilimsel temelli hedefler hesaplayın.</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-slate-300 font-medium">Şirket Adı</label>
              <input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm text-slate-300 font-medium">Sektör</label>
                <select value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm">
                  {SECTORS.map(s => <option key={s} value={s}>{SECTOR_LABELS[s] ?? s}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-slate-300 font-medium">Baz Yılı</label>
                <input type="number" min={2015} max={2023} value={form.base_year}
                  onChange={e => setForm(f => ({ ...f, base_year: Number(e.target.value) }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-slate-300 font-medium">Toplam Emisyon (tCO₂e)</label>
                <input type="number" value={form.total_emissions_tco2e}
                  onChange={e => setForm(f => ({ ...f, total_emissions_tco2e: Number(e.target.value) }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-slate-300 font-medium">Yıllık Azaltma (%)</label>
                <input type="number" step="0.5" min={0} max={20} value={form.current_annual_reduction_pct}
                  onChange={e => setForm(f => ({ ...f, current_annual_reduction_pct: Number(e.target.value) }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300 font-medium">Taahhüt Aşaması</label>
              <div className="grid grid-cols-1 gap-2">
                {[['not_committed', 'Taahhüt Yok'], ['committed', 'Taahhüt Edildi'], ['approved', 'SBTi Onaylı']].map(([v, l]) => (
                  <label key={v} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${form.commitment_stage === v ? 'border-blue-500/50 bg-blue-500/10' : 'border-slate-700 hover:border-slate-600'}`}>
                    <input type="radio" name="stage" value={v} checked={form.commitment_stage === v}
                      onChange={e => setForm(f => ({ ...f, commitment_stage: e.target.value }))} className="sr-only" />
                    <span className="text-sm text-white">{l}</span>
                    {form.commitment_stage === v && <span className="ml-auto text-blue-400">✓</span>}
                  </label>
                ))}
              </div>
            </div>
            <button onClick={runAssessment} disabled={assessing}
              className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {assessing ? <span className="animate-spin">⏳</span> : '🎯'}
              {assessing ? 'Hesaplanıyor…' : 'SBTi Hedeflerini Hesapla'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
