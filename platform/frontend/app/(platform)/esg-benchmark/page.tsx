'use client'
import { useEffect, useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts'
import { api } from '@/lib/api'

interface RadarRow { dimension: string; icon: string; company: number; sector_avg: number; best_in_class: number }
interface GapRow { dimension: string; gap_to_sector: number; gap_to_best: number }
interface BenchmarkResult {
  company_name: string; sector: string
  radar_data: RadarRow[]
  overall: { company: number; sector_avg: number; best_in_class: number }
  gaps: GapRow[]
  framework_scores: Record<string, number>
  dimensions: Array<{ id: string; label: string; icon: string; weight: number; sources: string[] }>
  percentile: number
}

const TABS = ['Benchmark Radar', 'Framework Scores', 'Gap Analysis', 'Assess'] as const
type Tab = typeof TABS[number]

// ── Score ring SVG ─────────────────────────────────────────────────────────────
function ScoreRing({ score, max, color, label, sublabel }: { score: number; max: number; color: string; label: string; sublabel: string }) {
  const r = 42, cx = 56, cy = 56
  const circ = 2 * Math.PI * r
  const fill = circ * (score / max)
  return (
    <svg width={112} height={112} viewBox="0 0 112 112">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={10} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy - 4} textAnchor="middle" fill="white"   fontSize={18} fontWeight="bold">{score}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#94a3b8" fontSize={9}>{sublabel}</text>
    </svg>
  )
}

export default function ESGBenchmarkPage() {
  const [tab, setTab] = useState<Tab>('Benchmark Radar')
  const [data, setData] = useState<BenchmarkResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ company_name: '', sector: 'manufacturing' })
  const [assessing, setAssessing] = useState(false)

  useEffect(() => {
    api.esgBenchmark.demo().then(d => setData(d as BenchmarkResult)).finally(() => setLoading(false))
  }, [])

  async function handleAssess() {
    setAssessing(true)
    try {
      const res = await api.esgBenchmark.assess({
        company_name: form.company_name || 'My Company',
        sector: form.sector,
        company_scores: {},
      })
      setData(res as BenchmarkResult); setTab('Benchmark Radar')
    } finally { setAssessing(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="text-center"><div className="text-4xl mb-4">📈</div><div className="text-slate-400">Benchmark yükleniyor…</div></div>
    </div>
  )
  if (!data) return null

  const fwBar = Object.entries(data.framework_scores)
    .sort((a, b) => b[1] - a[1])
    .map(([name, score]) => ({ name, score, color: score >= 70 ? '#10b981' : score >= 55 ? '#f59e0b' : '#ef4444' }))

  const gapBar = data.gaps.map(g => ({
    name: g.dimension, gap_to_sector: g.gap_to_sector, gap_to_best: g.gap_to_best,
  }))

  const SECTORS = ['banking', 'manufacturing', 'energy', 'retail', 'tech']

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📈</span>
          <div>
            <h1 className="text-2xl font-black">ESG Benchmark</h1>
            <p className="text-slate-400 text-sm">Şirket / Sektör Ortalaması / Best-in-Class · 8 boyut · 13 framework skorundan oluşan yatırımcı özeti</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400">Sektör Yüzdeliği</div>
            <div className="text-2xl font-black text-emerald-400">{data.percentile}%</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-800 rounded-xl p-1 w-fit flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}>{t}</button>
        ))}
      </div>

      {/* ── Benchmark Radar ── */}
      {tab === 'Benchmark Radar' && (
        <div className="space-y-6">
          {/* 3 overall score rings */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 flex flex-col items-center gap-2">
              <ScoreRing score={data.overall.company} max={100} color="#10b981" label={data.company_name} sublabel="Company" />
              <div className="text-xs font-bold text-emerald-400 text-center">{data.company_name}</div>
            </div>
            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-5 flex flex-col items-center gap-2">
              <ScoreRing score={data.overall.sector_avg} max={100} color="#3b82f6" label="Sector" sublabel="Sector Avg" />
              <div className="text-xs font-bold text-blue-400 text-center capitalize">{data.sector} average</div>
            </div>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 flex flex-col items-center gap-2">
              <ScoreRing score={data.overall.best_in_class} max={100} color="#f59e0b" label="Best" sublabel="Best-in-Class" />
              <div className="text-xs font-bold text-amber-400 text-center">Best-in-class</div>
            </div>
          </div>

          {/* 3-series radar */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
            <h3 className="text-sm font-bold text-slate-300 mb-4">3-Series ESG Radar</h3>
            <ResponsiveContainer width="100%" height={340}>
              <RadarChart data={data.radar_data}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
                <Radar name={data.company_name} dataKey="company"       stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                <Radar name="Sector Average"    dataKey="sector_avg"    stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 2" />
                <Radar name="Best-in-Class"     dataKey="best_in_class" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.05} strokeWidth={1.5} strokeDasharray="2 2" />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Dimension table */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-700/40">
                  <th className="text-left px-5 py-3 text-xs text-slate-400 font-semibold">Dimension</th>
                  <th className="text-center px-4 py-3 text-xs text-emerald-400 font-semibold">Company</th>
                  <th className="text-center px-4 py-3 text-xs text-blue-400 font-semibold">Sector Avg</th>
                  <th className="text-center px-4 py-3 text-xs text-amber-400 font-semibold">Best-in-Class</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-400 font-semibold">vs. Sector</th>
                </tr>
              </thead>
              <tbody>
                {data.radar_data.map(row => {
                  const diff = row.company - row.sector_avg
                  return (
                    <tr key={row.dimension} className="border-b border-slate-700/40 hover:bg-slate-700/20">
                      <td className="px-5 py-3 flex items-center gap-2"><span>{row.icon}</span><span className="text-slate-200 font-medium">{row.dimension}</span></td>
                      <td className="px-4 py-3 text-center font-black" style={{ color: '#10b981' }}>{row.company}</td>
                      <td className="px-4 py-3 text-center text-blue-400 font-bold">{row.sector_avg}</td>
                      <td className="px-4 py-3 text-center text-amber-400 font-bold">{row.best_in_class}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${diff >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {diff >= 0 ? '+' : ''}{diff}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Framework Scores ── */}
      {tab === 'Framework Scores' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
            <h3 className="text-sm font-bold text-slate-300 mb-4">All Framework Scores</h3>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={fwBar} layout="vertical" margin={{ left: 110 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={110} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} labelStyle={{ color: '#e2e8f0' }} formatter={(v) => [Number(v ?? 0) + '/100', 'Score']} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {fwBar.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Score legend */}
          <div className="flex gap-4 flex-wrap text-xs">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-slate-400">≥ 70 — Advanced</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-slate-400">55–69 — Established</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-slate-400">{'< 55'} — Developing</span></div>
          </div>
        </div>
      )}

      {/* ── Gap Analysis ── */}
      {tab === 'Gap Analysis' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
            <h3 className="text-sm font-bold text-slate-300 mb-1">Top Priority Gaps vs. Sector Average</h3>
            <p className="text-slate-500 text-xs mb-4">Dimensions where company score is below sector average — highest improvement potential first</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={gapBar}>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} labelStyle={{ color: '#e2e8f0' }} formatter={(v) => [Number(v ?? 0) + ' points', '']} />
                <Bar dataKey="gap_to_sector" name="Gap to Sector Avg" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gap_to_best"   name="Gap to Best-in-Class" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gap detail cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.gaps.map((g, i) => (
              <div key={i} className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
                <div className="font-bold text-white mb-3">{g.dimension}</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Gap to sector avg</span>
                    <span className="font-bold text-blue-400">+{g.gap_to_sector} points needed</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Gap to best-in-class</span>
                    <span className="font-bold text-amber-400">+{g.gap_to_best} points needed</span>
                  </div>
                  <div className="mt-2 w-full h-2 rounded-full bg-slate-700">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.max(5, 100 - g.gap_to_best)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Assess ── */}
      {tab === 'Assess' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Şirket Adı</label>
              <input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} placeholder="örn. Arçelik A.Ş."
                className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sektör</label>
              <select value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}
                className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {SECTORS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
            <p className="text-slate-400 text-sm">Platform modül skorlarınız otomatik olarak çekilecektir. Demo modunda sektör ortalaması kullanılır.</p>
          </div>
          <button onClick={handleAssess} disabled={assessing}
            className="w-full py-3.5 rounded-2xl text-white font-black text-base bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-all">
            {assessing ? 'Hesaplanıyor…' : 'ESG Benchmark Raporunu Oluştur →'}
          </button>
        </div>
      )}
    </div>
  )
}
