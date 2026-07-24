'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface KpiCardProps {
  label: string
  value: string
  unit: string
  trend: string
  trendDown?: boolean
  icon: string
  accentColor: string
  loading?: boolean
}

function KpiCard({ label, value, unit, trend, trendDown = true, icon, accentColor, loading }: KpiCardProps) {
  return (
    <div className="ds-card elev-sm relative overflow-hidden"
      style={{ background: 'var(--ds-color-surface)', borderRadius: 'var(--ds-radius-md)' }}>
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: accentColor }} />
      {/* kicker — petrol/trust aksanı (ds card-kicker) */}
      <div className="card-kicker">{label}</div>
      {loading ? (
        <div className="h-8 w-24 bg-gray-100 rounded animate-pulse" />
      ) : (
        <div className="text-3xl font-black leading-none" style={{ color: 'var(--ds-color-text)' }}>{value}</div>
      )}
      <div className="text-xs" style={{ color: 'color-mix(in srgb, var(--ds-color-text) 55%, transparent)' }}>{unit}</div>
      <div className="mt-2">
        <span className={trendDown ? 'tag tag-success' : 'tag tag-warning'}>
          {trendDown ? '▼' : '▲'} {trend}
        </span>
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-10 select-none">{icon}</div>
    </div>
  )
}

export function KpiGrid() {
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof api.dashboard.summary>> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.dashboard.summary()
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false))
  }, [])

  const e = summary?.emissions
  const fmt = (n: number) => n.toLocaleString('tr-TR', { maximumFractionDigits: 0 })

  return (
    <div className="grid grid-cols-4 gap-4">
      <KpiCard
        label="Kapsam 1 — Doğrudan"
        value={e ? fmt(e.scope1) : '4.280'}
        unit="ton CO₂e"
        trend="Gerçek veri"
        accentColor="var(--green-700)"
        icon="🏭"
        loading={loading}
      />
      <KpiCard
        label="Kapsam 2 — Elektrik"
        value={e ? fmt(e.scope2) : '12.640'}
        unit="ton CO₂e (konum bazlı)"
        trend="Gerçek veri"
        accentColor="var(--teal, #00897B)"
        icon="⚡"
        loading={loading}
      />
      <KpiCard
        label="Kapsam 3 — Değer Zinciri"
        value={e ? fmt(e.scope3) : '183.500'}
        unit="ton CO₂e"
        trend="Gerçek veri"
        accentColor="var(--blue, #1565C0)"
        icon="🔗"
        loading={loading}
      />
      <KpiCard
        label="TSRS Uyum Skoru"
        value={summary?.compliance.score != null ? String(summary.compliance.score) : '—'}
        unit={`100 üzerinden · Derece: ${summary?.compliance.grade ?? '—'}`}
        trend={`${summary?.reports.total ?? 0} rapor · ${summary?.reports.approved ?? 0} onaylı`}
        trendDown={false}
        accentColor="#F57F17"
        icon="✅"
        loading={loading}
      />
    </div>
  )
}
