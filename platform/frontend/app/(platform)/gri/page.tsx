'use client'
import { useEffect, useState } from 'react'
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts'
import { api } from '@/lib/api'

// ── Types ─────────────────────────────────────────────────────────────────────
interface GRIDisclosure {
  id: string; title: string; required: boolean; esrs: string | null; completed: boolean
}
interface GRIStandard {
  code: string; title: string; year: number; icon: string; color: string
  category: string; weight: number
  required_count: number; completed_required: number; completed_all: number; total_disclosures: number
  required_pct: number; all_pct: number
  disclosures: GRIDisclosure[]
}
interface GRIGap {
  standard_code: string; standard_title: string; icon: string; color: string
  missing_count: number; required_pct: number; top_missing: string[]
}
interface GRIResult {
  total_required: number; completed_required: number
  total_disclosures: number; completed_all: number
  overall_required_pct: number; overall_pct: number
  grade: string; grade_color: string
  standards: GRIStandard[]
  gaps: GRIGap[]
  esrs_crosswalk: Array<{ gri: string; gri_title: string; esrs: string }>
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const CAT_LABEL: Record<string, string> = { universal: 'Evrensel', environment: 'Çevre', social: 'Sosyal', governance: 'Yönetim' }
const CAT_COLOR: Record<string, string> = { universal: '#10b981', environment: '#3b82f6', social: '#ec4899', governance: '#8b5cf6' }

// ── Main ──────────────────────────────────────────────────────────────────────
export default function GRIPage() {
  const [result, setResult] = useState<GRIResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'standards' | 'gaps' | 'crosswalk'>('overview')
  const [expandedStd, setExpandedStd] = useState<string | null>(null)
  const [localCompleted, setLocalCompleted] = useState<Set<string>>(new Set())
  const [maturity, setMaturity] = useState(58)

  useEffect(() => {
    api.gri.demo().then(d => {
      const r = d as GRIResult
      setResult(r)
      const done = new Set<string>()
      r.standards.forEach(s => s.disclosures.forEach(d => { if (d.completed) done.add(d.id) }))
      setLocalCompleted(done)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  function toggleDisclosure(id: string) {
    setLocalCompleted(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function recalculate() {
    try {
      const d = await api.gri.assess({ completed_ids: Array.from(localCompleted), maturity_score: maturity })
      setResult(d as GRIResult)
    } catch { /* demo fallback */ }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-emerald-400 animate-pulse">GRI değerlendirmesi yükleniyor…</div>
    </div>
  )

  const r = result!
  const barData = r.standards.map(s => ({ code: s.code, req: s.required_pct, all: s.all_pct, color: s.color }))
  const radialData = [{ name: 'Zorunlu', value: r.overall_required_pct, fill: r.grade_color }]

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xl">📖</div>
          <div>
            <h1 className="text-xl font-bold text-white">GRI Universal Standards 2021</h1>
            <p className="text-xs text-slate-400">GRI 2 · GRI 3 · GRI 302 · GRI 303 · GRI 305 · GRI 306 · GRI 401 · GRI 403 — İfşaat Takip Sistemi</p>
          </div>
          <div className="ml-auto flex gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">GRI 2021</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">Sprint 34</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Genel Uyum', value: `%${r.overall_required_pct}`, color: r.grade_color },
            { label: 'Zorunlu İfşaat', value: `${r.completed_required}/${r.total_required}`, color: '#10b981' },
            { label: 'Tüm İfşaatlar', value: `${r.completed_all}/${r.total_disclosures}`, color: '#3b82f6' },
            { label: 'GRI Notu', value: r.grade.split(' ')[0], color: r.grade_color },
            { label: 'ESRS Haritalama', value: `${r.esrs_crosswalk.length} eşleşme`, color: '#8b5cf6' },
          ].map(k => (
            <div key={k.label} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="text-xl font-bold" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Grade banner */}
        <div className="rounded-xl border p-4 flex items-center gap-4" style={{ backgroundColor: r.grade_color + '18', borderColor: r.grade_color + '44' }}>
          <div className="text-3xl font-black" style={{ color: r.grade_color }}>{r.grade.split('(')[1]?.replace(')', '') ?? 'D'}</div>
          <div>
            <div className="font-semibold text-white">{r.grade}</div>
            <div className="text-sm text-slate-400">Zorunlu ifşaatların %{r.overall_required_pct}'i tamamlandı · Tüm ifşaatların %{r.overall_pct}'i tamamlandı</div>
          </div>
          <div className="ml-auto flex gap-2 items-center">
            <span className="text-sm text-slate-400">Olgunluk: {maturity}</span>
            <input type="range" min={0} max={100} value={maturity} onChange={e => setMaturity(Number(e.target.value))} className="w-24 accent-emerald-500" />
            <button onClick={recalculate} className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-sm hover:bg-emerald-500/30 transition-all">
              Hesapla
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800/50 border border-slate-700 rounded-xl p-1 w-fit">
          {([['overview', '📊 Genel Bakış'], ['standards', '📋 Standartlar'], ['gaps', '🔴 Açıklar'], ['crosswalk', '🔗 ESRS Haritalama']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === id ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ─────────────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Radial gauge */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 flex flex-col items-center justify-center">
              <div className="text-sm font-semibold text-slate-300 mb-4">Zorunlu İfşaat Tamamlanma Oranı</div>
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart innerRadius={60} outerRadius={90} data={radialData} startAngle={180} endAngle={0}>
                  <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#1e293b' }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="text-4xl font-black -mt-8" style={{ color: r.grade_color }}>%{r.overall_required_pct}</div>
              <div className="text-sm text-slate-400 mt-1">Zorunlu GRI İfşaatları</div>
            </div>

            {/* Bar chart */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <div className="text-sm font-semibold text-slate-300 mb-4">Standart Bazlı Tamamlanma (%)</div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData} layout="vertical" margin={{ left: 50 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis type="category" dataKey="code" tick={{ fill: '#94a3b8', fontSize: 11 }} width={55} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                    formatter={(v) => [Number(v ?? 0).toFixed(0) + '%', 'Zorunlu Tamamlama']} />
                  <Bar dataKey="req" radius={[0, 4, 4, 0]}>
                    {barData.map(d => <Cell key={d.code} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Standard summary cards */}
            <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
              {r.standards.map(s => (
                <div key={s.code} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4" style={{ borderLeftColor: s.color, borderLeftWidth: 3 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">{s.icon}</span>
                    <span className="text-xs font-bold text-slate-300">{s.code}</span>
                    <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: s.color + '22', color: s.color }}>
                      {CAT_LABEL[s.category]}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mb-2 truncate">{s.title}</div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5 mb-1">
                    <div className="h-1.5 rounded-full" style={{ width: `${s.required_pct}%`, backgroundColor: s.color }} />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: s.color }}>{s.required_pct}%</span>
                    <span className="text-slate-500">{s.completed_required}/{s.required_count} zorunlu</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STANDARDS ────────────────────────────────────────────────────── */}
        {tab === 'standards' && (
          <div className="space-y-3">
            {r.standards.map(std => (
              <div key={std.code} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedStd(expandedStd === std.code ? null : std.code)}
                  className="w-full px-5 py-4 flex items-center gap-4 hover:bg-slate-700/30 transition-colors"
                >
                  <span className="text-xl">{std.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-white">{std.code} — {std.title} <span className="text-xs text-slate-500">({std.year})</span></div>
                    <div className="text-xs text-slate-500 mt-0.5">{std.total_disclosures} ifşaat · {std.required_count} zorunlu · Ağırlık %{std.weight}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-bold" style={{ color: std.color }}>{std.required_pct}%</div>
                      <div className="text-xs text-slate-500">{std.completed_required}/{std.required_count}</div>
                    </div>
                    <span className="text-slate-400 text-sm">{expandedStd === std.code ? '▲' : '▼'}</span>
                  </div>
                </button>

                {expandedStd === std.code && (
                  <div className="border-t border-slate-700 divide-y divide-slate-800">
                    {std.disclosures.map(d => {
                      const isComplete = localCompleted.has(d.id)
                      return (
                        <div key={d.id} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-700/20 transition-colors">
                          <button onClick={() => toggleDisclosure(d.id)}
                            className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-all ${isComplete ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'}`}>
                            {isComplete && <span className="text-white text-xs font-bold">✓</span>}
                          </button>
                          <span className="text-xs font-mono text-emerald-400 w-14 flex-shrink-0">{d.id}</span>
                          <span className="flex-1 text-sm text-slate-300">{d.title}</span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {d.required && <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">Zorunlu</span>}
                            {d.esrs && <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">{d.esrs}</span>}
                          </div>
                        </div>
                      )
                    })}
                    <div className="px-5 py-3 flex justify-end">
                      <button onClick={recalculate} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all">
                        Puanı Güncelle
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── GAPS ─────────────────────────────────────────────────────────── */}
        {tab === 'gaps' && (
          <div className="space-y-3 max-w-3xl">
            {r.gaps.length === 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-8 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <div className="text-emerald-400 font-semibold">Tüm zorunlu GRI ifşaatları tamamlandı!</div>
              </div>
            )}
            {r.gaps.map(g => (
              <div key={g.standard_code} className="bg-slate-800/50 border border-red-500/20 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{g.icon}</span>
                    <div>
                      <div className="font-semibold text-white">{g.standard_code} — {g.standard_title}</div>
                      <div className="text-xs text-slate-500">{g.missing_count} zorunlu ifşaat eksik</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-red-400">{g.required_pct}%</div>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5 mb-3">
                  <div className="h-1.5 rounded-full bg-red-500" style={{ width: `${g.required_pct}%` }} />
                </div>
                <div className="space-y-1">
                  {g.top_missing.map((m, i) => (
                    <div key={i} className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      {m}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── CROSSWALK ────────────────────────────────────────────────────── */}
        {tab === 'crosswalk' && (
          <div className="space-y-4">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-sm text-purple-300">
              <span className="font-bold text-purple-400">GRI → ESRS Haritalama:</span> Tamamladığınız GRI ifşaatları hangi CSRD/ESRS gerekliliklerini karşılıyor.
              {r.esrs_crosswalk.length} GRI ifşaatı {new Set(r.esrs_crosswalk.map(c => c.esrs)).size} farklı ESRS gereksinimi karşılıyor.
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    {['GRI İfşaat', 'Başlık', 'ESRS Eşleme'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {r.esrs_crosswalk.map(c => (
                    <tr key={c.gri} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-emerald-400">{c.gri}</td>
                      <td className="px-4 py-3 text-slate-300 text-sm">{c.gri_title}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">{c.esrs}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
