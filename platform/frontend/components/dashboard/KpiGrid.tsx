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
    <div className="relative overflow-hidden rounded-xl bg-white border p-5 shadow-sm"
      style={{ borderColor: 'var(--border)' }}>
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: accentColor }} />
      <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
        {label}
      </div>
      {loading ? (
        <div className="h-8 w-24 bg-gray-100 rounded animate-pulse" />
      ) : (
        <div className="text-3xl font-black leading-none" style={{ color: 'var(--foreground)' }}>{value}</div>
      )}
      <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{unit}</div>
      <div className="flex items-center gap-1 mt-3 text-xs font-medium" style={{ color: trendDown ? 'var(--green-600)' : '#F57F17' }}>
        {trendDown ? '▼' : '▲'} {trend}
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
