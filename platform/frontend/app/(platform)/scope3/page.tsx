'use client'
import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer,
  PieChart, Pie, Legend,
} from 'recharts'
import { api } from '@/lib/api'

// ── Types ─────────────────────────────────────────────────────────────────────
interface S3Category {
  id: number; code: string; title: string; group: string; icon: string
  method: string; unit: string; sbti_included: boolean; typical_pct: number
  emissions_tco2e: number; is_hotspot: boolean
}
interface S3Result {
  total_scope3_tco2e: number; sbti_relevant_tco2e: number
  upstream_tco2e: number; downstream_tco2e: number
  scope3_vs_scope12_pct: number
  categories: S3Category[]
  hotspots: S3Category[]
  coverage_pct: number; data_quality: string
  reduction_priority: S3Category[]
}

// ── Config ────────────────────────────────────────────────────────────────────
const GROUP_COLOR = { upstream: '#3b82f6', downstream: '#8b5cf6' }
const CAT_COLORS = [
  '#10b981','#3b82f6','#8b5cf6','#ec4899','#f59e0b','#ef4444','#06b6d4',
  '#84cc16','#f97316','#6366f1','#14b8a6','#e879f9','#fb923c','#a78bfa','#34d399',
]

const CUSTOM_LABEL = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
  cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number
}) => {
  if (percent < 0.04) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10}>{`${(percent * 100).toFixed(0)}%`}</text>
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Scope3Page() {
  const [result, setResult] = useState<S3Result | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'categories' | 'input'>('overview')
  const [inputs, setInputs] = useState<Record<number, number>>({})
  const [scope12, setScope12] = useState(1284)
  const [calculating, setCalculating] = useState(false)

  useEffect(() => {
    api.scope3.demo().then(d => {
      const r = d as S3Result
      setResult(r)
      const init: Record<number, number> = {}
      r.categories.forEach(c => { init[c.id] = c.emissions_tco2e })
      setInputs(init)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function calculate() {
    setCalculating(true)
    try {
      const d = await api.scope3.calculate({ category_inputs: inputs, total_scope1_2: scope12 })
      setResult(d as S3Result)
      setTab('overview')
    } catch { /* demo */ } finally { setCalculating(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-emerald-400 animate-pulse">Kapsam 3 hesaplanıyor…</div>
    </div>
  )

  const r = result!
  const nonZero = r.categories.filter(c => c.emissions_tco2e > 0)
  const pieData = nonZero.map(c => ({ name: `Cat ${c.id}`, value: c.emissions_tco2e }))
  const barData = r.categories.map(c => ({ code: `Cat ${c.id}`, value: c.emissions_tco2e, group: c.group }))

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xl">🔗</div>
          <div>
            <h1 className="text-xl font-bold text-white">Kapsam 3 Değer Zinciri Hesaplayıcı</h1>
            <p className="text-xs text-slate-400">GHG Protocol · 15 Kategori · Upstream & Downstream · Hotspot Analizi</p>
          </div>
          <div className="ml-auto flex gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">GHG Protocol</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Sprint 35</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Toplam Kapsam 3', value: `${r.total_scope3_tco2e.toLocaleString()} tCO₂e`, color: '#8b5cf6' },
            { label: 'SBTi İlgili', value: `${r.sbti_relevant_tco2e.toLocaleString()} tCO₂e`, color: '#3b82f6' },
            { label: 'Yukarı Akış', value: `${r.upstream_tco2e.toLocaleString()} tCO₂e`, color: '#3b82f6' },
            { label: 'Aşağı Akış', value: `${r.downstream_tco2e.toLocaleString()} tCO₂e`, color: '#8b5cf6' },
            { label: 'Kapsam 1+2 Oranı', value: `%${r.scope3_vs_scope12_pct}`, color: '#f59e0b' },
          ].map(k => (
            <div key={k.label} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="text-lg font-bold" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Data quality banner */}
        <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3">
          <span className="text-lg">📊</span>
          <div className="text-sm"><span className="text-white font-medium">Veri Kalitesi:</span> <span className="text-slate-300">{r.data_quality}</span></div>
          <div className="ml-auto text-sm text-slate-400">Kapsam: %{r.coverage_pct} ({nonZero.length}/15 kategori)</div>
        </div>

        {/* Hotspots */}
        {r.hotspots.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {r.hotspots.map(h => (
              <div key={h.id} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{h.icon}</span>
                  <span className="text-xs font-bold text-red-400">🔥 HOTSPOT</span>
                  <span className="ml-auto text-xs font-mono text-slate-400">{h.code}</span>
                </div>
                <div className="font-semibold text-white text-sm">{h.title}</div>
                <div className="text-xl font-black text-red-400 mt-1">{h.emissions_tco2e.toLocaleString()} tCO₂e</div>
                <div className="text-xs text-slate-500 mt-0.5">{h.method}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800/50 border border-slate-700 rounded-xl p-1 w-fit">
          {([['overview', '📊 Genel Bakış'], ['categories', '📋 15 Kategori'], ['input', '✏️ Veri Girişi']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === id ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ─────────────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <div className="text-sm font-semibold text-slate-300 mb-4">Kategori Dağılımı</div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} labelLine={false}
                    label={(props) => CUSTOM_LABEL(props as Parameters<typeof CUSTOM_LABEL>[0])}>
                    {pieData.map((_, idx) => <Cell key={idx} fill={CAT_COLORS[idx % CAT_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                    formatter={(v) => [Number(v ?? 0).toLocaleString() + ' tCO₂e', '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <div className="text-sm font-semibold text-slate-300 mb-4">Kategori Bazlı Emisyonlar</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} layout="vertical" margin={{ left: 35 }}>
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 9 }} tickFormatter={v => v > 999 ? (v / 1000).toFixed(1) + 'k' : String(v)} />
                  <YAxis type="category" dataKey="code" tick={{ fill: '#94a3b8', fontSize: 9 }} width={38} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                    formatter={(v) => [Number(v ?? 0).toLocaleString() + ' tCO₂e', '']} />
                  <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                    {barData.map(d => <Cell key={d.code} fill={GROUP_COLOR[d.group as keyof typeof GROUP_COLOR] ?? '#64748b'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-3 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Yukarı Akış</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" />Aşağı Akış</span>
              </div>
            </div>

            {/* Reduction priority */}
            <div className="md:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <div className="text-sm font-semibold text-slate-300 mb-4">🎯 Azaltma Öncelik Sıralaması (Top 5)</div>
              <div className="space-y-2">
                {r.reduction_priority.filter(c => c.emissions_tco2e > 0).map((c, i) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    <span className="text-base">{c.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm text-white">{c.code} — {c.title}</span>
                        <span className="text-sm font-bold text-purple-400">{c.emissions_tco2e.toLocaleString()} tCO₂e</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-purple-500"
                          style={{ width: `${Math.min(100, c.emissions_tco2e / r.total_scope3_tco2e * 100)}%` }} />
                      </div>
                    </div>
                    {c.sbti_included && <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 flex-shrink-0">SBTi</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CATEGORIES ────────────────────────────────────────────────────── */}
        {tab === 'categories' && (
          <div className="space-y-2">
            {(['upstream', 'downstream'] as const).map(group => (
              <div key={group}>
                <div className="text-xs font-bold uppercase tracking-widest px-1 py-2" style={{ color: GROUP_COLOR[group] }}>
                  {group === 'upstream' ? '⬆ Yukarı Akış (Cat 1–8)' : '⬇ Aşağı Akış (Cat 9–15)'}
                </div>
                {r.categories.filter(c => c.group === group).map(c => (
                  <div key={c.id} className={`bg-slate-800/50 border rounded-xl p-4 mb-2 flex items-center gap-4 ${c.is_hotspot ? 'border-red-500/30' : 'border-slate-700'}`}>
                    <span className="text-xl">{c.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-500 flex-shrink-0">{c.code}</span>
                        <span className="font-medium text-white text-sm truncate">{c.title}</span>
                        {c.is_hotspot && <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 flex-shrink-0">🔥 Hotspot</span>}
                        {c.sbti_included && <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 flex-shrink-0">SBTi</span>}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{c.method}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-white">{c.emissions_tco2e > 0 ? c.emissions_tco2e.toLocaleString() : '—'}</div>
                      <div className="text-xs text-slate-500">tCO₂e</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ── INPUT ────────────────────────────────────────────────────────── */}
        {tab === 'input' && (
          <div className="space-y-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center gap-4">
              <label className="text-sm font-medium text-slate-300 flex-shrink-0">Kapsam 1+2 Toplamı (tCO₂e):</label>
              <input type="number" value={scope12} onChange={e => setScope12(Number(e.target.value))}
                className="w-40 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 text-sm" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {r.categories.map(c => (
                <div key={c.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
                  <span className="text-xl flex-shrink-0">{c.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono text-slate-500">{c.code}</div>
                    <div className="text-sm text-white truncate">{c.title}</div>
                    <div className="text-xs text-slate-600">{c.method}</div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1">
                    <input
                      type="number" min={0} step={10}
                      value={inputs[c.id] ?? 0}
                      onChange={e => setInputs(prev => ({ ...prev, [c.id]: Number(e.target.value) }))}
                      placeholder="tCO₂e"
                      className="w-28 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 text-right"
                    />
                    <span className="text-xs text-slate-600">tCO₂e</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button onClick={calculate} disabled={calculating}
                className="px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold transition-all disabled:opacity-60 flex items-center gap-2">
                {calculating ? <span className="animate-spin">⏳</span> : '🔗'}
                {calculating ? 'Hesaplanıyor…' : 'Kapsam 3 Hesapla'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
