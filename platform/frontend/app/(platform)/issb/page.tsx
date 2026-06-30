'use client'
import { useEffect, useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts'
import { api } from '@/lib/api'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Requirement { id: string; ref: string; text: string }
interface Pillar {
  id: string; label: string; icon: string; color: string
  description: string; requirements: Requirement[]
  s1_ref?: string
}
interface CrossMetric {
  id: string; category: string; label: string; unit: string
  ref: string; value: number | null; status: string
}
interface CrosswalkRow {
  tcfd_pillar: string; tcfd_req: string; issb_ref: string
  esrs_ref: string; csrd_aligned: boolean; notes: string
}
interface ScenarioBand {
  id: string; label: string; icon: string; color: string
  transition_risk: string; physical_risk: string; desc: string
}
interface Readiness {
  pillar_scores: Record<string, number>
  overall_score: number
  readiness_label: string; readiness_color: string; readiness_desc: string
  gaps: string[]; disclosure_ready: boolean
}
interface ISSBResult {
  company_name: string; sector: string
  readiness: Readiness
  ghg_summary: { scope1: number; scope2: number; scope3: number; total: number; scope3_pct: number }
  scenario_coverage: number; scenarios_analysed: string[]; scenario_ready: boolean
  has_sbti_target: boolean
  cross_industry_metrics: CrossMetric[]
  recommendations: Array<{ priority: string; ref: string; action: string }>
  s1_pillars: Pillar[]
  s2_pillars: Pillar[]
  tcfd_crosswalk: CrosswalkRow[]
  scenario_bands: ScenarioBand[]
  standards: { s1: string; s2: string; endorsed_by: string; adopted_by: string[]; tcfd_supersedes: boolean }
}

// ── Readiness gauge SVG ───────────────────────────────────────────────────────
function ReadinessGauge({ score, color }: { score: number; color: string }) {
  const r = 56, cx = 70, cy = 70
  const startAngle = Math.PI * 0.75
  const endAngle = Math.PI * 2.25
  const range = endAngle - startAngle
  const fillAngle = startAngle + range * (score / 100)
  const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle)
  const x2 = cx + r * Math.cos(endAngle),   y2 = cy + r * Math.sin(endAngle)
  const xf = cx + r * Math.cos(fillAngle),  yf = cy + r * Math.sin(fillAngle)
  const large = fillAngle - startAngle > Math.PI ? 1 : 0
  const largeBg = endAngle - startAngle > Math.PI ? 1 : 0
  return (
    <svg width={140} height={120} viewBox="0 0 140 120">
      <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeBg} 1 ${x2} ${y2}`}
        fill="none" stroke="#334155" strokeWidth={10} strokeLinecap="round" />
      {score > 0 && (
        <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${xf} ${yf}`}
          fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" />
      )}
      <text x={cx} y={cy + 6}  textAnchor="middle" fill="white"   fontSize={20} fontWeight="bold">{score}</text>
      <text x={cx} y={cy + 22} textAnchor="middle" fill="#94a3b8" fontSize={10}>/100</text>
    </svg>
  )
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = ['Overview', 'S1 Disclosures', 'S2 Climate', 'TCFD Crosswalk'] as const
type Tab = typeof TABS[number]

// ── Priority badge ─────────────────────────────────────────────────────────────
function PriorityBadge({ p }: { p: string }) {
  const map: Record<string, string> = { High: 'bg-red-500/20 text-red-400 border-red-500/30', Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30', Low: 'bg-slate-600 text-slate-400 border-slate-500' }
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${map[p] ?? map.Low}`}>{p}</span>
}

// ── Pillar checklist (S1 or S2) ───────────────────────────────────────────────
function PillarChecklist({ pillars, scores }: { pillars: Pillar[]; scores: Record<string, number> }) {
  return (
    <div className="space-y-5">
      {pillars.map(pillar => {
        const score = scores[pillar.id] ?? 0
        return (
          <div key={pillar.id} className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{pillar.icon}</span>
                <div>
                  <div className="font-bold text-white">{pillar.label}</div>
                  <div className="text-xs text-slate-400">{pillar.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black" style={{ color: pillar.color }}>{score}</div>
                <div className="text-xs text-slate-500">/ 100</div>
              </div>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-700 mb-4">
              <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: pillar.color }} />
            </div>
            <div className="space-y-2">
              {pillar.requirements.map(req => {
                const done = score >= 50
                return (
                  <div key={req.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-700/40">
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${done ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-400'}`}>
                      {done ? '✓' : '○'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-200">{req.text}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{req.ref}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ISSBPage() {
  const [tab, setTab] = useState<Tab>('Overview')
  const [data, setData] = useState<ISSBResult | null>(null)
  const [loading, setLoading] = useState(true)

  // Assessment form
  const [form, setForm] = useState({
    company_name: '', sector: '',
    scope1: '', scope2: '', scope3: '',
    has_sbti: false, exec_linked: false,
    carbon_price: '', scenarios: [] as string[],
  })
  const [assessing, setAssessing] = useState(false)

  useEffect(() => {
    api.issb.demo().then(d => setData(d as ISSBResult)).finally(() => setLoading(false))
  }, [])

  async function handleAssess() {
    setAssessing(true)
    try {
      const res = await api.issb.assess({
        company_name: form.company_name || 'My Company',
        sector: form.sector || 'General',
        scope1_tco2e: parseFloat(form.scope1) || 0,
        scope2_tco2e: parseFloat(form.scope2) || 0,
        scope3_tco2e: parseFloat(form.scope3) || 0,
        has_sbti_target: form.has_sbti,
        exec_pay_linked: form.exec_linked,
        internal_carbon_price: form.carbon_price ? parseFloat(form.carbon_price) : null,
        scenarios_analysed: form.scenarios,
      })
      setData(res as ISSBResult)
      setTab('Overview')
    } finally {
      setAssessing(false)
    }
  }

  function toggleScenario(id: string) {
    setForm(f => ({
      ...f,
      scenarios: f.scenarios.includes(id) ? f.scenarios.filter(s => s !== id) : [...f.scenarios, id],
    }))
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="text-center">
        <div className="text-4xl mb-4">📋</div>
        <div className="text-slate-400">Loading ISSB assessment…</div>
      </div>
    </div>
  )

  const r = data?.readiness

  // Radar data for S1 pillars
  const radarData = r ? [
    { pillar: 'Governance',      score: r.pillar_scores.governance ?? 0 },
    { pillar: 'Strategy',        score: r.pillar_scores.strategy ?? 0 },
    { pillar: 'Risk Mgmt',       score: r.pillar_scores.risk_management ?? 0 },
    { pillar: 'Metrics',         score: r.pillar_scores.metrics_targets ?? 0 },
  ] : []

  const ghg = data?.ghg_summary
  const ghgBar = ghg ? [
    { name: 'Scope 1', value: ghg.scope1, color: '#ef4444' },
    { name: 'Scope 2', value: ghg.scope2, color: '#f59e0b' },
    { name: 'Scope 3', value: ghg.scope3, color: '#6366f1' },
  ] : []

  const SCENARIO_LABELS: Record<string, string> = { '1_5c': '1.5°C', '2c': '2°C', '3c': '3°C', '4c': '4°C+' }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">📋</span>
          <div>
            <h1 className="text-2xl font-black">ISSB IFRS S1 + S2</h1>
            <p className="text-slate-400 text-sm">International Sustainability Standards Board · Global baseline adopted by UK, GCC, Japan, Australia</p>
          </div>
          <div className="ml-auto flex gap-2">
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">S1 2023</span>
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">S2 2023</span>
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">IOSCO Endorsed</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-800 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'Overview' && data && r && (
        <div className="space-y-6">
          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 flex flex-col items-center gap-2">
              <ReadinessGauge score={r.overall_score} color={r.readiness_color} />
              <div className="text-sm font-bold" style={{ color: r.readiness_color }}>{r.readiness_label}</div>
              <div className="text-xs text-slate-400 text-center">{r.readiness_desc}</div>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 flex flex-col justify-between">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total GHG</div>
              <div className="text-3xl font-black text-white">{(data.ghg_summary.total / 1000).toFixed(1)}<span className="text-lg text-slate-400"> ktCO₂e</span></div>
              <div className="text-xs text-slate-400 mt-2">Scope 3 is {data.ghg_summary.scope3_pct}% of total</div>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 flex flex-col justify-between">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Scenarios</div>
              <div className="text-3xl font-black text-white">{data.scenario_coverage}<span className="text-lg text-slate-400"> / 4</span></div>
              <div className={`text-xs mt-2 font-semibold ${data.scenario_ready ? 'text-emerald-400' : 'text-amber-400'}`}>
                {data.scenario_ready ? '✓ 1.5°C included' : '⚠ 1.5°C required by 2027'}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 flex flex-col justify-between">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Disclosure Ready</div>
              <div className={`text-3xl font-black ${r.disclosure_ready ? 'text-emerald-400' : 'text-red-400'}`}>
                {r.disclosure_ready ? 'Yes' : 'No'}
              </div>
              <div className="text-xs text-slate-400 mt-2">{r.disclosure_ready ? 'Score ≥65/100 — proceed to assurance' : 'Score <65 — address gaps first'}</div>
            </div>
          </div>

          {/* Radar + GHG bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-300 mb-4">ISSB Pillar Readiness</h3>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="pillar" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
                  <Radar name="Readiness" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-300 mb-4">GHG Emissions Breakdown</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={ghgBar} margin={{ left: 10 }}>
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} unit=" t" />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                    labelStyle={{ color: '#e2e8f0' }}
                    formatter={(v) => [Number(v ?? 0).toLocaleString('en-GB') + ' tCO₂e', '']}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {ghgBar.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recommendations */}
          {data.recommendations.length > 0 && (
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-300 mb-4">Priority Actions</h3>
              <div className="space-y-3">
                {data.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-700/40">
                    <PriorityBadge p={rec.priority} />
                    <div className="flex-1">
                      <div className="text-sm text-slate-200">{rec.action}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{rec.ref}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Standards info */}
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <div className="font-bold text-indigo-300 mb-1">About ISSB Standards</div>
                <div className="text-sm text-slate-300 mb-2">{data.standards.s1}</div>
                <div className="text-sm text-slate-300 mb-3">{data.standards.s2}</div>
                <div className="flex flex-wrap gap-2">
                  {data.standards.adopted_by.map(j => (
                    <span key={j} className="px-2 py-1 rounded-lg text-xs bg-slate-700 text-slate-300">{j}</span>
                  ))}
                </div>
                {data.standards.tcfd_supersedes && (
                  <div className="mt-3 text-xs text-amber-400 font-medium">⚠ TCFD has been dissolved (2023) — ISSB S2 is now the authoritative successor</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── S1 Disclosures ── */}
      {tab === 'S1 Disclosures' && data && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
            <p className="text-slate-400 text-sm">
              <strong className="text-white">IFRS S1</strong> requires entities to disclose material sustainability-related risks and opportunities across 4 pillars. Use these checklists to identify disclosure gaps.
            </p>
          </div>
          <PillarChecklist pillars={data.s1_pillars} scores={data.readiness.pillar_scores} />
        </div>
      )}

      {/* ── S2 Climate ── */}
      {tab === 'S2 Climate' && data && (
        <div className="space-y-6">
          {/* Scenario bands */}
          <div>
            <h3 className="text-sm font-bold text-slate-300 mb-3">Climate Scenarios (S2.10c)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {data.scenario_bands.map(s => {
                const active = data.scenarios_analysed.includes(s.id)
                return (
                  <div key={s.id} className={`rounded-2xl border p-4 ${active ? 'border-opacity-100' : 'border-slate-700 opacity-50'}`}
                    style={active ? { borderColor: s.color, background: s.color + '10' } : {}}>
                    <div className="text-xl mb-2">{s.icon}</div>
                    <div className="font-bold text-sm text-white">{s.label}</div>
                    <div className="text-xs text-slate-400 mt-1 mb-3">{s.desc}</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between"><span className="text-slate-500">Transition risk</span><span className="font-medium text-white">{s.transition_risk}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Physical risk</span><span className="font-medium text-white">{s.physical_risk}</span></div>
                    </div>
                    {active && <div className="mt-2 text-xs font-bold" style={{ color: s.color }}>✓ Analysed</div>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Cross-industry metrics */}
          <div>
            <h3 className="text-sm font-bold text-slate-300 mb-3">Cross-Industry Metrics (S2.29)</h3>
            <div className="rounded-2xl border border-slate-700 bg-slate-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-700/40">
                    <th className="text-left px-4 py-3 text-xs text-slate-400 font-semibold">Metric</th>
                    <th className="text-left px-4 py-3 text-xs text-slate-400 font-semibold">Category</th>
                    <th className="text-left px-4 py-3 text-xs text-slate-400 font-semibold">Value</th>
                    <th className="text-left px-4 py-3 text-xs text-slate-400 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.cross_industry_metrics.map(m => (
                    <tr key={m.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="px-4 py-3">
                        <div className="text-slate-200 font-medium">{m.label}</div>
                        <div className="text-xs text-slate-500">{m.ref} · {m.unit}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{m.category}</td>
                      <td className="px-4 py-3 text-slate-300 font-mono text-sm">
                        {m.value != null ? Number(m.value).toLocaleString('en-GB') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${m.status === 'disclosed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-600 text-slate-400 border-slate-500'}`}>
                          {m.status === 'disclosed' ? '✓ Disclosed' : 'Not disclosed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* S2 pillar checklist */}
          <div>
            <h3 className="text-sm font-bold text-slate-300 mb-3">S2 Disclosure Pillars</h3>
            <PillarChecklist pillars={data.s2_pillars} scores={data.readiness.pillar_scores} />
          </div>
        </div>
      )}

      {/* ── TCFD Crosswalk ── */}
      {tab === 'TCFD Crosswalk' && data && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="text-sm text-amber-300 font-medium mb-1">TCFD → ISSB S2 — Direct mapping</div>
            <p className="text-slate-400 text-xs">TCFD was dissolved in October 2023. ISSB S2 supersedes TCFD with full backward compatibility — all TCFD disclosures map 1:1 to ISSB S2 requirements below.</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-700/40">
                  <th className="text-left px-4 py-3 text-xs text-slate-400 font-semibold w-24">TCFD Pillar</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-400 font-semibold">TCFD Requirement</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-400 font-semibold w-32">ISSB Ref</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-400 font-semibold w-32">ESRS Ref</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-400 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {data.tcfd_crosswalk.map((row, i) => (
                  <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {row.tcfd_pillar}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{row.tcfd_req}</td>
                    <td className="px-4 py-3 font-mono text-xs text-indigo-400">{row.issb_ref}</td>
                    <td className="px-4 py-3 font-mono text-xs text-emerald-400">{row.esrs_ref}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Assess form */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
            <h3 className="text-sm font-bold text-slate-300 mb-4">Run Your ISSB Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company Name</label>
                <input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                  placeholder="e.g. Meridian Energy PLC"
                  className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sector</label>
                <input value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}
                  placeholder="e.g. Energy / Utilities"
                  className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scope 1 (tCO₂e)</label>
                <input type="number" value={form.scope1} onChange={e => setForm(f => ({ ...f, scope1: e.target.value }))}
                  placeholder="e.g. 12400"
                  className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scope 2 (tCO₂e)</label>
                <input type="number" value={form.scope2} onChange={e => setForm(f => ({ ...f, scope2: e.target.value }))}
                  placeholder="e.g. 3850"
                  className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scope 3 (tCO₂e)</label>
                <input type="number" value={form.scope3} onChange={e => setForm(f => ({ ...f, scope3: e.target.value }))}
                  placeholder="e.g. 48200"
                  className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Internal Carbon Price (£/tCO₂e)</label>
                <input type="number" value={form.carbon_price} onChange={e => setForm(f => ({ ...f, carbon_price: e.target.value }))}
                  placeholder="e.g. 45 (optional)"
                  className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Scenarios Analysed</label>
              <div className="flex flex-wrap gap-2">
                {[['1_5c', '1.5°C'], ['2c', '2°C'], ['3c', '3°C'], ['4c', '4°C+']] .map(([id, label]) => (
                  <button key={id} onClick={() => toggleScenario(id)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${form.scenarios.includes(id) ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-slate-700 border-slate-600 text-slate-400 hover:text-white'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.has_sbti} onChange={e => setForm(f => ({ ...f, has_sbti: e.target.checked }))}
                  className="w-4 h-4 rounded accent-indigo-500" />
                <span className="text-sm text-slate-300">SBTi-validated target</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.exec_linked} onChange={e => setForm(f => ({ ...f, exec_linked: e.target.checked }))}
                  className="w-4 h-4 rounded accent-indigo-500" />
                <span className="text-sm text-slate-300">Executive pay linked to climate</span>
              </label>
            </div>

            <button onClick={handleAssess} disabled={assessing}
              className="mt-4 w-full py-3 rounded-2xl text-white font-bold text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 transition-all">
              {assessing ? 'Assessing…' : 'Run ISSB S1+S2 Assessment →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
