'use client'
import { useState, useEffect } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine,
} from 'recharts'
import { api } from '@/lib/api'

// ── Types ────────────────────────────────────────────────────────────────────
interface PillarScores { E: number; S: number; G: number }

interface PriorityGap {
  id: string
  pillar: string
  question_tr: string
  action: string
  weight: number
}

interface RedFlag {
  id: string
  pillar: string
  question_tr: string
  severity: 'HIGH' | 'MEDIUM'
}

interface CreditScoreResult {
  company_name: string
  sector: string
  sector_label: string
  total_score: number
  rating: string
  rating_label: string
  bank_category: string
  bank_category_label: string
  bank_category_description: string
  bank_financing_note: string
  bank_category_color: string
  pd_max_pct: number
  pillar_scores: PillarScores
  pillar_weights: { E: number; S: number; G: number }
  red_flags: RedFlag[]
  red_flag_count: number
  gap_count: number
  top_priority_gaps: PriorityGap[]
  sector_avg: number
  sector_top_quartile: number
  percentile: number
  questions_answered: number
  total_questions: number
}

interface Question {
  id: string
  pillar: string
  weight: number
  en: string
  tr: string
  red_flag: boolean
  action: string
}

// ── Constants ────────────────────────────────────────────────────────────────
const PILLAR_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  E: { label: 'Çevresel (E)', color: '#10b981', icon: '🌿' },
  S: { label: 'Sosyal (S)',   color: '#3b82f6', icon: '👥' },
  G: { label: 'Yönetişim (G)', color: '#8b5cf6', icon: '🏛️' },
}

const RATING_COLORS: Record<string, string> = {
  AAA: '#10b981', AA: '#34d399', A: '#6ee7b7',
  BBB: '#f59e0b', BB: '#fb923c', B: '#f97316',
  CCC: '#ef4444', D: '#991b1b',
}

const SECTORS = [
  { id: 'manufacturing', label: 'İmalat' },
  { id: 'construction',  label: 'İnşaat' },
  { id: 'retail_trade',  label: 'Perakende' },
  { id: 'food_beverage', label: 'Gıda & İçecek' },
  { id: 'textile',       label: 'Tekstil' },
  { id: 'logistics',     label: 'Lojistik' },
  { id: 'agriculture',   label: 'Tarım' },
  { id: 'technology',    label: 'Teknoloji' },
  { id: 'healthcare',    label: 'Sağlık' },
  { id: 'financial_svc', label: 'Finansal Hizmetler' },
]

// ── Score Gauge SVG ───────────────────────────────────────────────────────────
function ScoreGauge({ score, rating, color }: { score: number; rating: string; color: string }) {
  const r = 70; const cx = 90; const cy = 90
  const angle = (score / 100) * 180 - 180
  const rad = (angle * Math.PI) / 180
  const x = cx + r * Math.cos(rad)
  const y = cy + r * Math.sin(rad)
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * (circ / 2)
  return (
    <svg width="180" height="110" className="mx-auto">
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="#1e293b" strokeWidth="14" />
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke={color} strokeWidth="14"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease' }} />
      <circle cx={x} cy={y} r="6" fill={color} />
      <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize="26" fontWeight="700">
        {score.toFixed(0)}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill={color} fontSize="20" fontWeight="700">
        {rating}
      </text>
      <text x={cx - r + 2} y={cy + 20} fill="#64748b" fontSize="10">0</text>
      <text x={cx + r - 12} y={cy + 20} fill="#64748b" fontSize="10">100</text>
    </svg>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function KobiCreditScorePage() {
  const [tab, setTab] = useState<'demo' | 'assess' | 'results' | 'actions'>('demo')
  const [data, setData] = useState<CreditScoreResult | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [companyName, setCompanyName] = useState('Şirket Adı Giriniz')
  const [sector, setSector] = useState('manufacturing')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.kobiCreditScore.demo().then(d => setData(d as CreditScoreResult))
    api.kobiCreditScore.questions().then(q => {
      setQuestions(q as Question[])
      const init: Record<string, number> = {}
      ;(q as Question[]).forEach(qq => { init[qq.id] = 0 })
      setAnswers(init)
    })
  }, [])

  const handleAssess = async () => {
    setLoading(true)
    try {
      const res = await api.kobiCreditScore.assess({ company_name: companyName, sector, answers })
      setData(res as CreditScoreResult)
      setTab('results')
    } finally {
      setLoading(false)
    }
  }

  const radarData = data ? [
    { subject: 'Çevresel\n(40%)', value: data.pillar_scores.E, fullMark: 100 },
    { subject: 'Sosyal\n(30%)',   value: data.pillar_scores.S, fullMark: 100 },
    { subject: 'Yönetişim\n(30%)', value: data.pillar_scores.G, fullMark: 100 },
  ] : []

  const barData = data ? [
    { name: 'Şirket', score: data.total_score, fill: data.bank_category_color },
    { name: 'Sektör Ort.', score: data.sector_avg, fill: '#475569' },
    { name: 'Üst Çeyrek', score: data.sector_top_quartile, fill: '#6366f1' },
  ] : []

  const questionsByPillar = questions.reduce<Record<string, Question[]>>((acc, q) => {
    if (!acc[q.pillar]) acc[q.pillar] = []
    acc[q.pillar].push(q)
    return acc
  }, {})

  const TABS = [
    { id: 'demo',    label: 'Demo Sonuçları' },
    { id: 'assess',  label: 'Değerlendirme Formu' },
    { id: 'results', label: 'Sonuçlar' },
    { id: 'actions', label: 'Aksiyon Planı' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">KOBİ ESG Kredi Skoru</h1>
          <p className="text-slate-400 text-sm mt-1">
            Ziraat Bankası 33-soru modeli · E(40%) + S(30%) + G(30%) · PCAF uyumlu · AAA→D derecelendirme
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800 rounded-lg px-3 py-2 border border-slate-700">
          <span className="text-emerald-400 font-bold">PCAF</span>
          <span>·</span>
          <span>TSRS 1+2</span>
          <span>·</span>
          <span>SLL Ready</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
        {TABS.map(t => (
          <button key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >{t.label}</button>
        ))}
      </div>

      {/* ── TAB: Demo Sonuçları ─────────────────────────────────────────── */}
      {(tab === 'demo' || tab === 'results') && data && (
        <div className="space-y-6">
          {/* Top row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Score gauge */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
              <div className="text-sm text-slate-400 mb-2">ESG Kredi Skoru</div>
              <ScoreGauge
                score={data.total_score}
                rating={data.rating}
                color={RATING_COLORS[data.rating] || '#10b981'}
              />
              <div className="text-xs text-slate-400 mt-2">{data.rating_label}</div>
              <div className="text-xs text-slate-500 mt-1">{data.company_name}</div>
            </div>

            {/* Bank category */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="text-sm text-slate-400 mb-3">Banka Risk Kategorisi</div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
                  style={{ backgroundColor: data.bank_category_color }}
                >{data.bank_category}</div>
                <div>
                  <div className="text-white font-bold text-lg">{data.bank_category_label}</div>
                  <div className="text-xs text-slate-400">PD ≤ {data.pd_max_pct}%</div>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-3">{data.bank_category_description}</p>
              <div className="bg-slate-900 rounded-lg p-2.5 text-xs text-emerald-400 border border-emerald-500/20">
                💡 {data.bank_financing_note}
              </div>
            </div>

            {/* Key metrics */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
              <div className="text-sm text-slate-400">Temel Göstergeler</div>
              {[
                { label: 'Sektör Ortalaması', val: `${data.sector_avg}/100`, color: '#64748b' },
                { label: 'Üst Çeyrek', val: `${data.sector_top_quartile}/100`, color: '#6366f1' },
                { label: 'Kırmızı Bayrak', val: `${data.red_flag_count} soru`, color: '#ef4444' },
                { label: 'Eksik Alan', val: `${data.gap_count} soru`, color: '#f59e0b' },
                { label: 'Yanıtlanan', val: `${data.questions_answered}/${data.total_questions}`, color: '#10b981' },
              ].map(m => (
                <div key={m.label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{m.label}</span>
                  <span className="text-sm font-bold" style={{ color: m.color }}>{m.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pillar scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Radar */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="text-sm text-slate-400 mb-4">Pillar Radar</div>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Radar dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Pillar breakdown */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="text-sm text-slate-400 mb-4">Pillar Kırılımı</div>
              <div className="space-y-5">
                {(['E', 'S', 'G'] as const).map(p => {
                  const info = PILLAR_LABELS[p]
                  const score = data.pillar_scores[p]
                  return (
                    <div key={p}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span>{info.icon}</span>
                          <span className="text-sm text-white">{info.label}</span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: info.color }}>
                          {score.toFixed(0)}/100
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full transition-all"
                          style={{ width: `${score}%`, backgroundColor: info.color }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              {/* Sektör karşılaştırması */}
              <div className="mt-6">
                <div className="text-sm text-slate-400 mb-3">Sektör Karşılaştırması ({data.sector_label})</div>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={barData} barSize={32}>
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} width={28} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                      labelStyle={{ color: '#94a3b8' }}
                      formatter={(v) => [Number(v ?? 0).toFixed(0), 'Puan']}
                    />
                    <ReferenceLine y={50} stroke="#475569" strokeDasharray="4 2" />
                    {barData.map((entry, i) => (
                      <Bar key={i} dataKey="score" fill={entry.fill}>
                        <Cell key={i} fill={entry.fill} />
                      </Bar>
                    ))}
                    <Bar dataKey="score" fill="#10b981">
                      {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Red flags */}
          {data.red_flag_count > 0 && (
            <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-red-400 text-lg">🚩</span>
                <h3 className="text-red-400 font-bold">Kırmızı Bayraklar ({data.red_flag_count})</h3>
                <span className="text-xs text-red-400/60">— Banka tarafından özel incelemeye alınabilir</span>
              </div>
              <div className="space-y-2">
                {data.red_flags.map(rf => (
                  <div key={rf.id}
                    className="flex items-start gap-3 bg-slate-900/60 rounded-lg px-4 py-2.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                      rf.severity === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                    }`}>{rf.severity}</span>
                    <div>
                      <div className="text-xs text-slate-300">[{rf.id}] {rf.question_tr}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Değerlendirme Formu ─────────────────────────────────────── */}
      {tab === 'assess' && (
        <div className="space-y-5">
          {/* Company + Sector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Şirket Adı</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Sektör</label>
              <select
                value={sector}
                onChange={e => setSector(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-emerald-500 outline-none"
              >
                {SECTORS.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Questions by pillar */}
          {(['E', 'S', 'G'] as const).map(pillar => {
            const info = PILLAR_LABELS[pillar]
            const qs = questionsByPillar[pillar] || []
            return (
              <div key={pillar} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">{info.icon}</span>
                  <h3 className="text-white font-bold">{info.label}</h3>
                  <span className="text-xs text-slate-400">
                    ({qs.filter(q => answers[q.id] === 1).length}/{qs.length} tamamlandı)
                  </span>
                </div>
                <div className="space-y-3">
                  {qs.map(q => (
                    <div key={q.id}
                      className={`flex items-start gap-4 p-3.5 rounded-lg cursor-pointer transition-all border ${
                        answers[q.id] === 1
                          ? 'bg-emerald-950/30 border-emerald-500/30'
                          : q.red_flag
                            ? 'bg-red-950/20 border-red-500/20 hover:border-red-500/40'
                            : 'bg-slate-900/60 border-slate-700 hover:border-slate-600'
                      }`}
                      onClick={() => setAnswers(prev => ({
                        ...prev, [q.id]: prev[q.id] === 1 ? 0 : 1,
                      }))}
                    >
                      <div className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center border-2 ${
                        answers[q.id] === 1 ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'
                      }`}>
                        {answers[q.id] === 1 && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-mono text-slate-500">{q.id}</span>
                          {q.red_flag && (
                            <span className="text-xs text-red-400">🚩 Kırmızı Bayrak</span>
                          )}
                          <span className="ml-auto text-xs text-slate-500">Ağırlık: {q.weight}</span>
                        </div>
                        <p className="text-sm text-slate-200">{q.tr}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          <button
            onClick={handleAssess}
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all"
          >
            {loading ? 'Hesaplanıyor...' : 'ESG Kredi Skorunu Hesapla →'}
          </button>
        </div>
      )}

      {/* ── TAB: Aksiyon Planı ───────────────────────────────────────────── */}
      {tab === 'actions' && data && (
        <div className="space-y-5">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h3 className="text-white font-bold mb-1">
              {data.company_name} — Öncelikli Aksiyon Planı
            </h3>
            <p className="text-sm text-slate-400 mb-5">
              Mevcut skor: <strong className="text-white">{data.total_score}/100</strong> ({data.rating}) ·
              Kategori: <strong style={{ color: data.bank_category_color }}>{data.bank_category}</strong> ·
              Hedef: <strong className="text-emerald-400">B+ veya üzeri için 55+ puan</strong>
            </p>
            <div className="space-y-3">
              {data.top_priority_gaps.map((gap, i) => {
                const pillarInfo = PILLAR_LABELS[gap.pillar]
                return (
                  <div key={gap.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: pillarInfo.color + '33', border: `1px solid ${pillarInfo.color}40` }}
                      >
                        {i + 1}
                      </div>
                      <span className="text-xs font-mono text-slate-500">{gap.id}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: pillarInfo.color + '20', color: pillarInfo.color }}
                      >{pillarInfo.label}</span>
                      <span className="ml-auto text-xs text-slate-500">+{gap.weight} puan potansiyel</span>
                    </div>
                    <p className="text-sm text-slate-300 mb-2">{gap.question_tr}</p>
                    <div className="flex items-start gap-2 bg-emerald-950/20 rounded-lg p-2.5 border border-emerald-500/20">
                      <span className="text-emerald-400 text-base">→</span>
                      <p className="text-xs text-emerald-300">{gap.action}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Financing roadmap */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h3 className="text-white font-bold mb-4">Finansman Yol Haritası</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  cat: 'C → B-', color: '#f59e0b', min: 35, max: 54,
                  desc: 'Temel eksiklikleri giderin (red flag çözümü, politika yayını). 6 aylık geçiş kredisi alınabilir.',
                },
                {
                  cat: 'B- → B+', color: '#3b82f6', min: 55, max: 74,
                  desc: 'ISO 14001 / 45001 başlatın, tedarikçi CoC yayınlayın. Standart yeşil kredi hakkı kazanılır.',
                },
                {
                  cat: 'B+ → A', color: '#10b981', min: 75, max: 89,
                  desc: 'SBTi hedefi taahhüt edin, ESG raporu yayınlayın. Tercihli faiz oranı (SLL) elde edilir.',
                },
                {
                  cat: 'A → AAA', color: '#6366f1', min: 90, max: 100,
                  desc: 'Bağımsız ESG güvencesi alın, TCFD/TSRS raporlaması yapın. Yeşil tahvil ihraç edilebilir.',
                },
              ].map(step => (
                <div key={step.cat}
                  className="bg-slate-900 rounded-xl p-4 border"
                  style={{ borderColor: step.color + '40' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold" style={{ color: step.color }}>{step.cat}</span>
                    <span className="text-xs text-slate-500">({step.min}–{step.max} puan)</span>
                  </div>
                  <p className="text-xs text-slate-400">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
