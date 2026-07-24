'use client'
import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { api } from '@/lib/api'

const COLORS = { scope1: '#2E7D32', scope2: '#00897B', scope3: '#1565C0' }

export function ScopeDonutChart() {
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof api.dashboard.summary>> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.dashboard.summary()
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false))
  }, [])

  const e = summary?.emissions
  const data = e ? [
    { name: 'Kapsam 1', value: e.scope1, color: COLORS.scope1 },
    { name: 'Kapsam 2', value: e.scope2, color: COLORS.scope2 },
    { name: 'Kapsam 3', value: e.scope3, color: COLORS.scope3 },
  ] : []
  const hasData = e && e.total > 0
  const employeeCount = summary?.company.employee_count
  const intensity = hasData && employeeCount ? e.total / employeeCount : null

  return (
    <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'var(--border)' }}>
      <div className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>
        Kapsam Dağılımı
      </div>
      <div className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
        {hasData ? `${summary?.reporting_year} toplam: ${e.total.toLocaleString('tr-TR')} ton CO₂e` : 'Henüz veri girilmedi'}
      </div>
      {loading ? (
        <div className="h-36 animate-pulse bg-gray-50 rounded" />
      ) : !hasData ? (
        <p className="text-sm text-slate-400 py-8 text-center">Emisyon verisi girildiğinde burada görünecek.</p>
      ) : (
        <div className="flex items-center gap-6">
          <ResponsiveContainer width={140} height={140}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                dataKey="value"
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={(v) => [`${Number(v).toLocaleString('tr-TR')} ton`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-2">
            {data.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: d.color }} />
                <span style={{ color: 'var(--muted-foreground)' }}>
                  {d.name}: <strong style={{ color: 'var(--foreground)' }}>
                    {d.value.toLocaleString('tr-TR')}
                  </strong>
                </span>
              </div>
            ))}
            <div className="pt-3 mt-2 border-t text-xs" style={{ borderColor: 'var(--border)' }}>
              <span style={{ color: 'var(--muted-foreground)' }}>Karbon Yoğunluğu</span>
              <div className="text-base font-bold mt-0.5" style={{ color: 'var(--foreground)' }}>
                {intensity !== null ? `${intensity.toFixed(1)} tCO₂e/çalışan` : 'Çalışan sayısı girilmedi'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
