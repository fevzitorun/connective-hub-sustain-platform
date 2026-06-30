'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function ISO14064Page() {
  const [year, setYear] = useState<number>(2024)
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'inventory' | 'trend'>('inventory')
  const [trendData, setTrendData] = useState<any>(null)
  const [trendLoading, setTrendLoading] = useState(false)
  const [companyId, setCompanyId] = useState<string>('')

  const fetchReport = async (selectedYear: number) => {
    setLoading(true)
    try {
      const data = await api.iso14064.report(selectedYear)
      setReport(data.iso14064_result)
      setCompanyId(data.company_id)
    } catch {
      setReport(null)
      toast.error('Bu yıl için ISO 14064 verisi bulunamadı.')
    } finally {
      setLoading(false)
    }
  }

  const fetchTrend = async () => {
    if (!companyId) return
    setTrendLoading(true)
    try {
      const data = await api.iso14064.trend(companyId)
      setTrendData(data)
    } catch {
      toast.error('Trend verisi alınamadı')
    } finally {
      setTrendLoading(false)
    }
  }

  useEffect(() => { fetchReport(year) }, [year])
  useEffect(() => {
    if (activeTab === 'trend' && !trendData && companyId) fetchTrend()
  }, [activeTab, companyId])

  const SCOPE_COLORS = ['#ef4444', '#f59e0b', '#3b82f6']

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">ISO 14064-1 Karbon Envanteri</h1>
          <p className="text-slate-400 text-sm mt-1">
            Kurumsal emisyon raporunuz · IPCC 2006, DEFRA 2022, ETKB 2022 faktörleri
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 text-sm font-bold outline-none focus:border-emerald-500"
          >
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
            <option value={2022}>2022</option>
          </select>
          {report && (
            <a
              href={api.iso14064.exportDocxUrl(year)}
              className="text-xs px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors"
            >
              ↓ Word Rapor
            </a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1 w-fit">
        {[
          { k: 'inventory', l: '📋 Envanter Raporu' },
          { k: 'trend', l: '📈 Yıl Karşılaştırma' },
        ].map(t => (
          <button key={t.k} onClick={() => setActiveTab(t.k as typeof activeTab)}
            className="text-sm font-semibold px-5 py-2 rounded-lg transition-all"
            style={{
              background: activeTab === t.k ? '#059669' : 'transparent',
              color: activeTab === t.k ? '#fff' : '#94a3b8',
            }}>
            {t.l}
          </button>
        ))}
      </div>

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <>
          {!report && !loading && (
            <div className="bg-amber-950/30 border border-amber-500/20 rounded-2xl p-10 text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-lg font-bold text-amber-400">Veri Bulunamadı</h3>
              <p className="text-sm text-amber-600 mt-2">
                {year} yılı için kaydedilmiş emisyon verisi yok.<br />
                Veri Girişi sekmesinden emisyon verilerinizi kaydedin.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
              <div className="text-4xl mb-3 animate-spin inline-block">⏳</div>
              <p className="text-slate-400 font-semibold">Hesaplanıyor...</p>
            </div>
          )}

          {report && !loading && (
            <>
              {/* KPI Banner */}
              <div className="bg-gradient-to-r from-emerald-900/60 to-slate-900 border border-emerald-500/20 rounded-2xl p-8 flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <p className="text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-1">Toplam Kurumsal Emisyon</p>
                  <p className="text-5xl font-black text-white">
                    {report.total_co2e.toLocaleString('tr-TR', { maximumFractionDigits: 1 })}
                    <span className="text-xl text-slate-400 ml-2 font-medium">ton CO₂e</span>
                  </p>
                  <p className="text-slate-500 text-xs mt-2">Raporlama yılı: {year}</p>
                </div>
                {/* Compliance badges */}
                <div className="flex flex-wrap gap-3">
                  {[
                    { icon: '✓', label: 'Doğrulanabilir', sub: 'Denetime Hazır', color: '#10b981' },
                    { icon: '✓', label: 'ETKB 2022', sub: 'Türkiye Grid Faktörü', color: '#3b82f6' },
                    { icon: '⚠', label: 'Kapsam 3', sub: 'Veri kalitesi düşük', color: '#f59e0b' },
                  ].map(b => (
                    <div key={b.label} className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 flex items-center gap-2.5 min-w-[150px]">
                      <span className="text-lg" style={{ color: b.color }}>{b.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-white">{b.label}</div>
                        <div className="text-xs text-slate-500">{b.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scope cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {Object.entries(report.breakdown).map(([scopeName, scopeData]: [string, any], idx) => {
                  const scopeTotal = scopeData._toplam as number
                  const pct = report.total_co2e > 0 ? (scopeTotal / report.total_co2e * 100).toFixed(1) : '0'
                  const color = SCOPE_COLORS[idx] ?? '#64748b'
                  return (
                    <div key={scopeName} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xs font-bold text-slate-400 leading-tight pr-2">{scopeName}</h3>
                        <span className="text-xs font-black px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: color + '20', color }}>
                          {pct}%
                        </span>
                      </div>
                      <p className="text-3xl font-black mb-5" style={{ color }}>
                        {scopeTotal.toLocaleString('tr-TR', { maximumFractionDigits: 1 })}
                        <span className="text-sm text-slate-500 ml-1 font-medium">t</span>
                      </p>
                      {/* Progress bar */}
                      <div className="h-1.5 bg-slate-800 rounded-full mb-4 overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <div className="space-y-2">
                        {Object.entries(scopeData).map(([k, v]: [string, any]) => {
                          if (k === '_toplam' || v === 0) return null
                          return (
                            <div key={k} className="flex justify-between text-xs">
                              <span className="text-slate-500 truncate mr-2" title={k}>{k}</span>
                              <span className="font-semibold text-slate-300 whitespace-nowrap">{(v as number).toLocaleString('tr-TR')} t</span>
                            </div>
                          )
                        })}
                        {scopeTotal === 0 && <p className="text-xs text-slate-600 italic">Bu kapsamda veri yok.</p>}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Methodology */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-6 py-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Metodoloji</p>
                <div className="flex flex-wrap gap-2">
                  {report.methodology_notes.map((n: string, i: number) => (
                    <span key={i} className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Trend Tab */}
      {activeTab === 'trend' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">Emisyon Trend Analizi</h2>

          {trendLoading ? (
            <p className="text-center text-slate-500 py-10">Yükleniyor...</p>
          ) : !trendData || trendData.trend?.length === 0 ? (
            <p className="text-center text-slate-500 py-10">
              {!companyId ? 'Önce Envanter sekmesinden bir yıl yükleyin.' : 'Trend verisi bulunamadı.'}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: `Baz Yıl (${trendData.base_year})`, value: `${trendData.base_year_total?.toLocaleString('tr-TR')} t`, color: '#94a3b8' },
                  { label: `Son Yıl (${trendData.latest_year})`, value: `${trendData.latest_total?.toLocaleString('tr-TR')} t`, color: '#94a3b8' },
                ].map(k => (
                  <div key={k.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">{k.label}</div>
                    <div className="text-xl font-black" style={{ color: k.color }}>{k.value}</div>
                  </div>
                ))}
                <div className={`col-span-2 p-4 rounded-xl border ${
                  trendData.total_reduction_pct < 0
                    ? 'bg-emerald-950/40 border-emerald-500/20'
                    : 'bg-red-950/40 border-red-500/20'
                }`}>
                  <p className="text-xs font-semibold text-slate-400 mb-1">Toplam Değişim</p>
                  <p className="text-2xl font-black" style={{ color: trendData.total_reduction_pct < 0 ? '#10b981' : '#ef4444' }}>
                    {trendData.total_reduction_pct > 0 ? '+' : ''}{trendData.total_reduction_pct}%
                  </p>
                </div>
              </div>

              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData.trend} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${v}t`} />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }}
                      labelStyle={{ color: '#94a3b8' }}
                      formatter={(value) => [`${Number(value ?? 0).toLocaleString('tr-TR')} ton`, '']}
                    />
                    <Legend iconType="circle" wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                    <Line type="monotone" name="Kapsam 1" dataKey="scope1" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4, fill: '#ef4444' }} />
                    <Line type="monotone" name="Kapsam 2" dataKey="scope2" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: '#f59e0b' }} />
                    <Line type="monotone" name="Kapsam 3" dataKey="scope3" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      )}

      <p className="text-xs text-slate-700 text-center">
        ISO 14064-1:2018 · IPCC 2006 · DEFRA 2022 · ETKB 2022 (Türkiye Elektrik Grid Faktörü: 0.4153 kg CO₂e/kWh)
      </p>
    </div>
  )
}
