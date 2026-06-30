'use client'

import { useState, useMemo } from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'

type Sector = 'Tümü' | 'Bankacılık' | 'Enerji' | 'Üretim' | 'Perakende' | 'Teknoloji' | 'İnşaat' | 'Lojistik'
type SortKey = 'rank' | 'esg_score' | 'carbon_intensity' | 'tsrs_ready'

interface Company {
  rank: number
  name: string
  ticker: string
  sector: Sector
  esg_score: number
  env_score: number
  social_score: number
  gov_score: number
  carbon_intensity: number   // tCO2e / €M revenue
  tsrs_ready: boolean
  cop31_target: boolean
  sbti: boolean
  trend: 'up' | 'stable' | 'down'
  change: number
}

const COMPANIES: Company[] = [
  { rank: 1,  name: 'Ereğli Demir ve Çelik',  ticker: 'EREGL', sector: 'Üretim',     esg_score: 87, env_score: 85, social_score: 88, gov_score: 89, carbon_intensity: 420,  tsrs_ready: true,  cop31_target: true,  sbti: true,  trend: 'up',     change: +4 },
  { rank: 2,  name: 'Akbank T.A.Ş.',           ticker: 'AKBNK', sector: 'Bankacılık', esg_score: 84, env_score: 79, social_score: 88, gov_score: 86, carbon_intensity: 12,   tsrs_ready: true,  cop31_target: true,  sbti: false, trend: 'up',     change: +6 },
  { rank: 3,  name: 'Türkiye İş Bankası',      ticker: 'ISCTR', sector: 'Bankacılık', esg_score: 82, env_score: 77, social_score: 85, gov_score: 84, carbon_intensity: 14,   tsrs_ready: true,  cop31_target: true,  sbti: false, trend: 'stable', change: 0  },
  { rank: 4,  name: 'Tüpraş',                  ticker: 'TUPRS', sector: 'Enerji',     esg_score: 78, env_score: 72, social_score: 80, gov_score: 83, carbon_intensity: 890,  tsrs_ready: true,  cop31_target: false, sbti: false, trend: 'up',     change: +3 },
  { rank: 5,  name: 'Migros Ticaret',          ticker: 'MGROS', sector: 'Perakende',  esg_score: 77, env_score: 74, social_score: 79, gov_score: 78, carbon_intensity: 65,   tsrs_ready: true,  cop31_target: true,  sbti: true,  trend: 'up',     change: +5 },
  { rank: 6,  name: 'Garanti BBVA',            ticker: 'GARAN', sector: 'Bankacılık', esg_score: 76, env_score: 71, social_score: 80, gov_score: 77, carbon_intensity: 11,   tsrs_ready: true,  cop31_target: true,  sbti: true,  trend: 'stable', change: 0  },
  { rank: 7,  name: 'Enerjisa Enerji',         ticker: 'ENJSA', sector: 'Enerji',     esg_score: 75, env_score: 78, social_score: 72, gov_score: 74, carbon_intensity: 180,  tsrs_ready: true,  cop31_target: true,  sbti: false, trend: 'up',     change: +2 },
  { rank: 8,  name: 'Sabancı Holding',         ticker: 'SAHOL', sector: 'Üretim',     esg_score: 74, env_score: 70, social_score: 76, gov_score: 77, carbon_intensity: 310,  tsrs_ready: true,  cop31_target: false, sbti: false, trend: 'stable', change: 0  },
  { rank: 9,  name: 'Kordsa',                  ticker: 'KORDS', sector: 'Üretim',     esg_score: 73, env_score: 75, social_score: 72, gov_score: 72, carbon_intensity: 245,  tsrs_ready: false, cop31_target: true,  sbti: true,  trend: 'up',     change: +7 },
  { rank: 10, name: 'Şişecam',                 ticker: 'SISE',  sector: 'Üretim',     esg_score: 71, env_score: 65, social_score: 74, gov_score: 74, carbon_intensity: 420,  tsrs_ready: true,  cop31_target: false, sbti: false, trend: 'stable', change: +1 },
  { rank: 11, name: 'Yapı ve Kredi Bankası',   ticker: 'YKBNK', sector: 'Bankacılık', esg_score: 70, env_score: 66, social_score: 73, gov_score: 71, carbon_intensity: 13,   tsrs_ready: false, cop31_target: true,  sbti: false, trend: 'down',   change: -2 },
  { rank: 12, name: 'Koç Holding',             ticker: 'KCHOL', sector: 'Üretim',     esg_score: 69, env_score: 65, social_score: 71, gov_score: 72, carbon_intensity: 480,  tsrs_ready: true,  cop31_target: true,  sbti: false, trend: 'stable', change: 0  },
  { rank: 13, name: 'Turkcell',                ticker: 'TCELL', sector: 'Teknoloji',  esg_score: 68, env_score: 66, social_score: 70, gov_score: 68, carbon_intensity: 28,   tsrs_ready: false, cop31_target: true,  sbti: true,  trend: 'up',     change: +4 },
  { rank: 14, name: 'Hepsiburada',             ticker: 'HEPS',  sector: 'Teknoloji',  esg_score: 66, env_score: 63, social_score: 68, gov_score: 67, carbon_intensity: 22,   tsrs_ready: false, cop31_target: false, sbti: false, trend: 'up',     change: +3 },
  { rank: 15, name: 'Limak İnşaat',            ticker: 'LMK',   sector: 'İnşaat',     esg_score: 63, env_score: 58, social_score: 65, gov_score: 67, carbon_intensity: 210,  tsrs_ready: false, cop31_target: false, sbti: false, trend: 'stable', change: 0  },
  { rank: 16, name: 'Anadolu Efes',            ticker: 'AEFES', sector: 'Perakende',  esg_score: 62, env_score: 60, social_score: 63, gov_score: 63, carbon_intensity: 145,  tsrs_ready: false, cop31_target: true,  sbti: false, trend: 'down',   change: -1 },
  { rank: 17, name: 'TAV Havalimanları',       ticker: 'TAVHL', sector: 'Lojistik',   esg_score: 61, env_score: 55, social_score: 64, gov_score: 63, carbon_intensity: 390,  tsrs_ready: false, cop31_target: false, sbti: false, trend: 'stable', change: 0  },
  { rank: 18, name: 'DenizBank',               ticker: 'DENIZ', sector: 'Bankacılık', esg_score: 60, env_score: 56, social_score: 62, gov_score: 62, carbon_intensity: 15,   tsrs_ready: true,  cop31_target: true,  sbti: false, trend: 'up',     change: +2 },
  { rank: 19, name: 'Aksa Enerji',             ticker: 'AKSEN', sector: 'Enerji',     esg_score: 58, env_score: 54, social_score: 59, gov_score: 61, carbon_intensity: 520,  tsrs_ready: false, cop31_target: false, sbti: false, trend: 'down',   change: -3 },
  { rank: 20, name: 'Türk Telekom',            ticker: 'TTKOM', sector: 'Teknoloji',  esg_score: 57, env_score: 54, social_score: 59, gov_score: 58, carbon_intensity: 35,   tsrs_ready: false, cop31_target: true,  sbti: false, trend: 'stable', change: 0  },
]

const SECTORS: Sector[] = ['Tümü', 'Bankacılık', 'Enerji', 'Üretim', 'Perakende', 'Teknoloji', 'İnşaat', 'Lojistik']

const GRADE = (score: number) => {
  if (score >= 85) return { label: 'AAA', color: '#059669' }
  if (score >= 75) return { label: 'AA',  color: '#10b981' }
  if (score >= 65) return { label: 'A',   color: '#34d399' }
  if (score >= 55) return { label: 'BBB', color: '#f59e0b' }
  if (score >= 45) return { label: 'BB',  color: '#fb923c' }
  return              { label: 'B',   color: '#f87171' }
}

const TREND_ICON = (t: Company['trend'], c: number) => {
  if (t === 'up')   return <span className="text-emerald-400 text-xs font-bold">▲ +{c}</span>
  if (t === 'down') return <span className="text-red-400 text-xs font-bold">▼ {c}</span>
  return             <span className="text-slate-500 text-xs">—</span>
}

export default function TCSIPage() {
  const [sector, setSector] = useState<Sector>('Tümü')
  const [sortBy, setSortBy] = useState<SortKey>('rank')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Company | null>(null)

  const filtered = useMemo(() => {
    let list = [...COMPANIES]
    if (sector !== 'Tümü') list = list.filter(c => c.sector === sector)
    if (search) list = list.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.ticker.toLowerCase().includes(search.toLowerCase())
    )
    list.sort((a, b) => {
      if (sortBy === 'rank')            return a.rank - b.rank
      if (sortBy === 'esg_score')       return b.esg_score - a.esg_score
      if (sortBy === 'carbon_intensity')return a.carbon_intensity - b.carbon_intensity
      if (sortBy === 'tsrs_ready')      return (b.tsrs_ready ? 1 : 0) - (a.tsrs_ready ? 1 : 0)
      return 0
    })
    return list
  }, [sector, sortBy, search])

  const stats = useMemo(() => ({
    tsrsReady: COMPANIES.filter(c => c.tsrs_ready).length,
    cop31Target: COMPANIES.filter(c => c.cop31_target).length,
    sbti: COMPANIES.filter(c => c.sbti).length,
    avgScore: Math.round(COMPANIES.reduce((a, c) => a + c.esg_score, 0) / COMPANIES.length),
  }), [])

  const radarData = selected ? [
    { subject: 'Çevre', value: selected.env_score },
    { subject: 'Sosyal', value: selected.social_score },
    { subject: 'Yönetim', value: selected.gov_score },
    { subject: 'TSRS', value: selected.tsrs_ready ? 90 : 35 },
    { subject: 'SBTi', value: selected.sbti ? 88 : 30 },
  ] : []

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🇹🇷</span>
            <div>
              <h1 className="text-3xl font-black text-white">Turkey Corporate Sustainability Index</h1>
              <p className="text-slate-400 text-sm">TCSI 2026 — Yayın: Temmuz 2026 · COP31 Özel Edisyonu</p>
            </div>
          </div>
          <p className="text-slate-500 text-sm max-w-2xl">
            Türkiye'nin BIST 100 şirketleri arasında ESG performansı, TSRS uyum düzeyi ve COP31 hazırlığına göre sıralama.
            Sustain Research Institute tarafından yayımlanmaktadır.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            🏆 COP31 Hazırlık Raporu
          </span>
          <button className="text-xs font-bold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">
            ↓ PDF İndir
          </button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Ortalama ESG Skoru', value: `${stats.avgScore}/100`, icon: '📊', color: '#10b981' },
          { label: 'TSRS Uyumlu Şirket', value: `${stats.tsrsReady}/${COMPANIES.length}`, icon: '✅', color: '#3b82f6' },
          { label: 'COP31 Hedef Belirledi', value: `${stats.cop31Target}/${COMPANIES.length}`, icon: '🎯', color: '#f59e0b' },
          { label: 'SBTi Taahhüdü', value: `${stats.sbti}/${COMPANIES.length}`, icon: '🌿', color: '#8b5cf6' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-xl mb-1">{kpi.icon}</div>
            <div className="text-2xl font-black" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Table */}
        <div className="flex-1 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder="Şirket veya ticker ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 w-52"
            />
            <div className="flex gap-1 flex-wrap">
              {SECTORS.map(s => (
                <button key={s} onClick={() => setSector(s)}
                  className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all border"
                  style={{
                    background: sector === s ? '#059669' : '#1e293b',
                    color: sector === s ? '#fff' : '#94a3b8',
                    borderColor: sector === s ? '#059669' : '#334155',
                  }}>
                  {s}
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortKey)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none ml-auto"
            >
              <option value="rank">Sıraya göre</option>
              <option value="esg_score">ESG Skoru</option>
              <option value="carbon_intensity">Karbon Yoğunluğu</option>
              <option value="tsrs_ready">TSRS Uyum</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-slate-800 bg-slate-800/50">
                  <th className="px-4 py-3 text-center w-10">#</th>
                  <th className="px-4 py-3 text-left">Şirket</th>
                  <th className="px-4 py-3 text-center">Not</th>
                  <th className="px-4 py-3 text-right">ESG</th>
                  <th className="px-4 py-3 text-right">CO₂/€M</th>
                  <th className="px-4 py-3 text-center">TSRS</th>
                  <th className="px-4 py-3 text-center">COP31</th>
                  <th className="px-4 py-3 text-center">Trend</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const grade = GRADE(c.esg_score)
                  const isSelected = selected?.ticker === c.ticker
                  return (
                    <tr
                      key={c.ticker}
                      onClick={() => setSelected(isSelected ? null : c)}
                      className="border-b border-slate-800/60 transition-colors cursor-pointer"
                      style={{ background: isSelected ? '#0f2a1e' : undefined }}
                    >
                      <td className="px-4 py-3 text-center text-slate-500 font-mono text-xs">{c.rank}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white text-sm">{c.name}</div>
                        <div className="text-xs text-slate-500 font-mono">{c.ticker} · {c.sector}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-black" style={{ color: grade.color }}>{grade.label}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-slate-800 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full" style={{ width: `${c.esg_score}%`, background: grade.color }} />
                          </div>
                          <span className="text-slate-300 font-bold text-xs w-8 text-right">{c.esg_score}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-mono text-slate-400">{c.carbon_intensity.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center text-base">{c.tsrs_ready ? '✅' : '⏳'}</td>
                      <td className="px-4 py-3 text-center text-base">{c.cop31_target ? '🎯' : '—'}</td>
                      <td className="px-4 py-3 text-center">{TREND_ICON(c.trend, Math.abs(c.change))}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-500">Sonuç bulunamadı</div>
            )}
          </div>

          <p className="text-xs text-slate-600">
            * Skor hesaplaması: TSRS raporları, KAP açıklamaları, CDP yanıtları ve Sustain AI analizi kullanılmıştır.
            Sustain Research Institute · TCSI 2026 · COP31 Özel Edisyonu
          </p>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-full lg:w-72 flex-shrink-0 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-base font-black text-white leading-tight">{selected.name}</div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">{selected.ticker} · Sıra #{selected.rank}</div>
                </div>
                <span className="text-xl font-black" style={{ color: GRADE(selected.esg_score).color }}>
                  {GRADE(selected.esg_score).label}
                </span>
              </div>

              {/* ESG Breakdown */}
              <div className="space-y-2 mb-4">
                {[
                  { label: 'Çevre (E)', val: selected.env_score, color: '#10b981' },
                  { label: 'Sosyal (S)', val: selected.social_score, color: '#3b82f6' },
                  { label: 'Yönetim (G)', val: selected.gov_score, color: '#8b5cf6' },
                ].map(row => (
                  <div key={row.label}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-slate-400">{row.label}</span>
                      <span className="font-bold" style={{ color: row.color }}>{row.val}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${row.val}%`, background: row.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Radar */}
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                    <Radar dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {selected.tsrs_ready && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-400 border border-blue-700/50">TSRS Uyumlu</span>}
                {selected.cop31_target && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-900/50 text-amber-400 border border-amber-700/50">COP31 Hedef</span>}
                {selected.sbti && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-400 border border-emerald-700/50">SBTi</span>}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="text-xs text-slate-500">Karbon Yoğunluğu</div>
                <div className="text-lg font-black text-white">{selected.carbon_intensity.toLocaleString()} <span className="text-xs font-normal text-slate-400">tCO₂e/€M</span></div>
              </div>
            </div>

            <div className="bg-slate-900 border border-emerald-800/30 rounded-xl p-4">
              <div className="text-xs font-bold text-emerald-400 mb-2">Sustain Copilot Analizi</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {selected.name} için detaylı ESG analizi, TSRS uyum boşlukları ve COP31 hazırlık rehberi için Copilot'a sorun.
              </p>
              <button
                onClick={() => {
                  const event = new CustomEvent('copilot-prompt', {
                    detail: `${selected.name} (${selected.ticker}) şirketinin ESG skoru ${selected.esg_score}/100. TSRS uyumu ${selected.tsrs_ready ? 'tamamlandı' : 'devam ediyor'}. Bu şirketin COP31 hazırlığı için ne önerirsin?`
                  })
                  window.dispatchEvent(event)
                }}
                className="mt-3 w-full text-xs font-bold py-2 rounded-lg bg-emerald-900/50 text-emerald-400 hover:bg-emerald-800/50 border border-emerald-700/50 transition-colors"
              >
                🤖 Copilot'a Sor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
