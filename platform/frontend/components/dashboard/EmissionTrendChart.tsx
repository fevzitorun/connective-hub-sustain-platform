'use client'
import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { api } from '@/lib/api'

export function EmissionTrendChart() {
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof api.dashboard.summary>> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.dashboard.summary()
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false))
  }, [])

  const history = summary?.emissions_history ?? []
  const data = history.map(h => ({
    yil: String(h.year),
    'Kapsam 1+2': Math.round(h.scope1 + h.scope2),
    'Toplam (K1+2+3)': Math.round(h.total),
  }))

  return (
    <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'var(--border)' }}>
      <div className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>
        Emisyon Trendi
      </div>
      <div className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
        Yıllık toplam ton CO₂e (girilen yıllık envanterlere göre)
      </div>
      {loading ? (
        <div className="h-[200px] animate-pulse bg-gray-50 rounded" />
      ) : data.length < 2 ? (
        <p className="text-sm text-slate-400 py-16 text-center">
          Trend için en az 2 yıllık emisyon verisi gerekiyor.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
            <XAxis dataKey="yil" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
              formatter={(v) => [`${Number(v).toLocaleString('tr-TR')} ton`, '']}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="Kapsam 1+2" stroke="#2E7D32" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Toplam (K1+2+3)" stroke="#9E9E9E" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
