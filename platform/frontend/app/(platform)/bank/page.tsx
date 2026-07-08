'use client'
import { useState } from 'react'
import { Header } from '@/components/layout/Header'

// ── Types ────────────────────────────────────────────────────────────────────

type DQS = 1 | 2 | 3 | 4 | 5
type AssetClass = 'Mortgage' | 'Commercial RE' | 'Corporate' | 'SME' | 'Auto' | 'Project Finance'
type TaxonomyStatus = 'aligned' | 'eligible' | 'not-eligible'

interface PortfolioRow {
  name: string
  sector: string
  exposure: string  // ₺M
  pcafDqs: DQS
  co2eKt: number
  garPct: number
  taxonomy: TaxonomyStatus
  assetClass: AssetClass
  rbaKnockout: boolean
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const PORTFOLIO: PortfolioRow[] = [
  { name: 'Enerji A.Ş.', sector: 'Renewable Energy', exposure: '₺1,240M', pcafDqs: 1, co2eKt: 12.4, garPct: 94, taxonomy: 'aligned', assetClass: 'Project Finance', rbaKnockout: false },
  { name: 'İnşaat Holding', sector: 'Real Estate', exposure: '₺870M', pcafDqs: 2, co2eKt: 48.2, garPct: 61, taxonomy: 'eligible', assetClass: 'Commercial RE', rbaKnockout: false },
  { name: 'Çelik San. A.Ş.', sector: 'Steel / Manufacturing', exposure: '₺640M', pcafDqs: 3, co2eKt: 189.7, garPct: 8, taxonomy: 'not-eligible', assetClass: 'Corporate', rbaKnockout: false },
  { name: 'Tarım KOBİ', sector: 'Agriculture', exposure: '₺210M', pcafDqs: 4, co2eKt: 22.1, garPct: 43, taxonomy: 'eligible', assetClass: 'SME', rbaKnockout: false },
  { name: 'Ulaşım Ltd.', sector: 'Transport', exposure: '₺480M', pcafDqs: 2, co2eKt: 67.5, garPct: 31, taxonomy: 'not-eligible', assetClass: 'Corporate', rbaKnockout: false },
  { name: 'Konut Projesi', sector: 'Residential', exposure: '₺1,100M', pcafDqs: 1, co2eKt: 8.9, garPct: 88, taxonomy: 'aligned', assetClass: 'Mortgage', rbaKnockout: false },
  { name: 'Petrokimya A.Ş.', sector: 'Oil & Gas', exposure: '₺320M', pcafDqs: 3, co2eKt: 312.0, garPct: 0, taxonomy: 'not-eligible', assetClass: 'Corporate', rbaKnockout: true },
  { name: 'Tekstil San.', sector: 'Manufacturing', exposure: '₺155M', pcafDqs: 4, co2eKt: 31.3, garPct: 22, taxonomy: 'not-eligible', assetClass: 'SME', rbaKnockout: false },
]

const GAR_OVER_TIME = [
  { year: '2021', gar: 31 }, { year: '2022', gar: 38 }, { year: '2023', gar: 44 },
  { year: '2024', gar: 52 }, { year: '2025', gar: 57 }, { year: '2026E', gar: 63 },
  { year: '2027T', gar: 70 },
]

const ASSET_CLASS_MIX = [
  { cls: 'Mortgage', pct: 28, co2: 8.9, color: '#10b981' },
  { cls: 'Project Finance', pct: 24, co2: 12.4, color: '#6366f1' },
  { cls: '商 RE', pct: 17, co2: 48.2, color: '#f59e0b' },
  { cls: 'Corporate', pct: 18, co2: 569.2, color: '#ef4444' },
  { cls: 'SME', pct: 7, co2: 53.4, color: '#3b82f6' },
  { cls: 'Auto', pct: 6, co2: 22.1, color: '#8b5cf6' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

const DQS_LABEL: Record<DQS, { label: string; color: string; bg: string }> = {
  1: { label: 'DQS-1', color: '#166534', bg: '#dcfce7' },
  2: { label: 'DQS-2', color: '#155e75', bg: '#cffafe' },
  3: { label: 'DQS-3', color: '#92400e', bg: '#fef3c7' },
  4: { label: 'DQS-4', color: '#9a3412', bg: '#ffedd5' },
  5: { label: 'DQS-5', color: '#7f1d1d', bg: '#fee2e2' },
}

const TAXONOMY_BADGE: Record<TaxonomyStatus, { label: string; color: string; bg: string }> = {
  aligned: { label: '✓ Aligned', color: '#166534', bg: '#dcfce7' },
  eligible: { label: '~ Eligible', color: '#92400e', bg: '#fef3c7' },
  'not-eligible': { label: '✗ Not Eligible', color: '#7f1d1d', bg: '#fee2e2' },
}

function KpiCard({ icon, label, value, sub, color = '#0f172a' }: {
  icon: string; label: string; value: string; sub: string; color?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-3xl font-black mb-1" style={{ color }}>{value}</div>
      <div className="text-xs text-slate-500">{sub}</div>
    </div>
  )
}

function GARBar({ year, gar, target }: { year: string; gar: number; target?: boolean }) {
  const isProjection = year.includes('E') || year.includes('T')
  return (
    <div className="flex items-end gap-1.5">
      <div className="flex flex-col items-center gap-1 flex-1">
        <span className="text-xs font-bold" style={{ color: gar >= 50 ? '#166534' : '#92400e' }}>{gar}%</span>
        <div className="w-full relative rounded-t-lg overflow-hidden" style={{ height: `${(gar / 80) * 120}px` }}>
          <div
            className="absolute bottom-0 w-full rounded-t-lg transition-all"
            style={{
              height: '100%',
              background: target ? 'repeating-linear-gradient(45deg, #10b981, #10b981 4px, #dcfce7 4px, #dcfce7 8px)' :
                isProjection ? '#6ee7b7' : '#10b981',
              opacity: isProjection ? 0.7 : 1,
            }}
          />
        </div>
        <span className="text-xs text-slate-500">{year}</span>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function BankIntelligencePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'pcaf' | 'rba'>('overview')
  const knockouts = PORTFOLIO.filter(p => p.rbaKnockout)
  const totalCO2 = PORTFOLIO.reduce((a, p) => a + p.co2eKt, 0)
  const garExposure = PORTFOLIO.filter(p => p.taxonomy === 'aligned' || p.taxonomy === 'eligible')
  const garPct = Math.round(garExposure.length / PORTFOLIO.length * 100)

  return (
    <>
      <Header
        title="🏦 Bank Intelligence Suite"
        subtitle="GAR · PCAF · EU Taxonomy · RBA Climate Risk"
      />

      {/* Hero KPIs */}
      <div className="px-6 pt-4 grid grid-cols-4 gap-4">
        <KpiCard icon="🌿" label="Green Asset Ratio (GAR)" value="57.3%" sub="2025 reported · target 70% by 2027" color="#166534" />
        <KpiCard icon="💨" label="Total Financed Emissions" value={`${totalCO2.toFixed(0)} kt CO₂e`} sub="PCAF-weighted portfolio · Scope 3 Cat 15" color="#7f1d1d" />
        <KpiCard icon="🇪🇺" label="EU Taxonomy Aligned" value="42.1%" sub="EBA Pillar 3 disclosure ready" color="#1e3a8a" />
        <KpiCard icon="⚠️" label="RBA Knock-out Exposures" value={`${knockouts.length} counterparty`} sub="Flagged for enhanced screening" color="#92400e" />
      </div>

      {/* Tabs */}
      <div className="px-6 pt-6 flex gap-2 border-b border-slate-200">
        {([
          { id: 'overview', label: '📊 GAR Overview' },
          { id: 'portfolio', label: '🗂️ Portfolio Heatmap' },
          { id: 'pcaf', label: '💨 PCAF Emissions' },
          { id: 'rba', label: '⚠️ RBA Knock-out' },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-bold rounded-t-xl transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'bg-white border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-6 space-y-6">

        {/* ── OVERVIEW ─────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* GAR trend bar chart */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-black text-slate-900">Green Asset Ratio Trajectory</h3>
                  <p className="text-xs text-slate-500 mt-0.5">EBA CRR2 Art. 449a — mandatory 2026 reporting</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Reported</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-300 inline-block opacity-70" /> Projected</span>
                </div>
              </div>
              <div className="flex items-end gap-3 h-36">
                {GAR_OVER_TIME.map(d => (
                  <GARBar key={d.year} year={d.year} gar={d.gar} target={d.year === '2027T'} />
                ))}
                <div className="flex-1" />
                <div className="text-right">
                  <div className="text-xs text-slate-400 mb-1">EU Target 2030</div>
                  <div className="text-lg font-black text-slate-900">≥ 70%</div>
                </div>
              </div>
            </div>

            {/* Asset class mix + PCAF DQS summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h3 className="font-black text-slate-900 mb-4">Portfolio by Asset Class</h3>
                <div className="space-y-3">
                  {ASSET_CLASS_MIX.map(a => (
                    <div key={a.cls} className="flex items-center gap-3">
                      <div className="text-xs text-slate-600 w-28 shrink-0">{a.cls}</div>
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${a.pct}%`, background: a.color }} />
                      </div>
                      <div className="text-xs font-bold text-slate-700 w-8 text-right">{a.pct}%</div>
                      <div className="text-xs text-slate-400 w-20 text-right">{a.co2} kt CO₂e</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h3 className="font-black text-slate-900 mb-4">PCAF Data Quality Distribution</h3>
                <div className="space-y-3">
                  {([1, 2, 3, 4, 5] as DQS[]).map(dqs => {
                    const count = PORTFOLIO.filter(p => p.pcafDqs === dqs).length
                    const pct = Math.round(count / PORTFOLIO.length * 100)
                    const d = DQS_LABEL[dqs]
                    return (
                      <div key={dqs} className="flex items-center gap-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: d.bg, color: d.color }}>{d.label}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="h-full rounded-full bg-slate-700" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-slate-500 w-12 text-right">{count} counterparties ({pct}%)</span>
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-slate-400 mt-4 border-t border-slate-100 pt-3">
                  PCAF DQS 1-5: lower score = higher quality. Weighted avg score: <strong className="text-slate-700">2.4</strong>
                </p>
              </div>
            </div>

            {/* Compliance badges */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
              <h3 className="font-black mb-4 text-white">Regulatory Compliance Status</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { label: 'EBA Pillar 3', status: '✓', sub: 'GAR/BTAR ready' },
                  { label: 'PCAF Standard', status: '✓', sub: 'v2.0 aligned' },
                  { label: 'EU Taxonomy', status: '~', sub: 'Art 8 disclosure' },
                  { label: 'BDDK TSRS', status: '✓', sub: 'Q2 2026 deadline' },
                  { label: 'RBA v9.0', status: '!', sub: '1 flag active' },
                  { label: 'TCFD Bank', status: '✓', sub: 'Physical + transition' },
                ].map(c => (
                  <div key={c.label} className={`rounded-xl p-3 text-center ${c.status === '✓' ? 'bg-emerald-900/50 border border-emerald-500/30' : c.status === '!' ? 'bg-red-900/50 border border-red-500/30' : 'bg-yellow-900/30 border border-yellow-500/30'}`}>
                    <div className={`text-xl font-black ${c.status === '✓' ? 'text-emerald-400' : c.status === '!' ? 'text-red-400' : 'text-yellow-400'}`}>{c.status}</div>
                    <div className="text-xs font-bold text-white mt-1">{c.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{c.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PORTFOLIO HEATMAP ────────────────────────────── */}
        {activeTab === 'portfolio' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900">Counterparty Portfolio — ESG Heatmap</h3>
                <p className="text-xs text-slate-500 mt-0.5">{PORTFOLIO.length} counterparties · Total exposure ₺5,015M</p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 font-bold">✓ Aligned</span>
                <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 font-bold">~ Eligible</span>
                <span className="px-2 py-1 rounded bg-red-100 text-red-700 font-bold">✗ Not Eligible</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                    <th className="px-4 py-3 text-left font-bold">Counterparty</th>
                    <th className="px-4 py-3 text-left font-bold">Sector</th>
                    <th className="px-4 py-3 text-left font-bold">Asset Class</th>
                    <th className="px-4 py-3 text-right font-bold">Exposure</th>
                    <th className="px-4 py-3 text-center font-bold">PCAF DQS</th>
                    <th className="px-4 py-3 text-right font-bold">CO₂e (kt)</th>
                    <th className="px-4 py-3 text-center font-bold">GAR %</th>
                    <th className="px-4 py-3 text-center font-bold">EU Taxonomy</th>
                    <th className="px-4 py-3 text-center font-bold">RBA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PORTFOLIO.map(row => {
                    const dqs = DQS_LABEL[row.pcafDqs]
                    const tax = TAXONOMY_BADGE[row.taxonomy]
                    const garColor = row.garPct >= 70 ? '#166534' : row.garPct >= 40 ? '#92400e' : '#7f1d1d'
                    const garBg = row.garPct >= 70 ? '#dcfce7' : row.garPct >= 40 ? '#fef3c7' : '#fee2e2'
                    return (
                      <tr key={row.name} className={`hover:bg-slate-50 transition-colors ${row.rbaKnockout ? 'bg-red-50/50' : ''}`}>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {row.rbaKnockout && <span className="text-red-500 mr-1.5">⚠️</span>}
                          {row.name}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{row.sector}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{row.assetClass}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">{row.exposure}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: dqs.bg, color: dqs.color }}>
                            {dqs.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-700">{row.co2eKt.toFixed(1)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: garBg, color: garColor }}>
                            {row.garPct}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: tax.bg, color: tax.color }}>
                            {tax.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {row.rbaKnockout
                            ? <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">Flagged</span>
                            : <span className="text-emerald-500 font-bold text-xs">Clear</span>
                          }
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PCAF EMISSIONS ──────────────────────────────── */}
        {activeTab === 'pcaf' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm col-span-2">
                <h3 className="font-black text-slate-900 mb-1">Financed Emissions by Sector</h3>
                <p className="text-xs text-slate-500 mb-5">PCAF Standard v2 · Scope 3 Category 15 · Attribution factor applied</p>
                <div className="space-y-4">
                  {PORTFOLIO.sort((a, b) => b.co2eKt - a.co2eKt).map(row => {
                    const pct = Math.round(row.co2eKt / totalCO2 * 100)
                    const isHigh = row.co2eKt > 100
                    return (
                      <div key={row.name} className="flex items-center gap-3">
                        <div className="w-32 text-xs text-slate-600 shrink-0 leading-tight">
                          <div className="font-bold text-slate-900">{row.name}</div>
                          <div className="text-slate-400">{row.sector}</div>
                        </div>
                        <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background: isHigh ? '#ef4444' : row.co2eKt > 40 ? '#f59e0b' : '#10b981'
                            }}
                          />
                        </div>
                        <div className="w-24 text-right">
                          <span className="text-sm font-black text-slate-900">{row.co2eKt.toFixed(1)}</span>
                          <span className="text-xs text-slate-400 ml-1">kt</span>
                        </div>
                        <span className="text-xs text-slate-500 w-8 text-right">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h3 className="font-black text-slate-900 mb-4">PCAF Attribution</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50">
                    <div className="text-2xl font-black text-slate-900">{totalCO2.toFixed(0)} kt</div>
                    <div className="text-xs text-slate-500 mt-0.5">Total financed CO₂e</div>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50">
                    <div className="text-2xl font-black text-emerald-700">2.4 / 5</div>
                    <div className="text-xs text-slate-500 mt-0.5">Weighted avg DQS score</div>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50">
                    <div className="text-2xl font-black text-blue-700">68%</div>
                    <div className="text-xs text-slate-500 mt-0.5">Portfolio coverage by reported data</div>
                  </div>
                  <div className="p-4 rounded-xl bg-yellow-50">
                    <div className="text-2xl font-black text-yellow-700">32%</div>
                    <div className="text-xs text-slate-500 mt-0.5">Estimated / proxy data (DQS 4-5)</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    PCAF DQS 1 = company-reported · DQS 5 = EF × physical activity. Improve DQS by enabling supplier reporting.
                  </p>
                </div>
              </div>
            </div>

            {/* Intensity metric */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="font-black text-slate-900 mb-4">Emission Intensity by Asset Class (tCO₂e / ₺M exposure)</h3>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { cls: 'Corporate', intensity: 'High', value: '148 t/₺M', color: '#ef4444' },
                  { cls: 'SME', intensity: 'Medium', value: '62 t/₺M', color: '#f59e0b' },
                  { cls: 'Commercial RE', intensity: 'Medium', value: '55 t/₺M', color: '#f59e0b' },
                  { cls: 'Mortgage', intensity: 'Low', value: '8 t/₺M', color: '#10b981' },
                ].map(a => (
                  <div key={a.cls} className="rounded-xl border border-slate-100 p-4 text-center">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-2">{a.cls}</div>
                    <div className="text-2xl font-black mb-1" style={{ color: a.color }}>{a.value}</div>
                    <div className="text-xs text-slate-400">{a.intensity} intensity</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── RBA KNOCK-OUT ───────────────────────────────── */}
        {activeTab === 'rba' && (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4">
              <span className="text-3xl">⚠️</span>
              <div>
                <div className="font-black text-red-900 mb-1">RBA v9.0 Knock-out Criteria Active</div>
                <p className="text-sm text-red-700">
                  {knockouts.length} counterpart{knockouts.length === 1 ? 'y has' : 'ies have'} triggered RBA Climate Risk knock-out criteria. Enhanced due diligence required before facility renewal. BDDK notification may apply.
                </p>
              </div>
            </div>

            {knockouts.map(row => (
              <div key={row.name} className="bg-white rounded-2xl border-2 border-red-200 p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">{row.name}</h3>
                    <p className="text-sm text-slate-500">{row.sector} · {row.assetClass}</p>
                  </div>
                  <span className="px-3 py-1 rounded-xl text-sm font-black bg-red-100 text-red-700">Knock-out Triggered</span>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <div className="text-xs text-slate-400 mb-1">Exposure</div>
                    <div className="font-black text-slate-900">{row.exposure}</div>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3">
                    <div className="text-xs text-red-400 mb-1">Financed CO₂e</div>
                    <div className="font-black text-red-900">{row.co2eKt.toFixed(0)} kt</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <div className="text-xs text-slate-400 mb-1">GAR Contribution</div>
                    <div className="font-black text-slate-900">{row.garPct}%</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <div className="text-xs text-slate-400 mb-1">PCAF DQS</div>
                    <div className="font-black text-slate-900">{DQS_LABEL[row.pcafDqs].label}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="font-bold text-sm text-slate-700 mb-2">Triggered Criteria:</div>
                  {[
                    { criterion: 'C1.3 — Sector coal/oil exposure &gt; 30% revenue', status: true },
                    { criterion: 'C2.1 — No credible transition plan filed', status: true },
                    { criterion: 'C3.2 — Physical risk assessment missing', status: false },
                  ].map(c => (
                    <div key={c.criterion} className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${c.status ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-500'}`}>
                      <span>{c.status ? '✗' : '–'}</span>
                      <span dangerouslySetInnerHTML={{ __html: c.criterion }} />
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-3">
                  <button className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-700 transition-all">
                    Request Transition Plan →
                  </button>
                  <button className="px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all">
                    Export Due Diligence Report
                  </button>
                </div>
              </div>
            ))}

            {/* All clear section */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="font-black text-slate-900 mb-4">Counterparties — RBA Clear ({PORTFOLIO.length - knockouts.length})</h3>
              <div className="grid grid-cols-3 gap-3">
                {PORTFOLIO.filter(p => !p.rbaKnockout).map(row => (
                  <div key={row.name} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-emerald-500 font-black">✓</span>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{row.name}</div>
                      <div className="text-xs text-slate-400">{row.sector}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
