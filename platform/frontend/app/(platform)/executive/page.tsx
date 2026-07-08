'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

// ── Types ────────────────────────────────────────────────────────────────────
type DashboardData = {
  total_tco2e: number
  scope1: number; scope2: number; scope3: number
  tsrs_score: number
  esg_score: number
  reporting_year: number
}

type ComplianceItem = {
  framework: string; flag: string; status: 'done' | 'on_track' | 'at_risk' | 'not_started'
  deadline: string; score: number; gap: string | null
}

type FinancialRisk = {
  label: string; value_try: number; change_pct: number; icon: string; color: string
}

// ── Mock data (replaced by API when available) ───────────────────────────────
const MOCK_COMPLIANCE: ComplianceItem[] = [
  { framework: 'TSRS 1+2', flag: '🇹🇷', status: 'on_track', deadline: 'Mar 2027', score: 68, gap: 'Kapsam 3 eksik' },
  { framework: 'GRI Universal', flag: '🌍', status: 'done',     deadline: 'Tamamlandı', score: 82, gap: null },
  { framework: 'CBAM Beyanı', flag: '🇪🇺', status: 'at_risk',  deadline: 'Oca 2026', score: 34, gap: 'CBAM beyanı yapılmadı' },
  { framework: 'ISSB S1+S2', flag: '🌐', status: 'not_started', deadline: '2026+', score: 0, gap: 'Başlanmadı' },
  { framework: 'CDP B Skoru', flag: '📋', status: 'on_track',   deadline: 'Haz 2025', score: 58, gap: null },
]

const MOCK_RISKS: FinancialRisk[] = [
  { label: 'CBAM Karbon Vergisi', value_try: 4_200_000, change_pct: +18.4, icon: '🇪🇺', color: '#ef4444' },
  { label: 'Emisyon Azaltım Yatırımı', value_try: 12_500_000, change_pct: -8.2, icon: '⚡', color: '#f59e0b' },
  { label: 'Yeşil Kredi Tasarrufu', value_try: 3_800_000, change_pct: +12.0, icon: '🏦', color: '#10b981' },
  { label: 'Karbon Kredi Değeri', value_try: 1_650_000, change_pct: +5.6, icon: '🌿', color: '#3b82f6' },
]

const NET_ZERO_PATH = [
  { year: 2024, actual: 100, target: 100 },
  { year: 2026, actual: null, target: 88 },
  { year: 2028, actual: null, target: 74 },
  { year: 2030, actual: null, target: 58 },
  { year: 2035, actual: null, target: 38 },
  { year: 2040, actual: null, target: 20 },
  { year: 2050, actual: null, target: 0 },
]

// ── Status helpers ─────────────────────────────────────────────────────────
const STATUS_META: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  done:        { label: 'Tamamlandı', dot: '#10b981', bg: '#f0fdf4', text: '#166534' },
  on_track:    { label: 'Yolunda',    dot: '#f59e0b', bg: '#fffbeb', text: '#92400e' },
  at_risk:     { label: 'Risk',       dot: '#ef4444', bg: '#fef2f2', text: '#991b1b' },
  not_started: { label: 'Başlanmadı', dot: '#9ca3af', bg: '#f9fafb', text: '#4b5563' },
}

function fmt(n: number) {
  if (n >= 1_000_000) return `₺${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `₺${(n / 1_000).toFixed(0)}K`
  return `₺${n}`
}

// ── Mini bar chart ──────────────────────────────────────────────────────────
function ScoreBar({ value, color = '#10b981' }: { value: number; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-xs font-bold text-slate-600 w-8 text-right">{value}</span>
    </div>
  )
}

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon, color }: {
  label: string; value: string; sub: string; icon: string; color: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: color + '15' }}>{icon}</div>
        <div className="text-xs text-slate-400">{sub}</div>
      </div>
      <div className="text-2xl font-black text-slate-900">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ExecutiveDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [period, setPeriod] = useState<'2023' | '2024' | '2025'>('2024')

  useEffect(() => {
    api.dashboard.summary()
      .then((d: unknown) => setData(d as DashboardData))
      .catch(() => {
        setData({
          total_tco2e: 48_320, scope1: 12_400, scope2: 18_200, scope3: 17_720,
          tsrs_score: 68, esg_score: 62, reporting_year: 2024,
        })
      })
  }, [])

  const totalCO2 = data?.total_tco2e ?? 48_320

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-slate-900">Yönetim Kurulu Özeti</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">CFO / CSO</span>
          </div>
          <p className="text-sm text-slate-500">
            Finansal önemlilik, uyum durumu ve Net Zero yol haritası
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-slate-200 overflow-hidden text-sm">
            {(['2023', '2024', '2025'] as const).map(y => (
              <button key={y} onClick={() => setPeriod(y)}
                className={`px-4 py-2 font-semibold transition-all ${period === y ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'}`}>
                {y}
              </button>
            ))}
          </div>
          <Link href="/dashboard" className="px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 text-slate-600 hover:border-slate-300 transition-all">
            Operasyonel Dashboard
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Toplam Emisyon" value={`${(totalCO2 / 1000).toFixed(1)}K tCO₂e`} sub={`${period} yılı`} icon="🌡️" color="#ef4444" />
        <KpiCard label="TSRS Hazırlık" value={`${data?.tsrs_score ?? 68}/100`} sub="KGK uyumu" icon="🇹🇷" color="#10b981" />
        <KpiCard label="ESG Genel Skoru" value={`${data?.esg_score ?? 62}/100`} sub="8 boyut" icon="🏅" color="#3b82f6" />
        <KpiCard label="CBAM Riski" value="₺4.2M" sub="2026 tahmini" icon="🇪🇺" color="#f59e0b" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Compliance Status */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-black text-slate-900">Uyum Durumu</h2>
            <Link href="/tsrs" className="text-xs text-emerald-600 font-bold hover:underline">Detay →</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {MOCK_COMPLIANCE.map(item => {
              const meta = STATUS_META[item.status]
              return (
                <div key={item.framework} className="p-4 flex items-center gap-4">
                  <span className="text-xl w-7 shrink-0">{item.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-bold text-sm text-slate-900">{item.framework}</span>
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: meta.bg, color: meta.text }}>
                        <span className="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle"
                          style={{ background: meta.dot }} />
                        {meta.label}
                      </span>
                    </div>
                    <ScoreBar value={item.score} color={meta.dot} />
                    {item.gap && <p className="text-xs text-slate-400 mt-1">{item.gap}</p>}
                  </div>
                  <div className="text-xs text-slate-400 shrink-0 text-right">
                    <div className="font-semibold text-slate-600">{item.deadline}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Financial Risk Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-black text-slate-900">Finansal Etki (₺)</h2>
            <Link href="/tcfd" className="text-xs text-emerald-600 font-bold hover:underline">TCFD →</Link>
          </div>
          <div className="p-4 space-y-3">
            {MOCK_RISKS.map(r => (
              <div key={r.label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                <span className="text-xl">{r.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-500 truncate">{r.label}</div>
                  <div className="font-black text-slate-900 text-sm">{fmt(r.value_try)}</div>
                </div>
                <div className={`text-xs font-bold ${r.change_pct > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                  {r.change_pct > 0 ? '+' : ''}{r.change_pct.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 pt-2 border-t border-slate-100">
            <Link href="/scenarios"
              className="w-full block text-center py-2.5 rounded-xl text-sm font-bold text-slate-700 border border-slate-200 hover:border-slate-300 transition-all">
              Senaryo Analizi Aç →
            </Link>
          </div>
        </div>
      </div>

      {/* Net Zero Trajectory */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-black text-slate-900">Net Zero Yol Haritası</h2>
            <p className="text-xs text-slate-500 mt-0.5">2050 hedefine % ilerleme (baz yıl: 2024 = 100)</p>
          </div>
          <Link href="/hedefler" className="text-xs text-emerald-600 font-bold hover:underline">Hedefler →</Link>
        </div>
        <div className="p-6">
          <div className="flex items-end gap-3 h-32">
            {NET_ZERO_PATH.map(p => (
              <div key={p.year} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full relative flex items-end justify-center" style={{ height: '100px' }}>
                  <div
                    className="w-full rounded-t-lg transition-all"
                    style={{
                      height: `${p.target}px`,
                      background: p.actual != null
                        ? 'linear-gradient(to top, #059669, #34d399)'
                        : 'linear-gradient(to top, #e2e8f0, #cbd5e1)',
                      opacity: p.actual != null ? 1 : 0.6,
                    }}
                  />
                  {p.actual != null && (
                    <div className="absolute inset-0 flex items-end justify-center pb-1">
                      <span className="text-white text-xs font-black">{p.actual}%</span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-500 font-medium">{p.year}</span>
                <span className="text-xs font-bold text-slate-400">%{p.target}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              Gerçekleşen
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-slate-300" />
              Hedef
            </div>
          </div>
        </div>
      </div>

      {/* Scope Breakdown + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Scope Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-black text-slate-900 mb-4">Kapsam Dağılımı ({period})</h2>
          <div className="space-y-4">
            {[
              { label: 'Kapsam 1 — Doğrudan', value: data?.scope1 ?? 12_400, color: '#ef4444', pct: Math.round(((data?.scope1 ?? 12400) / totalCO2) * 100) },
              { label: 'Kapsam 2 — Elektrik', value: data?.scope2 ?? 18_200, color: '#f59e0b', pct: Math.round(((data?.scope2 ?? 18200) / totalCO2) * 100) },
              { label: 'Kapsam 3 — Değer Zinciri', value: data?.scope3 ?? 17_720, color: '#3b82f6', pct: Math.round(((data?.scope3 ?? 17720) / totalCO2) * 100) },
            ].map(s => (
              <div key={s.label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-slate-700">{s.label}</span>
                  <div className="text-right">
                    <span className="font-black text-slate-900 text-sm">{s.value.toLocaleString('tr-TR')}</span>
                    <span className="text-xs text-slate-400 ml-1">tCO₂e</span>
                    <span className="text-xs font-bold ml-2" style={{ color: s.color }}>%{s.pct}</span>
                  </div>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
            <span className="text-slate-500">Toplam</span>
            <span className="font-black text-slate-900">{totalCO2.toLocaleString('tr-TR')} tCO₂e</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-black text-slate-900 mb-4">Hızlı Aksiyonlar</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/tsrs', icon: '🇹🇷', label: 'TSRS Raporu', desc: 'KGK beyanı', color: '#10b981' },
              { href: '/report-builder', icon: '📄', label: 'AI Rapor', desc: 'ISSB/GRI/CDP', color: '#8b5cf6' },
              { href: '/gar', icon: '🏦', label: 'Bank GAR', desc: 'PCAF finanse', color: '#3b82f6' },
              { href: '/kobi-credit-score', icon: '🏅', label: 'KOBİ Skoru', desc: 'ESG kredi', color: '#f59e0b' },
              { href: '/cbam', icon: '🇪🇺', label: 'CBAM Beyanı', desc: 'AB sınır vergi', color: '#ef4444' },
              { href: '/uydu', icon: '🛰️', label: 'Uydu Analizi', desc: 'Fiziksel risk', color: '#06b6d4' },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className="flex flex-col gap-2 p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{a.icon}</span>
                  <span className="text-xs text-slate-300 group-hover:text-slate-500 transition-colors">→</span>
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">{a.label}</div>
                  <div className="text-xs text-slate-400">{a.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
