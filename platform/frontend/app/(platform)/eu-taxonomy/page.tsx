'use client'
import { useEffect, useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, Legend,
} from 'recharts'
import { api } from '@/lib/api'

// ── Types ─────────────────────────────────────────────────────────────────────
interface ObjScore {
  score: number; aligned: boolean; threshold: string; unit: string
  your_value: number | string | boolean | null; sector_avg: number | null
}
interface TaxonomyResult {
  nace_code: string; sector_label: string
  overall_alignment_pct: number
  aligned_objectives: number; total_objectives: number
  dnsh_pass: boolean; taxonomy_eligible: boolean; taxonomy_aligned: boolean
  objectives: Record<string, ObjScore>
  dnsh_checks: Array<{ obj: string; q: string }>
  mss_note: string
  gaps: Array<{ code: string; title: string; icon: string; score: number; threshold: string }>
  recommendations: string[]
}

// ── Config ────────────────────────────────────────────────────────────────────
const OBJ_META: Record<string, { title: string; icon: string; color: string }> = {
  CCM: { title: 'İklim Azaltma', icon: '🌡️', color: '#10b981' },
  CCA: { title: 'İklim Uyum', icon: '🌊', color: '#3b82f6' },
  WTR: { title: 'Su & Deniz', icon: '💧', color: '#06b6d4' },
  CE:  { title: 'Döngüsel Ekonomi', icon: '♻️', color: '#8b5cf6' },
  PPC: { title: 'Kirlilik Kontrolü', icon: '🏭', color: '#f59e0b' },
  BIO: { title: 'Biyoçeşitlilik', icon: '🌿', color: '#ec4899' },
}

const NACE_OPTIONS = [
  { value: 'C13', label: 'C13 — Tekstil Üretimi' },
  { value: 'C24', label: 'C24 — Çelik Üretimi' },
  { value: 'C29', label: 'C29 — Otomotiv Üretimi' },
  { value: 'A01', label: 'A01 — Tarım / Tahıl' },
  { value: 'D35', label: 'D35 — Elektrik Üretimi' },
  { value: 'F41', label: 'F41 — Bina İnşaatı' },
]

// ── Alignment Gauge ────────────────────────────────────────────────────────────
function AlignGauge({ pct, aligned, eligible }: { pct: number; aligned: boolean; eligible: boolean }) {
  const r = 40; const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  const color = aligned ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex flex-col items-center">
      <svg width={110} height={110} viewBox="0 0 110 110">
        <circle cx={55} cy={55} r={r} fill="none" stroke="#1e293b" strokeWidth={12} />
        <circle cx={55} cy={55} r={r} fill="none" stroke={color} strokeWidth={12}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 55 55)" style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text x={55} y={51} textAnchor="middle" fill={color} fontSize={20} fontWeight="bold">{pct}%</text>
        <text x={55} y={67} textAnchor="middle" fill="#64748b" fontSize={10}>Uyum</text>
      </svg>
      <div className="flex gap-2 mt-2">
        <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${eligible ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' : 'text-red-400 bg-red-500/20 border-red-500/30'}`}>
          {eligible ? '✓ Uygun' : '✗ Uygun Değil'}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${aligned ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' : 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'}`}>
          {aligned ? '✓ Hizalı' : '⚠ Kısmi'}
        </span>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function EUTaxonomyPage() {
  const [result, setResult] = useState<TaxonomyResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'dashboard' | 'objectives' | 'dnsh' | 'assess'>('dashboard')
  const [assessing, setAssessing] = useState(false)

  const [form, setForm] = useState({
    nace_code: 'C13',
    emissions_intensity: 1.6,
    renewable_pct: 25,
    recycling_rate: 45,
    water_intensity: 120,
    has_biodiversity_plan: false,
    has_pollution_controls: true,
    climate_adaptation_plan: false,
  })

  useEffect(() => {
    api.euTaxonomy.demo().then(d => { setResult(d as TaxonomyResult); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  async function runAssessment() {
    setAssessing(true)
    try {
      const d = await api.euTaxonomy.assess(form)
      setResult(d as TaxonomyResult)
      setTab('dashboard')
    } catch {
      // demo fallback
    } finally {
      setAssessing(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-emerald-400 animate-pulse">EU Taxonomy değerlendirmesi yükleniyor…</div>
    </div>
  )

  const r = result!
  const objEntries = Object.entries(r.objectives)
  const radarData = objEntries.map(([code, s]) => ({ subject: code, score: s.score, fullMark: 100 }))
  const barData = objEntries.map(([code, s]) => ({
    code, name: OBJ_META[code]?.title ?? code,
    score: s.score, aligned: s.aligned ? 1 : 0,
  }))

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xl">🇪🇺</div>
          <div>
            <h1 className="text-xl font-bold text-white">EU Taxonomy (2020/852) Uyum Analizi</h1>
            <p className="text-xs text-slate-400">6 Çevresel Hedef · Teknik Tarama Kriterleri · DNSH · MSS</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Reg 2020/852</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">Sprint 33</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Genel Uyum', value: `%${r.overall_alignment_pct}`, color: r.overall_alignment_pct >= 60 ? '#10b981' : '#f59e0b' },
            { label: 'Hizalı Hedef', value: `${r.aligned_objectives}/${r.total_objectives}`, color: '#3b82f6' },
            { label: 'DNSH Durumu', value: r.dnsh_pass ? '✓ Geçti' : '✗ Başarısız', color: r.dnsh_pass ? '#10b981' : '#ef4444' },
            { label: 'Taxonomy Uygun', value: r.taxonomy_eligible ? 'Evet' : 'Hayır', color: '#8b5cf6' },
            { label: 'Taxonomy Hizalı', value: r.taxonomy_aligned ? 'Evet' : 'Kısmi', color: r.taxonomy_aligned ? '#10b981' : '#f59e0b' },
          ].map(k => (
            <div key={k.label} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="text-xl font-bold" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800/50 border border-slate-700 rounded-xl p-1 w-fit">
          {([['dashboard', '📊 Dashboard'], ['objectives', '🎯 6 Hedef'], ['dnsh', '⚠️ DNSH'], ['assess', '⚙️ Değerlendirme']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === id ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── DASHBOARD ─────────────────────────────────────────────────────── */}
        {tab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gauge */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center gap-4">
              <div className="text-sm font-semibold text-slate-300">{r.sector_label} ({r.nace_code})</div>
              <AlignGauge pct={r.overall_alignment_pct} aligned={r.taxonomy_aligned} eligible={r.taxonomy_eligible} />
              <div className="text-xs text-slate-500 text-center">{r.mss_note}</div>
            </div>

            {/* Radar */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <div className="text-sm font-semibold text-slate-300 mb-3">Hedef Performans Radarlı</div>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Radar dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Bar */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <div className="text-sm font-semibold text-slate-300 mb-3">Hedef Uyum Puanları</div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData} layout="vertical" margin={{ left: 80 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                    formatter={(v) => [Number(v ?? 0).toFixed(0) + ' / 100', 'Puan']} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {barData.map((d) => (
                      <Cell key={d.code} fill={OBJ_META[d.code]?.color ?? '#64748b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Gaps */}
            {r.gaps.length > 0 && (
              <div className="md:col-span-3 bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                <div className="text-sm font-semibold text-slate-300 mb-4">⚠️ Eksik Uyum Alanları</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {r.gaps.map(g => (
                    <div key={g.code} className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{g.icon}</span>
                        <span className="font-semibold text-white text-sm">{g.title}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
                        <div className="h-1.5 rounded-full bg-yellow-400" style={{ width: `${g.score}%` }} />
                      </div>
                      <div className="text-xs text-slate-400">{g.score}/100 — {g.threshold}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recs */}
            <div className="md:col-span-3 space-y-2">
              <div className="text-sm font-semibold text-slate-300">🎯 Öneriler</div>
              {r.recommendations.map((rec, i) => (
                <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <p className="text-sm text-slate-300">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── OBJECTIVES ────────────────────────────────────────────────────── */}
        {tab === 'objectives' && (
          <div className="space-y-3">
            {objEntries.map(([code, s]) => {
              const meta = OBJ_META[code] ?? { title: code, icon: '📋', color: '#64748b' }
              return (
                <div key={code} className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border"
                        style={{ backgroundColor: meta.color + '22', borderColor: meta.color + '44' }}>
                        {meta.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{code} — {meta.title}</div>
                        <div className="text-xs text-slate-400">{s.threshold}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xl font-bold" style={{ color: meta.color }}>{s.score}/100</div>
                        <div className="text-xs text-slate-500">{s.unit !== '—' ? s.unit : ''}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${s.aligned ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                        {s.aligned ? '✓ Hizalı' : '✗ Eksik'}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${s.score}%`, backgroundColor: meta.color }} />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-slate-500">
                    <span>Mevcut değer: {s.your_value !== null ? String(s.your_value) : '—'}</span>
                    {s.sector_avg !== null && <span>Sektör ort.: {s.sector_avg}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── DNSH ──────────────────────────────────────────────────────────── */}
        {tab === 'dnsh' && (
          <div className="space-y-4 max-w-2xl">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <div className="text-sm font-semibold text-white mb-4">Önemli Zarar Vermeme (DNSH) Kontrolleri</div>
              <p className="text-sm text-slate-400 mb-4">
                Bir ekonomik faaliyet, aşağıdaki 6 kontrolün tamamından geçmeli ve hiçbirinde önemli zarar yaratmamalıdır.
              </p>
              <div className="space-y-3">
                {r.dnsh_checks.map(c => {
                  const meta = OBJ_META[c.obj] ?? { title: c.obj, icon: '📋', color: '#64748b' }
                  const passed = r.dnsh_pass
                  return (
                    <div key={c.obj} className={`p-4 rounded-xl border flex items-start gap-3 ${passed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                      <span className="text-lg">{meta.icon}</span>
                      <div className="flex-1">
                        <div className="text-xs font-bold mb-1" style={{ color: meta.color }}>{c.obj}</div>
                        <div className="text-sm text-slate-300">{c.q}</div>
                      </div>
                      <span className={`font-bold text-sm ${passed ? 'text-emerald-400' : 'text-red-400'}`}>{passed ? '✓' : '✗'}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-400 space-y-2">
              <div className="font-semibold text-white">📎 Minimum Sosyal Güvenceler (MSS)</div>
              <p>{r.mss_note}</p>
              <p>Tüm faaliyetler için OECD Çok Uluslu Şirketler Rehberi ve BM İş Dünyası ve İnsan Hakları Rehber İlkeleri uyumu gereklidir.</p>
            </div>
          </div>
        )}

        {/* ── ASSESS ────────────────────────────────────────────────────────── */}
        {tab === 'assess' && (
          <div className="max-w-2xl bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Şirket Taxonomy Değerlendirmesi</h2>
              <p className="text-sm text-slate-400">NACE kodunuza göre 6 hedefte uyum skoru hesaplayın.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">NACE Kodu / Sektör</label>
              <select value={form.nace_code} onChange={e => setForm(f => ({ ...f, nace_code: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm">
                {NACE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm text-slate-300 font-medium">Emisyon Yoğunluğu</label>
                <input type="number" step="0.1" value={form.emissions_intensity}
                  onChange={e => setForm(f => ({ ...f, emissions_intensity: Number(e.target.value) }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-slate-300 font-medium">Yenilenebilir Enerji (%)</label>
                <input type="number" min={0} max={100} value={form.renewable_pct}
                  onChange={e => setForm(f => ({ ...f, renewable_pct: Number(e.target.value) }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-slate-300 font-medium">Geri Dönüşüm Oranı (%)</label>
                <input type="number" min={0} max={100} value={form.recycling_rate}
                  onChange={e => setForm(f => ({ ...f, recycling_rate: Number(e.target.value) }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-slate-300 font-medium">Su Yoğunluğu (m³/ton)</label>
                <input type="number" value={form.water_intensity}
                  onChange={e => setForm(f => ({ ...f, water_intensity: Number(e.target.value) }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm" />
              </div>
            </div>

            <div className="space-y-2">
              {([
                ['has_biodiversity_plan', 'Biyoçeşitlilik Planı Var'],
                ['has_pollution_controls', 'Kirlilik Kontrol Sistemi Var'],
                ['climate_adaptation_plan', 'İklim Adaptasyon Planı Var'],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                  <button type="button" onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                    className={`w-10 h-6 rounded-full transition-colors ${form[key] ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                    <span className={`block w-4 h-4 bg-white rounded-full shadow m-1 transition-transform ${form[key] ? 'translate-x-4' : ''}`} />
                  </button>
                  <span className="text-sm text-slate-300">{label}</span>
                </label>
              ))}
            </div>

            <button onClick={runAssessment} disabled={assessing}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {assessing ? <span className="animate-spin">⏳</span> : '🇪🇺'}
              {assessing ? 'Hesaplanıyor…' : 'EU Taxonomy Uyum Puanı Hesapla'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
