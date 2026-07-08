'use client'
import { useEffect, useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts'
import { api } from '@/lib/api'

// ── Types ─────────────────────────────────────────────────────────────────────
interface NatureDep { id: string; title: string; icon: string; driver: string; score: number; level: string; color: string }
interface LeapPhase { id: string; title: string; tr: string; icon: string; color: string; description: string; steps: string[]; tools: string[]; progress: number }
interface TNFDDisclosure { id: string; pillar: string; pillar_icon: string; pillar_color: string; title: string; description: string; esrs: string | null; gri: string | null; completed: boolean }
interface TNFDResult {
  sector: string; overall_readiness_pct: number; disclosure_pct: number
  completed_disclosures: number; total_disclosures: number
  leap_progress: Record<string, number>; leap_avg: number
  nature_dependencies: NatureDep[]
  top_nature_risks: (NatureDep & { description: string })[]
  leap_phases: LeapPhase[]
  disclosures: TNFDDisclosure[]
  recommendations: string[]
  sbtn_note: string
}

// ── Config ────────────────────────────────────────────────────────────────────
const SECTORS = ['tekstil', 'gıda', 'inşaat', 'enerji', 'kimya', 'finans', 'perakende', 'ulaşım', 'manufacturing']

const PILLARS = ['Yönetişim', 'Strateji', 'Risk & Etki Yönetimi', 'Metrik & Hedefler']
const PILLAR_COLORS: Record<string, string> = {
  'Yönetişim': '#10b981', 'Strateji': '#3b82f6', 'Risk & Etki Yönetimi': '#f59e0b', 'Metrik & Hedefler': '#8b5cf6',
}

// ── Readiness Gauge ────────────────────────────────────────────────────────────
function ReadinessGauge({ pct }: { pct: number }) {
  const r = 42; const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  const color = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444'
  return (
    <svg width={110} height={110} viewBox="0 0 110 110">
      <circle cx={55} cy={55} r={r} fill="none" stroke="#1e293b" strokeWidth={12} />
      <circle cx={55} cy={55} r={r} fill="none" stroke={color} strokeWidth={12}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform="rotate(-90 55 55)" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      <text x={55} y={50} textAnchor="middle" fill={color} fontSize={20} fontWeight="bold">{pct}%</text>
      <text x={55} y={65} textAnchor="middle" fill="#64748b" fontSize={10}>Hazırlık</text>
    </svg>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function TNFDPage() {
  const [result, setResult] = useState<TNFDResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'dashboard' | 'leap' | 'disclosures' | 'risks'>('dashboard')
  const [sector, setSector] = useState('tekstil')
  const [localCompleted, setLocalCompleted] = useState<Set<string>>(new Set(['G-A', 'G-B', 'S-A', 'R-A', 'M-A']))
  const [leapProgress, setLeapProgress] = useState<Record<string, number>>({ L: 65, E: 40, A: 25, P: 15 })
  const [assessing, setAssessing] = useState(false)

  useEffect(() => {
    api.tnfd.demo().then(d => { setResult(d as TNFDResult); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  async function runAssessment() {
    setAssessing(true)
    try {
      const d = await api.tnfd.assess({ sector, completed_disclosures: Array.from(localCompleted), leap_progress: leapProgress })
      setResult(d as TNFDResult)
      setTab('dashboard')
    } catch { /* demo */ } finally { setAssessing(false) }
  }

  function toggleDisclosure(id: string) {
    setLocalCompleted(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-emerald-400 animate-pulse">TNFD değerlendirmesi yükleniyor…</div>
    </div>
  )

  const r = result!
  const radarData = r.nature_dependencies.map(d => ({ subject: d.driver, score: d.score, fullMark: 100 }))
  const barData = r.nature_dependencies.map(d => ({ name: d.title.split(' ')[0], score: d.score, color: d.color }))

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-xl">🌿</div>
          <div>
            <h1 className="text-xl font-bold text-white">TNFD v1.0 — Doğa Riski İfşaatları</h1>
            <p className="text-xs text-slate-400">LEAP Yaklaşımı · 14 Tavsiye Edilen İfşaat · 4 Sütun (Yönetişim / Strateji / Risk / Metrik)</p>
          </div>
          <div className="ml-auto flex gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">TNFD v1.0</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">Sprint 34</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Genel Hazırlık', value: `%${r.overall_readiness_pct}`, color: r.overall_readiness_pct >= 60 ? '#10b981' : '#f59e0b' },
            { label: 'İfşaat Tamamlama', value: `%${r.disclosure_pct}`, color: '#3b82f6' },
            { label: 'Tamamlanan İfşaat', value: `${r.completed_disclosures}/${r.total_disclosures}`, color: '#10b981' },
            { label: 'LEAP Ortalama', value: `%${r.leap_avg}`, color: '#8b5cf6' },
            { label: 'En Yüksek Risk', value: r.top_nature_risks[0]?.title.split(' ')[0] ?? '—', color: '#ef4444' },
          ].map(k => (
            <div key={k.label} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="text-xl font-bold" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800/50 border border-slate-700 rounded-xl p-1 w-fit">
          {([['dashboard', '📊 Dashboard'], ['leap', '🔄 LEAP Süreci'], ['disclosures', '📋 14 İfşaat'], ['risks', '⚙️ Değerlendirme']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === id ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── DASHBOARD ─────────────────────────────────────────────────────── */}
        {tab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gauge + top risks */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col items-center gap-4">
              <div className="text-sm font-semibold text-slate-300">{r.sector} — TNFD Hazırlık</div>
              <ReadinessGauge pct={r.overall_readiness_pct} />
              <div className="w-full space-y-2">
                {r.top_nature_risks.map(risk => (
                  <div key={risk.id} className="flex items-center gap-2">
                    <span className="text-sm">{risk.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-slate-300">{risk.driver}</span>
                        <span style={{ color: risk.color }}>{risk.score}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${risk.score}%`, backgroundColor: risk.color }} />
                      </div>
                    </div>
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: risk.color + '22', color: risk.color }}>{risk.level}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar — nature deps */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <div className="text-sm font-semibold text-slate-300 mb-3">Doğa Bağımlılık Profili (IPBES)</div>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Radar dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Bar — per risk */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <div className="text-sm font-semibold text-slate-300 mb-3">Biyoçeşitlilik Risk Baskıları</div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData} layout="vertical" margin={{ left: 60 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={60} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                    formatter={(v) => [Number(v ?? 0).toFixed(0) + ' / 100', 'Risk']} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {barData.map(d => <Cell key={d.name} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recommendations */}
            <div className="md:col-span-3 space-y-2">
              <div className="text-sm font-semibold text-slate-300">🎯 TNFD Uygulama Önerileri</div>
              {r.recommendations.map((rec, i) => (
                <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <p className="text-sm text-slate-300">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LEAP ─────────────────────────────────────────────────────────── */}
        {tab === 'leap' && (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-sm text-green-300">
              <span className="font-bold text-green-400">LEAP Yaklaşımı</span> — TNFD'nin doğayla ilgili riskleri değerlendirmek için tavsiye ettiği 4 aşamalı metodoloji.
              Her aşamada ilerleme kaydettikçe TNFD ifşaat hazırlığı artar.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {r.leap_phases.map(phase => (
                <div key={phase.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border"
                        style={{ backgroundColor: phase.color + '22', borderColor: phase.color + '44' }}>
                        {phase.icon}
                      </div>
                      <div>
                        <div className="font-bold text-white">{phase.id} — {phase.title}</div>
                        <div className="text-xs text-slate-400">{phase.tr}</div>
                      </div>
                    </div>
                    <div className="text-2xl font-black" style={{ color: phase.color }}>{phase.progress}%</div>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${phase.progress}%`, backgroundColor: phase.color }} />
                  </div>
                  <p className="text-sm text-slate-400">{phase.description}</p>
                  <div className="space-y-1">
                    {phase.steps.map((s, i) => (
                      <div key={i} className="text-xs text-slate-500 flex items-start gap-2">
                        <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: phase.color }} />
                        {s}
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-700">
                    <div className="text-xs text-slate-500 font-semibold mb-1">Araçlar:</div>
                    {phase.tools.map((t, i) => (
                      <div key={i} className="text-xs text-slate-400">• {t}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-400">
              <div className="font-semibold text-white mb-1">🔗 SBTN Entegrasyonu</div>
              <p>{r.sbtn_note}</p>
            </div>
          </div>
        )}

        {/* ── DISCLOSURES ───────────────────────────────────────────────────── */}
        {tab === 'disclosures' && (
          <div className="space-y-4">
            {PILLARS.map(pillar => {
              const items = r.disclosures.filter(d => d.pillar === pillar)
              const color = PILLAR_COLORS[pillar] ?? '#64748b'
              const compCount = items.filter(d => localCompleted.has(d.id)).length
              return (
                <div key={pillar} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between"
                    style={{ borderLeftColor: color, borderLeftWidth: 4 }}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{items[0]?.pillar_icon}</span>
                      <div>
                        <div className="font-semibold text-white">{pillar}</div>
                        <div className="text-xs text-slate-500">{items.length} ifşaat</div>
                      </div>
                    </div>
                    <div className="text-sm font-bold" style={{ color }}>{compCount}/{items.length} tamamlandı</div>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {items.map(d => {
                      const isDone = localCompleted.has(d.id)
                      return (
                        <div key={d.id} className="px-5 py-4 flex items-start gap-3">
                          <button onClick={() => toggleDisclosure(d.id)}
                            className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${isDone ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'}`}>
                            {isDone && <span className="text-white text-xs">✓</span>}
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-mono font-bold" style={{ color }}>{d.id}</span>
                              <span className="font-medium text-sm text-white">{d.title}</span>
                            </div>
                            <div className="text-xs text-slate-500 mb-1.5">{d.description}</div>
                            <div className="flex gap-2">
                              {d.esrs && <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">{d.esrs}</span>}
                              {d.gri && <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">{d.gri}</span>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
            <div className="flex justify-end">
              <button onClick={runAssessment} disabled={assessing}
                className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold transition-all disabled:opacity-60">
                {assessing ? '⏳ Hesaplanıyor…' : '🌿 TNFD Puanı Güncelle'}
              </button>
            </div>
          </div>
        )}

        {/* ── ASSESSMENT ───────────────────────────────────────────────────── */}
        {tab === 'risks' && (
          <div className="max-w-xl bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Sektör Değerlendirmesi</h2>
              <p className="text-sm text-slate-400">Sektörünüzü seçin ve LEAP ilerlemenizi girin.</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Sektör</label>
              <select value={sector} onChange={e => setSector(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500 text-sm">
                {SECTORS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300">LEAP Aşama İlerlemesi (%)</label>
              {(['L', 'E', 'A', 'P'] as const).map((phase, i) => {
                const labels = ['L — Konumlandır (Locate)', 'E — Değerlendir (Evaluate)', 'A — Risk Değerlendirmesi (Assess)', 'P — Hazırlan (Prepare)']
                return (
                  <div key={phase} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{labels[i]}</span>
                      <span>{leapProgress[phase]}%</span>
                    </div>
                    <input type="range" min={0} max={100} value={leapProgress[phase]}
                      onChange={e => setLeapProgress(prev => ({ ...prev, [phase]: Number(e.target.value) }))}
                      className="w-full accent-green-500" />
                  </div>
                )
              })}
            </div>
            <button onClick={runAssessment} disabled={assessing}
              className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {assessing ? <span className="animate-spin">⏳</span> : '🌿'}
              {assessing ? 'Hesaplanıyor…' : 'TNFD Hazırlık Skoru Hesapla'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
