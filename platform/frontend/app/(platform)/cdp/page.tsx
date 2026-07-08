'use client'
import { useEffect, useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts'
import { api } from '@/lib/api'

// ── Types ─────────────────────────────────────────────────────────────────────
interface CDPSection {
  code: string; title: string; icon: string; weight: number
  score: number; max: number; pct: number
}
interface CDPGap { code: string; title: string; icon: string; pct: number; threshold: string }
interface CDPResult {
  company_name: string; sector: string; maturity_score: number
  total_score: number; total_max: number; pct: number
  grade: string; grade_label: string; grade_color: string
  sections: CDPSection[]
  top_gaps: CDPGap[]
  actions: string[]
  answers?: Record<string, number>
  questionnaire: Array<{ code: string; title: string; icon: string; weight: number; questions: Array<{ id: string; q: string; max: number }> }>
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const GRADE_ORDER = ['A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'D-']

function GradeRing({ grade, color, pct }: { grade: string; color: string; pct: number }) {
  const r = 36; const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  return (
    <svg width={100} height={100} viewBox="0 0 100 100">
      <circle cx={50} cy={50} r={r} fill="none" stroke="#1e293b" strokeWidth={10} />
      <circle cx={50} cy={50} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x={50} y={47} textAnchor="middle" fill={color} fontSize={18} fontWeight="bold">{grade}</text>
      <text x={50} y={62} textAnchor="middle" fill="#94a3b8" fontSize={11}>{pct}%</text>
    </svg>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CDPPage() {
  const [result, setResult] = useState<CDPResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'sections' | 'actions' | 'form'>('overview')

  // Form state
  const [form, setForm] = useState({
    company_name: 'Demo Şirketi A.Ş.',
    maturity_score: 58,
    has_scope3: true,
    has_sbti: false,
    has_verification: false,
    has_re_target: true,
    sector: 'tekstil',
  })
  const [assessing, setAssessing] = useState(false)

  useEffect(() => {
    api.cdp.demo().then(d => { setResult(d as CDPResult); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  async function runAssessment() {
    setAssessing(true)
    try {
      const d = await api.cdp.assess(form)
      setResult(d as CDPResult)
      setTab('overview')
    } catch {
      // demo fallback
    } finally {
      setAssessing(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-emerald-400 animate-pulse">CDP değerlendirmesi yükleniyor…</div>
    </div>
  )

  const r = result!
  const radarData = r.sections.map(s => ({ subject: s.code, score: s.pct, fullMark: 100 }))

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xl">🌍</div>
          <div>
            <h1 className="text-xl font-bold text-white">CDP İklim Değişikliği Anketi 2024</h1>
            <p className="text-xs text-slate-400">Carbon Disclosure Project — Otomatik değerlendirme ve puan hesaplama</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">CDP 2024</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Sprint 33</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Hero Score */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center">
            <div className="mb-2 text-sm text-slate-400 font-medium">{r.company_name}</div>
            <GradeRing grade={r.grade} color={r.grade_color} pct={r.pct} />
            <div className="mt-3 text-center">
              <div className="text-lg font-bold" style={{ color: r.grade_color }}>{r.grade_label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{r.total_score} / {r.total_max} puan</div>
            </div>
          </div>

          {/* Section mini scores */}
          <div className="md:col-span-3 bg-slate-800/50 border border-slate-700 rounded-xl p-5">
            <div className="text-sm font-semibold text-slate-300 mb-4">Bölüm Puanları</div>
            <div className="space-y-2.5">
              {r.sections.map(s => (
                <div key={s.code} className="flex items-center gap-3">
                  <span className="w-5 text-center">{s.icon}</span>
                  <span className="w-20 text-xs text-slate-400 flex-shrink-0">{s.code}</span>
                  <div className="flex-1 bg-slate-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{ width: `${s.pct}%`, backgroundColor: s.pct >= 70 ? '#10b981' : s.pct >= 50 ? '#3b82f6' : s.pct >= 30 ? '#f59e0b' : '#ef4444' }}
                    />
                  </div>
                  <span className="w-12 text-right text-xs font-bold" style={{ color: s.pct >= 70 ? '#10b981' : s.pct >= 50 ? '#60a5fa' : '#fbbf24' }}>
                    {s.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grade path */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-sm font-semibold text-slate-300 mb-3">CDP Puan Skalası</div>
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {GRADE_ORDER.map(g => {
              const isCurrent = g === r.grade
              const colors: Record<string, string> = { 'A': '#10b981', 'A-': '#34d399', 'B': '#3b82f6', 'B-': '#60a5fa', 'C': '#f59e0b', 'C-': '#fbbf24', 'D': '#ef4444', 'D-': '#f87171' }
              return (
                <div key={g} className={`flex-1 min-w-[56px] py-2 rounded-lg text-center border text-sm font-bold transition-all ${isCurrent ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50'}`}
                  style={{ backgroundColor: colors[g] + '33', color: colors[g], borderColor: isCurrent ? colors[g] : undefined }}>
                  {g}
                  {isCurrent && <div className="text-xs opacity-80">Sen</div>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800/50 border border-slate-700 rounded-xl p-1 w-fit">
          {([['overview', '📊 Genel Bakış'], ['sections', '📋 Bölümler'], ['actions', '🎯 Eylem Planı'], ['form', '⚙️ Değerlendirme']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === id ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ─────────────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Radar */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <div className="text-sm font-semibold text-slate-300 mb-4">Bölüm Performans Radarlı</div>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Radar name="CDP Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Bar chart */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <div className="text-sm font-semibold text-slate-300 mb-4">Bölüm Karşılaştırması (% Puan)</div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={r.sections} layout="vertical" margin={{ left: 40 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis type="category" dataKey="code" tick={{ fill: '#94a3b8', fontSize: 11 }} width={45} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                    formatter={(v) => [Number(v ?? 0).toFixed(0) + '%', 'Puan']}
                  />
                  <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                    {r.sections.map((s) => (
                      <Cell key={s.code} fill={s.pct >= 70 ? '#10b981' : s.pct >= 50 ? '#3b82f6' : s.pct >= 30 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Gaps */}
            <div className="md:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <div className="text-sm font-semibold text-slate-300 mb-4">🔴 Kritik İyileştirme Alanları</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {r.top_gaps.map(g => (
                  <div key={g.code} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <div className="text-xs font-bold text-red-400 mb-1">{g.code}</div>
                    <div className="text-sm font-semibold text-white mb-2">{g.title}</div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
                      <div className="h-1.5 rounded-full bg-red-500" style={{ width: `${g.pct}%` }} />
                    </div>
                    <div className="text-xs text-slate-400">{g.pct}% — {g.threshold}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SECTIONS ─────────────────────────────────────────────────────── */}
        {tab === 'sections' && (
          <div className="space-y-3">
            {r.questionnaire.map(sec => {
              const secScore = r.sections.find(s => s.code === sec.code)
              return (
                <div key={sec.code} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{sec.icon}</span>
                      <div>
                        <div className="font-semibold text-white">{sec.code} — {sec.title}</div>
                        <div className="text-xs text-slate-500">Ağırlık: %{sec.weight}</div>
                      </div>
                    </div>
                    {secScore && (
                      <div className="text-right">
                        <div className="text-lg font-bold" style={{ color: secScore.pct >= 70 ? '#10b981' : secScore.pct >= 50 ? '#60a5fa' : '#fbbf24' }}>
                          {secScore.score} / {secScore.max}
                        </div>
                        <div className="text-xs text-slate-400">{secScore.pct}%</div>
                      </div>
                    )}
                  </div>
                  <div className="divide-y divide-slate-800">
                    {sec.questions.map(q => {
                      const answered = (result?.answers as Record<string, number> | undefined)?.[q.id] ?? 0
                      const pct = Math.round(answered / q.max * 100)
                      return (
                        <div key={q.id} className="px-5 py-3 flex items-center gap-4">
                          <span className="text-xs font-mono text-emerald-400 w-12 flex-shrink-0">{q.id}</span>
                          <span className="flex-1 text-sm text-slate-300">{q.q}</span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="w-24 bg-slate-700 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444' }} />
                            </div>
                            <span className="text-xs text-slate-400 w-12 text-right">{answered}/{q.max}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── ACTIONS ──────────────────────────────────────────────────────── */}
        {tab === 'actions' && (
          <div className="space-y-4 max-w-2xl">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300">
              <span className="font-bold text-blue-400">CDP 2024 Son Başvuru: 31 Temmuz 2025</span> — CDP.net üzerinden beyan yapın.
              Şu anki skorunuz <span style={{ color: r.grade_color }} className="font-bold">{r.grade}</span> ({r.pct}%),
              {r.grade === 'A' ? ' Liderlik seviyesindesiniz!' : ` ${r.grade === 'B' ? 'A' : r.grade === 'C' ? 'B' : 'C'} seviyesine yükselmek için eylem planı:`}
            </div>
            {r.actions.map((a, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</span>
                <p className="text-sm text-slate-300">{a}</p>
              </div>
            ))}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-2 text-sm text-slate-400">
              <div className="font-semibold text-white">📎 Faydalı Kaynaklar</div>
              <div>• CDP Climate Change Questionnaire 2024 Guidance</div>
              <div>• SBTi Corporate Manual v2.0</div>
              <div>• GHG Protocol Corporate Standard</div>
              <div>• ISO 14064-3 Doğrulama Kılavuzu</div>
            </div>
          </div>
        )}

        {/* ── FORM ─────────────────────────────────────────────────────────── */}
        {tab === 'form' && (
          <div className="max-w-xl bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Şirket Değerlendirmesi</h2>
              <p className="text-sm text-slate-400">SustainHub verilerinizden CDP puanı hesaplayın.</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-slate-300 font-medium">Şirket Adı</label>
              <input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-slate-300 font-medium">ESG Olgunluk Skoru: {form.maturity_score}</label>
              <input type="range" min={0} max={100} value={form.maturity_score}
                onChange={e => setForm(f => ({ ...f, maturity_score: Number(e.target.value) }))}
                className="w-full accent-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([
                ['has_scope3', 'Kapsam 3 Hesaplanmış'],
                ['has_sbti', 'SBTi Taahhüdü Var'],
                ['has_verification', '3. Taraf Doğrulaması'],
                ['has_re_target', 'Yenilenebilir Enerji Hedefi'],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                  <button type="button" onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                    className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 ${form[key] ? 'bg-blue-500' : 'bg-slate-600'}`}>
                    <span className={`block w-4 h-4 bg-white rounded-full shadow m-1 transition-transform ${form[key] ? 'translate-x-4' : ''}`} />
                  </button>
                  <span className="text-sm text-slate-300">{label}</span>
                </label>
              ))}
            </div>
            <button onClick={runAssessment} disabled={assessing}
              className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {assessing ? <span className="animate-spin">⏳</span> : '🌍'}
              {assessing ? 'Hesaplanıyor…' : 'CDP Puanı Hesapla'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
