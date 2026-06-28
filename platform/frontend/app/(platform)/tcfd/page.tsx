'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

type Scenario = {
  scenario_id: string; scenario_label: string; temp_rise: string
  carbon_price_2030: number; carbon_price_2050: number
  physical_risk_score: number; transition_risk_score: number
  stranded_asset_risk: string
  cbam_exposure_eur: number; transition_capex_eur: number
  physical_damage_eur: number; net_financial_impact_eur: number
  opportunities: string[]; risks: string[]; recommendation: string
}

type TCFDResult = {
  sector: string; annual_revenue_eur: number; total_co2e: number
  summary: string; scenarios: Scenario[]
}

const SCENARIO_STYLE: Record<string, { bg: string; border: string; badge: string; badgeText: string; icon: string }> = {
  paris_2c: { bg: '#f0fdf4', border: '#86efac', badge: '#dcfce7', badgeText: '#166534', icon: '🌿' },
  ndc:      { bg: '#fffbeb', border: '#fcd34d', badge: '#fef9c3', badgeText: '#854d0e', icon: '⚠️' },
  bau_4c:   { bg: '#fff1f2', border: '#fca5a5', badge: '#fee2e2', badgeText: '#991b1b', icon: '🔥' },
}

const STRANDED_LABEL: Record<string, string> = {
  low: 'Düşük', medium: 'Orta', high: 'Yüksek', critical: 'Kritik'
}

const SECTORS = [
  'çelik', 'çimento', 'alüminyum', 'tekstil', 'gıda',
  'bankacılık', 'enerji', 'lojistik', 'üretim', 'teknoloji', 'perakende',
]

function RiskBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full" style={{ background: '#e2e8f0' }}>
        <div className="h-2 rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-xs font-bold w-8 text-right" style={{ color }}>{value}</span>
    </div>
  )
}

export default function TCFDPage() {
  const [sector, setSector] = useState('çelik')
  const [revenue, setRevenue] = useState('')
  const [co2e, setCo2e] = useState('')
  const [exported, setExported] = useState('')
  const [result, setResult] = useState<TCFDResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  async function handleCalculate() {
    if (!revenue || !co2e) { toast.error('Ciro ve emisyon değerlerini girin'); return }
    setLoading(true)
    try {
      const res = await api.tcfd.scenarios({
        sector, annual_revenue_eur: parseFloat(revenue),
        total_co2e: parseFloat(co2e),
        goods_exported_tons: exported ? parseFloat(exported) : 0,
      })
      setResult(res as TCFDResult)
      setSelected('paris_2c')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Hesaplama hatası')
    } finally { setLoading(false) }
  }

  async function handleDemo() {
    setDemoLoading(true)
    try {
      const res = await api.tcfd.demo()
      setResult(res as TCFDResult)
      setSelected('paris_2c')
    } catch { toast.error('Demo yüklenemedi') }
    finally { setDemoLoading(false) }
  }

  const selectedScenario = result?.scenarios.find(s => s.scenario_id === selected) ?? null

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--green-900)' }}>
            TCFD İklim Senaryo Analizi
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Task Force on Climate-related Financial Disclosures · IEA WEO 2024 verisi · 3 Senaryo
          </p>
        </div>
        <button onClick={handleDemo} disabled={demoLoading}
          className="px-4 py-2 rounded-xl text-sm font-bold border"
          style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
          {demoLoading ? 'Yükleniyor…' : '🎯 Çelik Sektörü Demo'}
        </button>
      </div>

      {/* Input */}
      <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)' }}>
        <h2 className="font-bold text-sm mb-4" style={{ color: 'var(--foreground)' }}>Şirket Parametreleri</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Sektör</label>
            <select value={sector} onChange={e => setSector(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border text-sm"
              style={{ borderColor: 'var(--border)', background: 'var(--background)' }}>
              {SECTORS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Yıllık Ciro (€)</label>
            <input type="number" placeholder="500000000" value={revenue} onChange={e => setRevenue(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border text-sm"
              style={{ borderColor: 'var(--border)', background: 'var(--background)' }} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Toplam CO₂e (ton)</label>
            <input type="number" placeholder="185000" value={co2e} onChange={e => setCo2e(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border text-sm"
              style={{ borderColor: 'var(--border)', background: 'var(--background)' }} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>AB İhracat (ton/yıl)</label>
            <input type="number" placeholder="120000" value={exported} onChange={e => setExported(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border text-sm"
              style={{ borderColor: 'var(--border)', background: 'var(--background)' }} />
          </div>
        </div>
        <button onClick={handleCalculate} disabled={loading}
          className="mt-4 px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
          style={{ background: 'var(--green-700)' }}>
          {loading ? 'Hesaplanıyor…' : 'TCFD Matrisini Oluştur'}
        </button>
      </div>

      {result && (
        <>
          {/* Scenario Tabs */}
          <div className="grid grid-cols-3 gap-4">
            {result.scenarios.map(s => {
              const style = SCENARIO_STYLE[s.scenario_id]
              const isActive = selected === s.scenario_id
              return (
                <button key={s.scenario_id} onClick={() => setSelected(s.scenario_id)}
                  className="rounded-2xl p-5 text-left border-2 transition-all"
                  style={{ background: isActive ? style.bg : '#fff', borderColor: isActive ? style.border : '#e2e8f0' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{style.icon}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: style.badge, color: style.badgeText }}>
                      {s.temp_rise}
                    </span>
                  </div>
                  <div className="font-black text-sm" style={{ color: '#0f172a' }}>{s.scenario_label}</div>
                  <div className="text-xs mt-1 font-mono" style={{ color: '#64748b' }}>
                    {s.net_financial_impact_eur < 0 ? '−' : '+'}€{Math.abs(s.net_financial_impact_eur / 1_000_000).toFixed(1)}M net etki
                  </div>
                </button>
              )
            })}
          </div>

          {/* Selected Scenario Detail */}
          {selectedScenario && (() => {
            const style = SCENARIO_STYLE[selectedScenario.scenario_id]
            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Financial Matrix */}
                <div className="lg:col-span-2 space-y-4">
                  {/* KPI grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Karbon Fiyatı 2030', value: `€${selectedScenario.carbon_price_2030}/tCO₂e`, sub: `2050: €${selectedScenario.carbon_price_2050}` },
                      { label: 'CBAM Maruziyeti', value: `€${(selectedScenario.cbam_exposure_eur/1000).toFixed(0)}K`, sub: 'yıllık tahmini' },
                      { label: 'Uyum CAPEX', value: `€${(selectedScenario.transition_capex_eur/1_000_000).toFixed(1)}M`, sub: 'geçiş yatırımı' },
                      { label: 'Fiziksel Hasar', value: `€${(selectedScenario.physical_damage_eur/1000).toFixed(0)}K`, sub: 'yıllık beklenti' },
                    ].map(k => (
                      <div key={k.label} className="rounded-xl p-4 border" style={{ borderColor: 'var(--border)' }}>
                        <div className="text-lg font-black" style={{ color: 'var(--green-800)' }}>{k.value}</div>
                        <div className="text-xs font-bold mt-0.5" style={{ color: 'var(--foreground)' }}>{k.label}</div>
                        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{k.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Risk bars */}
                  <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)' }}>
                    <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--foreground)' }}>Risk Göstergeleri</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: 'var(--muted-foreground)' }}>Fiziksel Risk</span>
                          <span className="font-bold" style={{ color: '#ef4444' }}>{selectedScenario.physical_risk_score}/100</span>
                        </div>
                        <RiskBar value={selectedScenario.physical_risk_score} color="#ef4444" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: 'var(--muted-foreground)' }}>Geçiş Riski</span>
                          <span className="font-bold" style={{ color: '#f59e0b' }}>{selectedScenario.transition_risk_score}/100</span>
                        </div>
                        <RiskBar value={selectedScenario.transition_risk_score} color="#f59e0b" />
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Stranded Asset Riski</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: style.badge, color: style.badgeText }}>
                          {STRANDED_LABEL[selectedScenario.stranded_asset_risk]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="rounded-xl p-4 text-sm leading-relaxed"
                    style={{ background: style.bg, border: `1px solid ${style.border}`, color: '#374151' }}>
                    <span className="font-bold">Öneri: </span>{selectedScenario.recommendation}
                  </div>
                </div>

                {/* Risks & Opportunities */}
                <div className="space-y-4">
                  <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)' }}>
                    <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--green-800)' }}>Fırsatlar</h3>
                    <ul className="space-y-2">
                      {selectedScenario.opportunities.map(o => (
                        <li key={o} className="flex gap-2 text-xs" style={{ color: 'var(--foreground)' }}>
                          <span className="text-green-600 font-bold shrink-0">↑</span>{o}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)' }}>
                    <h3 className="font-bold text-sm mb-3" style={{ color: '#991b1b' }}>Riskler</h3>
                    <ul className="space-y-2">
                      {selectedScenario.risks.map(r => (
                        <li key={r} className="flex gap-2 text-xs" style={{ color: 'var(--foreground)' }}>
                          <span className="text-red-500 font-bold shrink-0">!</span>{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl p-4 text-xs leading-relaxed"
                    style={{ background: 'var(--green-50)', color: 'var(--green-900)' }}>
                    {result.summary}
                  </div>
                </div>
              </div>
            )
          })()}
        </>
      )}

      {!result && (
        <div className="rounded-2xl border p-12 text-center" style={{ borderColor: 'var(--border)', borderStyle: 'dashed' }}>
          <div className="text-5xl mb-4">🌡️</div>
          <p className="font-bold" style={{ color: 'var(--green-900)' }}>İklim senaryo matrisi burada görünecek</p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Parametreleri girin veya demo ile başlayın
          </p>
        </div>
      )}
    </div>
  )
}
