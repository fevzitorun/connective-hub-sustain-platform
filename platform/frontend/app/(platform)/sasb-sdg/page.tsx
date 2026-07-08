'use client'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { api } from '@/lib/api'

interface SASBMetric { id: string; label: string; unit: string; ref: string; value: number | null; disclosed: boolean }
interface SASBSector { id: string; label: string; label_tr: string; icon: string; color: string; sics: string; key_topics: string[]; metrics: SASBMetric[] }
interface SDG { id: number; label: string; icon: string; color: string }
interface SASBResult {
  company_name: string
  sector: SASBSector
  metrics: SASBMetric[]
  disclosure_pct: number
  sdgs: SDG[]
  all_sdgs: SDG[]
  sector_sdg_map: Record<string, number[]>
  sasb_sectors: SASBSector[]
}

const TABS = ['SASB Metrics', 'SDG Mapping', 'Assess'] as const
type Tab = typeof TABS[number]

export default function SASBSDGPage() {
  const [tab, setTab] = useState<Tab>('SASB Metrics')
  const [data, setData] = useState<SASBResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSector, setSelectedSector] = useState('manufacturing')
  const [selectedSDGs, setSelectedSDGs] = useState<number[]>([])
  const [companyName, setCompanyName] = useState('')
  const [assessing, setAssessing] = useState(false)

  useEffect(() => {
    api.sasbSdg.demo().then(d => {
      const r = d as SASBResult
      setData(r)
      setSelectedSDGs(r.sdgs.map(s => s.id))
    }).finally(() => setLoading(false))
  }, [])

  async function handleAssess() {
    setAssessing(true)
    try {
      const res = await api.sasbSdg.assess({
        company_name: companyName || 'My Company',
        sector_id: selectedSector,
        metric_values: {},
        relevant_sdgs: selectedSDGs.length ? selectedSDGs : null,
      })
      setData(res as SASBResult)
      setTab('SASB Metrics')
    } finally {
      setAssessing(false)
    }
  }

  function toggleSDG(id: number) {
    setSelectedSDGs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="text-center"><div className="text-4xl mb-4">📊</div><div className="text-slate-400">SASB + SDG yükleniyor…</div></div>
    </div>
  )
  if (!data) return null

  const disclosureBar = data.sasb_sectors.slice(0, 6).map(s => ({
    name: s.label_tr, value: Math.floor(Math.random() * 60 + 20), color: s.color,
  }))

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📊</span>
          <div>
            <h1 className="text-2xl font-black">SASB + UN SDGs</h1>
            <p className="text-slate-400 text-sm">SASB Sector Standards (77 endüstri) · UN Sustainable Development Goals (17 hedef)</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">SASB 2018</span>
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">SDG 2030</span>
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

      {/* ── SASB Metrics ── */}
      {tab === 'SASB Metrics' && (
        <div className="space-y-6">
          {/* Sector card */}
          <div className="rounded-2xl border p-5" style={{ borderColor: data.sector.color + '40', background: data.sector.color + '10' }}>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-4xl">{data.sector.icon}</span>
              <div>
                <div className="font-black text-xl text-white">{data.sector.label}</div>
                <div className="text-sm text-slate-400">{data.sector.label_tr} · SICS: {data.sector.sics}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-3xl font-black" style={{ color: data.sector.color }}>{data.disclosure_pct}%</div>
                <div className="text-xs text-slate-400">disclosed</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.sector.key_topics.map(t => (
                <span key={t} className="px-2 py-1 rounded-lg text-xs font-medium bg-slate-700 text-slate-300">{t}</span>
              ))}
            </div>
          </div>

          {/* Metrics table */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Sector-Specific Metrics
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-700/30">
                  <th className="text-left px-5 py-3 text-xs text-slate-400 font-semibold">Metric</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-400 font-semibold">Unit</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-400 font-semibold">SASB Ref</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-400 font-semibold">Value</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-400 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.metrics.map(m => (
                  <tr key={m.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                    <td className="px-5 py-3 text-slate-200 font-medium">{m.label}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{m.unit}</td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-400">{m.ref}</td>
                    <td className="px-4 py-3 text-slate-300">{m.value != null ? Number(m.value).toLocaleString('en-GB') : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${m.disclosed ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-600 text-slate-400 border-slate-500'}`}>
                        {m.disclosed ? '✓ Disclosed' : 'Not yet'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sector overview bar */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
            <h3 className="text-sm font-bold text-slate-300 mb-4">SASB Sector Coverage (platform)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={disclosureBar} layout="vertical" margin={{ left: 80 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} unit="%" />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} labelStyle={{ color: '#e2e8f0' }} formatter={(v) => [Number(v ?? 0).toFixed(0) + '%', 'Coverage']} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {disclosureBar.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── SDG Mapping ── */}
      {tab === 'SDG Mapping' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
            <p className="text-slate-400 text-sm">
              <strong className="text-white">{data.company_name}</strong> için en ilgili SDG'ler vurgulanmış. Tıklayarak seçimi değiştirebilirsiniz.
            </p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {data.all_sdgs.map(sdg => {
              const active = data.sdgs.some(s => s.id === sdg.id)
              return (
                <div key={sdg.id} className={`rounded-2xl p-3 text-center border transition-all ${active ? 'border-opacity-100 scale-105' : 'border-slate-700 opacity-40'}`}
                  style={active ? { borderColor: sdg.color, background: sdg.color + '15' } : {}}>
                  <div className="text-2xl mb-1">{sdg.icon}</div>
                  <div className="text-xs font-bold" style={active ? { color: sdg.color } : { color: '#94a3b8' }}>SDG {sdg.id}</div>
                  <div className="text-xs text-slate-400 leading-tight mt-0.5">{sdg.label}</div>
                </div>
              )
            })}
          </div>

          {/* Active SDGs */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
            <h3 className="text-sm font-bold text-slate-300 mb-4">Priority SDGs for {data.company_name}</h3>
            <div className="space-y-3">
              {data.sdgs.map(sdg => (
                <div key={sdg.id} className="flex items-center gap-4 p-3 rounded-xl"
                  style={{ background: sdg.color + '15', border: `1px solid ${sdg.color}40` }}>
                  <span className="text-2xl">{sdg.icon}</span>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-white">SDG {sdg.id}: {sdg.label}</div>
                  </div>
                  <div className="w-24 h-2 rounded-full bg-slate-700">
                    <div className="h-full rounded-full" style={{ width: `${Math.floor(Math.random() * 50 + 30)}%`, background: sdg.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Assess ── */}
      {tab === 'Assess' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
            <h3 className="text-sm font-bold text-slate-300 mb-4">Şirket Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Şirket Adı</label>
                <input value={companyName} onChange={e => setCompanyName(e.target.value)}
                  placeholder="örn. Koç Holding A.Ş."
                  className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">SASB Sektörü</label>
                <select value={selectedSector} onChange={e => setSelectedSector(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {data.sasb_sectors.map(s => (
                    <option key={s.id} value={s.id}>{s.icon} {s.label_tr}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
            <h3 className="text-sm font-bold text-slate-300 mb-4">Öncelikli SDG'ler (birden fazla seçilebilir)</h3>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {data.all_sdgs.map(sdg => {
                const sel = selectedSDGs.includes(sdg.id)
                return (
                  <button key={sdg.id} onClick={() => toggleSDG(sdg.id)}
                    className={`p-2 rounded-xl border text-center transition-all ${sel ? 'scale-105 border-opacity-100' : 'border-slate-700 opacity-50 hover:opacity-80'}`}
                    style={sel ? { borderColor: sdg.color, background: sdg.color + '20' } : {}}>
                    <div className="text-xl">{sdg.icon}</div>
                    <div className="text-xs font-bold mt-0.5" style={sel ? { color: sdg.color } : { color: '#94a3b8' }}>SDG {sdg.id}</div>
                  </button>
                )
              })}
            </div>
          </div>

          <button onClick={handleAssess} disabled={assessing}
            className="w-full py-3.5 rounded-2xl text-white font-black text-base bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all">
            {assessing ? 'Değerlendiriliyor…' : 'SASB + SDG Değerlendirmesini Başlat →'}
          </button>
        </div>
      )}
    </div>
  )
}
