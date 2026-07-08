'use client'
import { useEffect, useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { api } from '@/lib/api'

interface Requirement { id: string; ref: string; text: string }
interface Pillar {
  id: string; label: string; label_en: string; icon: string; color: string
  kgk_ref: string; description?: string; requirements: Requirement[]
}
interface CheckItem { id: string; category: string; text: string }
interface Deadline {
  segment: string; deadline: string; report_period: string
  regulator: string; mandatory: boolean; note: string
}
interface TSRSResult {
  company_name: string; segment: string
  pillar_scores: Record<string, number>
  overall_score: number; readiness_label: string; readiness_color: string; readiness_desc: string
  checklist_score: number; checklist_done: string[]
  deadline: Deadline
  ghg_summary: { scope1: number; scope2: number; scope3: number; total: number }
  gaps: Array<{ oncelik: string; ref: string; aksiyon: string }>
  tsrs1_pillars: Pillar[]; tsrs2_pillars: Pillar[]
  kgk_checklist: CheckItem[]; deadlines: Deadline[]
  disclosure_ready: boolean
}

// ── Gauge ─────────────────────────────────────────────────────────────────────
function ReadinessGauge({ score, color }: { score: number; color: string }) {
  const r = 56, cx = 70, cy = 70
  const sa = Math.PI * 0.75, ea = Math.PI * 2.25
  const range = ea - sa
  const fa = sa + range * (score / 100)
  const x1 = cx + r * Math.cos(sa), y1 = cy + r * Math.sin(sa)
  const x2 = cx + r * Math.cos(ea), y2 = cy + r * Math.sin(ea)
  const xf = cx + r * Math.cos(fa), yf = cy + r * Math.sin(fa)
  const large = fa - sa > Math.PI ? 1 : 0
  const largeBg = 1
  return (
    <svg width={140} height={110} viewBox="0 0 140 110">
      <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeBg} 1 ${x2} ${y2}`} fill="none" stroke="#334155" strokeWidth={10} strokeLinecap="round" />
      {score > 0 && <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${xf} ${yf}`} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" />}
      <text x={cx} y={cy + 6}  textAnchor="middle" fill="white"   fontSize={20} fontWeight="bold">{score}</text>
      <text x={cx} y={cy + 22} textAnchor="middle" fill="#94a3b8" fontSize={10}>/100</text>
    </svg>
  )
}

const TABS = ['Genel Bakış', 'TSRS 1', 'TSRS 2', 'KGK Kontrol Listesi', 'Takvim'] as const
type Tab = typeof TABS[number]

function PriBadge({ p }: { p: string }) {
  const m: Record<string, string> = { Yüksek: 'bg-red-500/20 text-red-400 border-red-500/30', Orta: 'bg-amber-500/20 text-amber-400 border-amber-500/30', Düşük: 'bg-slate-600 text-slate-400 border-slate-500' }
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${m[p] ?? m.Orta}`}>{p}</span>
}

function PillarBlock({ pillar, score, done }: { pillar: Pillar; score: number; done: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{pillar.icon}</span>
          <div>
            <div className="font-bold text-white">{pillar.label}</div>
            {pillar.description && <div className="text-xs text-slate-400 max-w-xs">{pillar.description}</div>}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black" style={{ color: pillar.color }}>{score}</div>
          <div className="text-xs text-slate-500">/ 100</div>
        </div>
      </div>
      <div className="w-full h-1.5 rounded-full bg-slate-700 mb-4">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: pillar.color }} />
      </div>
      <div className="text-xs text-slate-500 mb-3">{pillar.kgk_ref}</div>
      <div className="space-y-2">
        {pillar.requirements.map(req => (
          <div key={req.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-700/40">
            <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${done ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-400'}`}>
              {done ? '✓' : '○'}
            </div>
            <div>
              <div className="text-sm text-slate-200">{req.text}</div>
              <div className="text-xs text-slate-500 mt-0.5">{req.ref}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TSRSPage() {
  const [tab, setTab] = useState<Tab>('Genel Bakış')
  const [data, setData] = useState<TSRSResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [localDone, setLocalDone] = useState<string[]>([])

  useEffect(() => {
    api.tsrs.demo().then(d => {
      const r = d as TSRSResult
      setData(r)
      setLocalDone(r.checklist_done)
    }).finally(() => setLoading(false))
  }, [])

  function toggleItem(id: string) {
    setLocalDone(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="text-center"><div className="text-4xl mb-4">🇹🇷</div><div className="text-slate-400">TSRS yükleniyor…</div></div>
    </div>
  )
  if (!data) return null

  const radarData = [
    { pillar: 'Yönetişim',  score: data.pillar_scores.yonetisim ?? 0 },
    { pillar: 'Strateji',   score: data.pillar_scores.strateji ?? 0 },
    { pillar: 'Risk Yön.',  score: data.pillar_scores.risk_yonetimi ?? 0 },
    { pillar: 'Metrikler',  score: data.pillar_scores.metrikler_hedefler ?? 0 },
  ]

  const ghgBar = [
    { name: 'Kapsam 1', value: data.ghg_summary.scope1, color: '#ef4444' },
    { name: 'Kapsam 2', value: data.ghg_summary.scope2, color: '#f59e0b' },
    { name: 'Kapsam 3', value: data.ghg_summary.scope3, color: '#6366f1' },
  ]

  const checklistByCategory = data.kgk_checklist.reduce<Record<string, CheckItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🇹🇷</span>
          <div>
            <h1 className="text-2xl font-black">TSRS 1 + TSRS 2</h1>
            <p className="text-slate-400 text-sm">Türkiye Sürdürülebilirlik Raporlama Standartları · KGK · IFRS S1/S2 Türkçe Uyarlaması</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">KGK 2023</span>
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">BİST-100: Mar 2025</span>
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">BDDK: Haz 2025</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-800 rounded-xl p-1 w-fit flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Genel Bakış ── */}
      {tab === 'Genel Bakış' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 flex flex-col items-center gap-2">
              <ReadinessGauge score={data.overall_score} color={data.readiness_color} />
              <div className="text-sm font-bold" style={{ color: data.readiness_color }}>{data.readiness_label}</div>
              <div className="text-xs text-slate-400 text-center">{data.readiness_desc}</div>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 flex flex-col justify-between">
              <div className="text-xs text-slate-400 uppercase tracking-wider">Kontrol Listesi</div>
              <div className="text-3xl font-black text-white mt-2">{Math.round(localDone.length / data.kgk_checklist.length * 100)}<span className="text-lg text-slate-400">%</span></div>
              <div className="text-xs text-slate-400">{localDone.length} / {data.kgk_checklist.length} tamamlandı</div>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 flex flex-col justify-between">
              <div className="text-xs text-slate-400 uppercase tracking-wider">Sonraki Deadline</div>
              <div className="text-xl font-black text-amber-400 mt-2">{data.deadline.deadline}</div>
              <div className="text-xs text-slate-400">{data.deadline.segment}</div>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 flex flex-col justify-between">
              <div className="text-xs text-slate-400 uppercase tracking-wider">Açıklama Hazır</div>
              <div className={`text-3xl font-black mt-2 ${data.disclosure_ready ? 'text-emerald-400' : 'text-red-400'}`}>
                {data.disclosure_ready ? 'Evet' : 'Hayır'}
              </div>
              <div className="text-xs text-slate-400">{data.disclosure_ready ? 'Güvenceye geçilebilir' : 'Eksikler giderilmeli'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-300 mb-4">TSRS Pillar Hazırlığı</h3>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="pillar" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
                  <Radar dataKey="score" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-300 mb-4">Sera Gazı Emisyonları (tCO₂e)</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={ghgBar} margin={{ left: 10 }}>
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} labelStyle={{ color: '#e2e8f0' }} formatter={(v) => [Number(v ?? 0).toLocaleString('tr-TR') + ' tCO₂e', '']} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {ghgBar.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {data.gaps.length > 0 && (
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-300 mb-4">Öncelikli Aksiyonlar</h3>
              <div className="space-y-3">
                {data.gaps.map((g, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-700/40">
                    <PriBadge p={g.oncelik} />
                    <div className="flex-1">
                      <div className="text-sm text-slate-200">{g.aksiyon}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{g.ref}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TSRS 1 ── */}
      {tab === 'TSRS 1' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
            <p className="text-slate-400 text-sm"><strong className="text-white">TSRS 1</strong> — Sürdürülebilirlikle İlgili Finansal Açıklamalar: Tüm önemli sürdürülebilirlik konularını kapsayan genel çerçeve. 4 pillar, 16 zorunlu açıklama noktası.</p>
          </div>
          {data.tsrs1_pillars.map(pillar => (
            <PillarBlock key={pillar.id} pillar={pillar} score={data.pillar_scores[pillar.id] ?? 0} done={(data.pillar_scores[pillar.id] ?? 0) >= 50} />
          ))}
        </div>
      )}

      {/* ── TSRS 2 ── */}
      {tab === 'TSRS 2' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4">
            <p className="text-slate-400 text-sm"><strong className="text-red-300">TSRS 2</strong> — İklimle İlgili Açıklamalar: TCFD'nin halefi; fiziksel ve geçiş riskleri, senaryo analizi, Kapsam 1/2/3 emisyonları, iklim hedefleri. KGK Md. 1–36.</p>
          </div>
          {data.tsrs2_pillars.map(pillar => (
            <PillarBlock key={pillar.id} pillar={pillar} score={data.pillar_scores[pillar.id.replace('iklim_', '')] ?? data.pillar_scores[pillar.id] ?? 0} done={(data.pillar_scores[pillar.id.replace('iklim_', '')] ?? 0) >= 50} />
          ))}
        </div>
      )}

      {/* ── KGK Kontrol Listesi ── */}
      {tab === 'KGK Kontrol Listesi' && (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-3 rounded-full bg-slate-700">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.round(localDone.length / data.kgk_checklist.length * 100)}%` }} />
            </div>
            <div className="text-sm font-bold text-emerald-400">{Math.round(localDone.length / data.kgk_checklist.length * 100)}%</div>
          </div>
          {Object.entries(checklistByCategory).map(([cat, items]) => (
            <div key={cat}>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{cat}</div>
              <div className="space-y-2">
                {items.map(item => {
                  const done = localDone.includes(item.id)
                  return (
                    <button key={item.id} onClick={() => toggleItem(item.id)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${done ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-slate-700 bg-slate-800 hover:bg-slate-700'}`}>
                      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${done ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                        {done ? '✓' : '○'}
                      </div>
                      <span className={`text-sm ${done ? 'text-emerald-300 line-through decoration-emerald-500/50' : 'text-slate-300'}`}>{item.text}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Takvim ── */}
      {tab === 'Takvim' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
            <p className="text-slate-400 text-sm">TSRS zorunluluk takvimi — KGK ve SPK duyurularına göre güncel.</p>
          </div>
          {data.deadlines.map((d, i) => (
            <div key={i} className={`rounded-2xl border p-5 ${d.mandatory ? 'border-red-500/30 bg-red-500/5' : 'border-slate-700 bg-slate-800'}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="font-bold text-white">{d.segment}</div>
                <div className="flex gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${d.mandatory ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-slate-600 text-slate-400 border-slate-500'}`}>
                    {d.mandatory ? 'Zorunlu' : 'Gönüllü'}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-600 text-slate-300 border border-slate-500">{d.regulator}</span>
                </div>
              </div>
              <div className="text-xl font-black text-amber-400 mb-1">{d.deadline}</div>
              <div className="text-sm text-slate-400">Rapor Dönemi: <span className="text-white font-medium">{d.report_period}</span></div>
              <div className="text-xs text-slate-500 mt-2">{d.note}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
