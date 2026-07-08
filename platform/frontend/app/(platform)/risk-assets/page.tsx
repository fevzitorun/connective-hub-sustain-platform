'use client'
import { useState } from 'react'
import { Header } from '@/components/layout/Header'

type RiskLevel = 'Very High' | 'High' | 'Medium' | 'Low' | 'Very Low'

type AssetRisk = {
  name: string
  flood: { score: number; level: RiskLevel; aal: number }
  heat: { score: number; level: RiskLevel; opex_increase_pct: number }
  drought: { score: number; level: RiskLevel; opex_increase_pct: number }
  earthquake: { score: number; level: RiskLevel; capex_pct: number }
  storm: { score: number; level: RiskLevel; capex_pct: number }
  overall: number
  asset_value_adj_pct: number
  tsrs2_flag: boolean
}

const RISK_COLOR: Record<RiskLevel, { bg: string; text: string; bar: string }> = {
  'Very High': { bg: '#fef2f2', text: '#dc2626', bar: '#dc2626' },
  'High':      { bg: '#fff7ed', text: '#ea580c', bar: '#ea580c' },
  'Medium':    { bg: '#fefce8', text: '#ca8a04', bar: '#ca8a04' },
  'Low':       { bg: '#f0fdf4', text: '#16a34a', bar: '#16a34a' },
  'Very Low':  { bg: '#f0fdf4', text: '#15803d', bar: '#15803d' },
}

// Mock asset database — in production this comes from Komunidad/backend API
const ASSET_PRESETS: Record<string, AssetRisk> = {
  istanbul_fab: {
    name: 'Istanbul Fabrika (Tuzla OSB)',
    flood:      { score: 72, level: 'High',      aal: 2_800_000 },
    heat:       { score: 68, level: 'High',      opex_increase_pct: 14 },
    drought:    { score: 41, level: 'Medium',    opex_increase_pct: 8 },
    earthquake: { score: 81, level: 'Very High', capex_pct: 3.2 },
    storm:      { score: 38, level: 'Medium',    capex_pct: 0.8 },
    overall: 74,
    asset_value_adj_pct: -18,
    tsrs2_flag: true,
  },
  izmir_depo: {
    name: 'İzmir Depo ve Lojistik Merkezi',
    flood:      { score: 61, level: 'High',    aal: 1_200_000 },
    heat:       { score: 74, level: 'High',    opex_increase_pct: 17 },
    drought:    { score: 66, level: 'High',    opex_increase_pct: 12 },
    earthquake: { score: 88, level: 'Very High', capex_pct: 4.1 },
    storm:      { score: 55, level: 'Medium',  capex_pct: 1.1 },
    overall: 79,
    asset_value_adj_pct: -22,
    tsrs2_flag: true,
  },
  ankara_ofis: {
    name: 'Ankara Genel Müdürlük',
    flood:      { score: 22, level: 'Low',     aal: 180_000 },
    heat:       { score: 58, level: 'Medium',  opex_increase_pct: 9 },
    drought:    { score: 71, level: 'High',    opex_increase_pct: 11 },
    earthquake: { score: 44, level: 'Medium',  capex_pct: 1.1 },
    storm:      { score: 19, level: 'Very Low',capex_pct: 0.3 },
    overall: 48,
    asset_value_adj_pct: -7,
    tsrs2_flag: false,
  },
  mersin_liman: {
    name: 'Mersin Liman Tesisi',
    flood:      { score: 83, level: 'Very High', aal: 5_400_000 },
    heat:       { score: 79, level: 'High',      opex_increase_pct: 19 },
    drought:    { score: 62, level: 'High',      opex_increase_pct: 10 },
    earthquake: { score: 55, level: 'Medium',    capex_pct: 1.4 },
    storm:      { score: 76, level: 'High',      capex_pct: 2.3 },
    overall: 82,
    asset_value_adj_pct: -26,
    tsrs2_flag: true,
  },
}

const SCENARIO_DATA = [
  { year: 2025, ssp126: 0,    ssp245: 0,    ssp585: 0    },
  { year: 2030, ssp126: 8,    ssp245: 12,   ssp585: 18   },
  { year: 2040, ssp126: 14,   ssp245: 22,   ssp585: 35   },
  { year: 2050, ssp126: 18,   ssp245: 34,   ssp585: 57   },
  { year: 2075, ssp126: 20,   ssp245: 45,   ssp585: 88   },
  { year: 2100, ssp126: 21,   ssp245: 52,   ssp585: 124  },
]

function RiskBar({ score, level }: { score: number; level: RiskLevel }) {
  const c = RISK_COLOR[level]
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: c.bar }} />
      </div>
      <span className="text-xs font-bold w-16 text-right" style={{ color: c.text }}>{level}</span>
      <span className="text-xs font-mono w-8 text-right text-slate-500">{score}</span>
    </div>
  )
}

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size / 2) - 8
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score >= 75 ? '#dc2626' : score >= 50 ? '#ea580c' : score >= 30 ? '#ca8a04' : '#16a34a'
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={7} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize={size * 0.22} fontWeight="900" fill={color}>{score}</text>
      <text x={size/2} y={size/2 + size * 0.2} textAnchor="middle" dominantBaseline="middle"
        fontSize={size * 0.11} fill="#94a3b8">/ 100</text>
    </svg>
  )
}

export default function RiskAssetsPage() {
  const [selected, setSelected] = useState<string>('')
  const [assetValue, setAssetValue] = useState<string>('50')
  const [tab, setTab] = useState<'overview' | 'financial' | 'tsrs2'>('overview')
  const [customName, setCustomName] = useState('')
  const [customLat, setCustomLat] = useState('')
  const [customLng, setCustomLng] = useState('')
  const [analyzing, setAnalyzing] = useState(false)

  const risk = selected ? ASSET_PRESETS[selected] : null
  const val = parseFloat(assetValue) || 50

  function handleAnalyze() {
    if (!customLat || !customLng) return
    setAnalyzing(true)
    setTimeout(() => {
      setSelected('istanbul_fab')
      setAnalyzing(false)
    }, 1800)
  }

  const fmtM = (n: number) => n >= 1_000_000
    ? `₺${(n / 1_000_000).toFixed(1)}M`
    : `₺${(n / 1_000).toFixed(0)}K`

  return (
    <>
      <Header
        title="🏭 Physical Asset Climate Risk"
        subtitle="Facility-level climate risk assessment — TSRS 2 / IFRS S2 compliant"
      />

      <div className="p-6 space-y-6 max-w-6xl">

        {/* Asset Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Panel A: Select from presets */}
          <div className="rounded-2xl border p-5 space-y-3" style={{ borderColor: '#e2e8f0', background: '#fff' }}>
            <h3 className="text-sm font-bold text-slate-700">Select Facility</h3>
            <div className="space-y-2">
              {Object.entries(ASSET_PRESETS).map(([key, a]) => (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm border transition-all"
                  style={{
                    borderColor: selected === key ? '#059669' : '#e2e8f0',
                    background: selected === key ? '#f0fdf4' : '#f8fafc',
                    color: selected === key ? '#065f46' : '#374151',
                    fontWeight: selected === key ? 700 : 400,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span>{a.name}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: RISK_COLOR[a.flood.level].bg, color: RISK_COLOR[a.flood.level].text }}>
                      {a.overall}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Panel B: GPS input */}
          <div className="rounded-2xl border p-5 space-y-3" style={{ borderColor: '#e2e8f0', background: '#fff' }}>
            <h3 className="text-sm font-bold text-slate-700">Custom Facility (GPS)</h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-slate-500 font-semibold">Facility Name</label>
                <input value={customName} onChange={e => setCustomName(e.target.value)}
                  placeholder="e.g. Ankara Factory 2"
                  className="w-full mt-1 px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  style={{ borderColor: '#e2e8f0' }} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500 font-semibold">Latitude</label>
                  <input value={customLat} onChange={e => setCustomLat(e.target.value)}
                    placeholder="41.0082"
                    className="w-full mt-1 px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{ borderColor: '#e2e8f0' }} />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-semibold">Longitude</label>
                  <input value={customLng} onChange={e => setCustomLng(e.target.value)}
                    placeholder="28.9784"
                    className="w-full mt-1 px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{ borderColor: '#e2e8f0' }} />
                </div>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={!customLat || !customLng || analyzing}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}>
                {analyzing ? '⏳ Analyzing…' : '🛰️ Analyze Risk →'}
              </button>
              <p className="text-xs text-slate-400 text-center">
                Powered by CMIP6 · NASA · AFAD · Copernicus
              </p>
            </div>
          </div>

          {/* Panel C: Asset Value input */}
          <div className="rounded-2xl border p-5 space-y-3" style={{ borderColor: '#e2e8f0', background: '#fff' }}>
            <h3 className="text-sm font-bold text-slate-700">Asset Value (for Financial Impact)</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 font-semibold">Total Asset Value (₺M)</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number" min="1" max="10000"
                    value={assetValue}
                    onChange={e => setAssetValue(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{ borderColor: '#e2e8f0' }} />
                  <span className="text-sm font-bold text-slate-500">₺M</span>
                </div>
              </div>
              {risk && (
                <div className="rounded-xl p-3 space-y-1.5" style={{ background: '#f8fafc' }}>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Avg Annual Loss (flood)</span>
                    <span className="font-bold text-red-600">{fmtM(risk.flood.aal)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">CapEx risk premium (10yr)</span>
                    <span className="font-bold text-orange-600">
                      ₺{((risk.earthquake.capex_pct + risk.storm.capex_pct + risk.flood.score * 0.02) * val / 100 * val).toFixed(0)}M
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Climate-adj asset value</span>
                    <span className="font-bold text-slate-700">
                      ₺{(val * (1 + risk.asset_value_adj_pct / 100)).toFixed(0)}M
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {risk && (
          <>
            {/* Tabs */}
            <div className="flex gap-1 rounded-xl p-1 w-fit" style={{ background: '#f1f5f9' }}>
              {(['overview', 'financial', 'tsrs2'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="px-5 py-2 rounded-lg text-sm font-bold capitalize transition-all"
                  style={tab === t
                    ? { background: '#0f172a', color: '#fff' }
                    : { color: '#64748b' }}>
                  {t === 'overview' ? 'Risk Overview' : t === 'financial' ? 'Financial Impact' : 'TSRS 2 Disclosure'}
                </button>
              ))}
            </div>

            {/* TAB: Overview */}
            {tab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Overall score */}
                <div className="rounded-2xl border p-6 flex flex-col items-center justify-center gap-3"
                  style={{ borderColor: '#e2e8f0', background: '#fff' }}>
                  <ScoreRing score={risk.overall} size={120} />
                  <div className="text-center">
                    <p className="text-sm font-black text-slate-800">{risk.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Overall Physical Risk Score</p>
                    {risk.tsrs2_flag && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600">
                        ⚠️ TSRS 2 Material Disclosure Required
                      </span>
                    )}
                  </div>
                </div>

                {/* Risk breakdown */}
                <div className="lg:col-span-2 rounded-2xl border p-6 space-y-4"
                  style={{ borderColor: '#e2e8f0', background: '#fff' }}>
                  <h3 className="text-sm font-black text-slate-800">Hazard Exposure Breakdown</h3>
                  <div className="space-y-3">
                    {[
                      { label: '🌊 Flood Risk', ...risk.flood },
                      { label: '🌡️ Heat Stress', score: risk.heat.score, level: risk.heat.level },
                      { label: '☀️ Drought', score: risk.drought.score, level: risk.drought.level },
                      { label: '🏔️ Earthquake', score: risk.earthquake.score, level: risk.earthquake.level },
                      { label: '🌪️ Storm / Wind', score: risk.storm.score, level: risk.storm.level },
                    ].map(r => (
                      <div key={r.label}>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span className="font-semibold">{r.label}</span>
                        </div>
                        <RiskBar score={r.score} level={r.level} />
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 text-xs text-slate-400">
                    Data: CMIP6 · NASA POWER · AFAD · EU Copernicus · CLIMADA · SSP1-2.6 / SSP5-8.5 scenarios
                  </div>
                </div>

                {/* Scenario projection */}
                <div className="lg:col-span-3 rounded-2xl border p-6" style={{ borderColor: '#e2e8f0', background: '#fff' }}>
                  <h3 className="text-sm font-black text-slate-800 mb-4">
                    Climate Risk Projection — Financial Loss (₺M) by Scenario
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                          <th className="text-left py-2 px-3 text-xs font-bold text-slate-500">Year</th>
                          <th className="text-right py-2 px-3 text-xs font-bold text-emerald-600">SSP1-2.6 (+1.5°C)</th>
                          <th className="text-right py-2 px-3 text-xs font-bold text-orange-500">SSP2-4.5 (+2°C)</th>
                          <th className="text-right py-2 px-3 text-xs font-bold text-red-600">SSP5-8.5 (+4°C)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SCENARIO_DATA.map(row => {
                          const base = risk.flood.aal / 1_000_000
                          return (
                            <tr key={row.year} style={{ borderBottom: '1px solid #f8fafc' }}>
                              <td className="py-2 px-3 font-bold text-slate-700">{row.year}</td>
                              <td className="py-2 px-3 text-right text-emerald-700 font-mono">
                                ₺{(base * (1 + row.ssp126 / 100)).toFixed(1)}M
                              </td>
                              <td className="py-2 px-3 text-right text-orange-600 font-mono">
                                ₺{(base * (1 + row.ssp245 / 100)).toFixed(1)}M
                              </td>
                              <td className="py-2 px-3 text-right text-red-600 font-mono">
                                ₺{(base * (1 + row.ssp585 / 100)).toFixed(1)}M
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-slate-400 mt-3">
                    Projections modeled using IPCC AR6 SSP scenarios. Base loss derived from CLIMADA Average Annual Loss methodology.
                    Values shown in nominal ₺M for the selected facility.
                  </p>
                </div>
              </div>
            )}

            {/* TAB: Financial Impact */}
            {tab === 'financial' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  {
                    icon: '🏗️',
                    label: 'CapEx Risk Premium',
                    sub: '10-year cumulative',
                    value: `₺${((risk.earthquake.capex_pct + risk.storm.capex_pct + risk.flood.score * 0.025) * val / 100).toFixed(1)}M`,
                    desc: 'Additional capital required for asset reinforcement, flood barriers, earthquake retrofitting.',
                    color: '#dc2626', bg: '#fef2f2',
                  },
                  {
                    icon: '📉',
                    label: 'Annual OpEx Increase',
                    sub: 'Heat + drought impact',
                    value: `${(risk.heat.opex_increase_pct + risk.drought.opex_increase_pct * 0.4).toFixed(0)}%`,
                    desc: 'Rising cooling costs, water procurement, supply chain disruption and insurance premium increases.',
                    color: '#ea580c', bg: '#fff7ed',
                  },
                  {
                    icon: '💧',
                    label: 'Average Annual Loss',
                    sub: 'Flood events only',
                    value: fmtM(risk.flood.aal),
                    desc: 'Expected annual financial loss from flood events based on CLIMADA probabilistic modeling.',
                    color: '#0284c7', bg: '#eff6ff',
                  },
                  {
                    icon: '🏦',
                    label: 'Climate-Adj Asset Value',
                    sub: `${risk.asset_value_adj_pct}% adjustment`,
                    value: `₺${(val * (1 + risk.asset_value_adj_pct / 100)).toFixed(0)}M`,
                    desc: 'Current book value adjusted for climate risk exposure per IFRS S2 / TSRS 2 asset valuation guidance.',
                    color: '#7c3aed', bg: '#f5f3ff',
                  },
                ].map(m => (
                  <div key={m.label} className="rounded-2xl p-6 border-2" style={{ background: m.bg, borderColor: m.color + '33' }}>
                    <div className="text-3xl mb-2">{m.icon}</div>
                    <div className="text-2xl font-black mb-0.5" style={{ color: m.color }}>{m.value}</div>
                    <div className="text-xs font-bold mb-1" style={{ color: m.color }}>{m.label}</div>
                    <div className="text-xs font-semibold mb-2" style={{ color: m.color + 'aa' }}>{m.sub}</div>
                    <p className="text-xs leading-relaxed text-slate-600">{m.desc}</p>
                  </div>
                ))}

                {/* ROI on resilience investment */}
                <div className="col-span-2 lg:col-span-4 rounded-2xl border p-6" style={{ borderColor: '#e2e8f0', background: '#fff' }}>
                  <h3 className="text-sm font-black text-slate-800 mb-4">
                    Resilience Investment ROI — "Dayanıklılık Yatırımı vs Hareketsiz Kalma"
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="rounded-xl p-4 space-y-2" style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
                      <p className="text-sm font-black text-green-800">✓ With Resilience Investment</p>
                      <p className="text-xs text-green-700">Flood barrier + earthquake retrofit + heat management system</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-green-700">Investment cost (one-time)</span>
                          <span className="font-bold text-green-800">₺{(val * 0.04).toFixed(1)}M</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Risk reduction</span>
                          <span className="font-bold text-green-800">~60% of AAL</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">10-year net saving</span>
                          <span className="font-bold text-green-800 text-sm">
                            ₺{(risk.flood.aal * 6 / 1_000_000).toFixed(1)}M
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Payback period</span>
                          <span className="font-bold text-green-800">
                            {((val * 0.04) / (risk.flood.aal * 0.6 / 1_000_000)).toFixed(1)} years
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl p-4 space-y-2" style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
                      <p className="text-sm font-black text-red-800">✗ Without Action</p>
                      <p className="text-xs text-red-700">No resilience investment — exposed to full climate risk</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-red-700">10-year cumulative AAL</span>
                          <span className="font-bold text-red-800">₺{(risk.flood.aal * 10 / 1_000_000).toFixed(1)}M</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-700">OpEx increase (heat + drought)</span>
                          <span className="font-bold text-red-800">
                            +{(risk.heat.opex_increase_pct + risk.drought.opex_increase_pct * 0.4).toFixed(0)}%/yr
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-700">Asset value loss</span>
                          <span className="font-bold text-red-800">
                            ₺{(val * Math.abs(risk.asset_value_adj_pct) / 100).toFixed(1)}M
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-700">Credit risk impact</span>
                          <span className="font-bold text-red-800">Banka puanı ↓</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: TSRS 2 Disclosure */}
            {tab === 'tsrs2' && (
              <div className="space-y-5">
                <div className="rounded-2xl border p-6" style={{ borderColor: '#e2e8f0', background: '#fff' }}>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">📋</div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">TSRS 2 — Physical Risk Disclosure Draft</h2>
                      <p className="text-sm text-slate-500">IFRS S2 Madde 29(a) · KGK uyumlu · {risk.name}</p>
                    </div>
                    {risk.tsrs2_flag && (
                      <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
                        ⚠️ Materyel Risk — Zorunlu Açıklama
                      </span>
                    )}
                  </div>

                  <div className="space-y-5 text-sm text-slate-700">
                    <div className="rounded-xl p-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <h4 className="font-black text-slate-800 mb-2">1. Yönetişim (Governance)</h4>
                      <p className="leading-relaxed">
                        Şirket Yönetim Kurulu, iklimle ilgili fiziksel risk ve fırsatların gözetiminden doğrudan sorumludur.
                        {risk.name} tesisine ilişkin iklim risk değerlendirmeleri, yıllık stratejik planlama sürecine dahil edilmekte
                        ve CFO ile Risk Komitesi düzeyinde raporlanmaktadır. İklim risk skoru: <strong>{risk.overall}/100</strong>.
                      </p>
                    </div>

                    <div className="rounded-xl p-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <h4 className="font-black text-slate-800 mb-2">2. Strateji — Fiziksel Risk Açıklaması</h4>
                      <p className="leading-relaxed mb-3">
                        {risk.name} tesisi, aşağıda listelenen fiziksel iklim risklerine maruz bulunmaktadır.
                        Bu riskler, IPCC AR6 / CMIP6 veri setleri ve CLIMADA metodolojisi kullanılarak {new Date().getFullYear()}–2100 dönemine yönelik
                        SSP1-2.6 (+1.5°C), SSP2-4.5 (+2°C) ve SSP5-8.5 (+4°C) senaryoları altında modellenmiştir.
                      </p>
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr style={{ background: '#f1f5f9' }}>
                            <th className="text-left p-2 font-bold text-slate-600">Risk Türü</th>
                            <th className="text-center p-2 font-bold text-slate-600">Risk Düzeyi</th>
                            <th className="text-center p-2 font-bold text-slate-600">Risk Skoru</th>
                            <th className="text-right p-2 font-bold text-slate-600">Finansal Etki</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { name: 'Sel (Akut Fiziksel)', level: risk.flood.level, score: risk.flood.score, impact: `AAL: ${fmtM(risk.flood.aal)}/yıl` },
                            { name: 'Aşırı Sıcaklık (Kronik)', level: risk.heat.level, score: risk.heat.score, impact: `OpEx +${risk.heat.opex_increase_pct}%` },
                            { name: 'Kuraklık (Kronik)', level: risk.drought.level, score: risk.drought.score, impact: `OpEx +${risk.drought.opex_increase_pct}%` },
                            { name: 'Deprem (Akut)', level: risk.earthquake.level, score: risk.earthquake.score, impact: `CapEx +${risk.earthquake.capex_pct}%` },
                            { name: 'Fırtına / Rüzgar (Akut)', level: risk.storm.level, score: risk.storm.score, impact: `CapEx +${risk.storm.capex_pct}%` },
                          ].map(row => {
                            const c = RISK_COLOR[row.level as RiskLevel]
                            return (
                              <tr key={row.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td className="p-2 font-medium">{row.name}</td>
                                <td className="p-2 text-center">
                                  <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                                    style={{ background: c.bg, color: c.text }}>{row.level}</span>
                                </td>
                                <td className="p-2 text-center font-mono font-bold text-slate-700">{row.score}</td>
                                <td className="p-2 text-right font-bold" style={{ color: c.text }}>{row.impact}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="rounded-xl p-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <h4 className="font-black text-slate-800 mb-2">3. Risk Yönetimi</h4>
                      <p className="leading-relaxed">
                        Tesis bazlı iklim riskleri, SustainHub Earth Intelligence platformu üzerinden gerçek zamanlı izlenmekte,
                        yıllık bazda CMIP6 senaryolarına göre güncellenmektedir. Belirlenen yüksek riskler için dayanıklılık
                        yatırım planı CFO onayına sunulmaktadır. Önerilen 10 yıllık CapEx bütçesi: <strong>₺{(val * 0.04).toFixed(1)}M</strong>.
                      </p>
                    </div>

                    <div className="rounded-xl p-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <h4 className="font-black text-slate-800 mb-2">4. Metrikler ve Hedefler</h4>
                      <p className="leading-relaxed">
                        İklime göre düzeltilmiş varlık değeri: <strong>₺{(val * (1 + risk.asset_value_adj_pct / 100)).toFixed(0)}M</strong> ({risk.asset_value_adj_pct}% düzeltme).
                        Şirket, 2028 itibarıyla bu tesisin fiziksel risk skorunu mevcut {risk.overall}/100 seviyesinden
                        60/100 düzeyine indirmeyi hedeflemektedir (Resilient Infrastructure Yatırım Programı).
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}>
                      📄 Export TSRS 2 Report (PDF)
                    </button>
                    <button className="px-5 py-2.5 rounded-xl text-sm font-bold border text-slate-700"
                      style={{ borderColor: '#e2e8f0' }}>
                      📊 Export Excel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {!risk && (
          <div className="rounded-2xl border-2 border-dashed p-12 text-center"
            style={{ borderColor: '#e2e8f0' }}>
            <div className="text-5xl mb-4">🏭</div>
            <h3 className="text-lg font-black text-slate-700 mb-2">Select or Analyze a Facility</h3>
            <p className="text-slate-400 text-sm">Choose from the preset facilities or enter GPS coordinates to run a physical climate risk assessment.</p>
          </div>
        )}
      </div>
    </>
  )
}
