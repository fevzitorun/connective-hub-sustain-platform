'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { ay: 'Oca', '2024': 1520, '2023': 1720 },
  { ay: 'Şub', '2024': 1480, '2023': 1700 },
  { ay: 'Mar', '2024': 1410, '2023': 1650 },
  { ay: 'Nis', '2024': 1390, '2023': 1630 },
  { ay: 'May', '2024': 1350, '2023': 1600 },
  { ay: 'Haz', '2024': 1320, '2023': 1580 },
  { ay: 'Tem', '2024': 1290, '2023': 1560 },
  { ay: 'Ağu', '2024': 1310, '2023': 1570 },
  { ay: 'Eyl', '2024': 1280, '2023': 1540 },
  { ay: 'Eki', '2024': 1260, '2023': 1510 },
  { ay: 'Kas', '2024': 1240, '2023': 1490 },
  { ay: 'Ara', '2024': 1220, '2023': 1470 },
]

export function EmissionTrendChart() {
  return (
    <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'var(--border)' }}>
      <div className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>
        Emisyon Trendi (3 Yıl)
      </div>
      <div className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
        Kapsam 1 + 2 ton CO₂e
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
          <XAxis dataKey="ay" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
            formatter={(v) => [`${Number(v).toLocaleString('tr-TR')} ton`, '']}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="2024" stroke="#2E7D32" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="2023" stroke="#9E9E9E" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
