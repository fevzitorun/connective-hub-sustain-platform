'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Kapsam 1', value: 4280, color: '#2E7D32' },
  { name: 'Kapsam 2', value: 12640, color: '#00897B' },
  { name: 'Kapsam 3', value: 183500, color: '#1565C0' },
]

export function ScopeDonutChart() {
  return (
    <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'var(--border)' }}>
      <div className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>
        Kapsam Dağılımı
      </div>
      <div className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
        2024 toplam: 200.420 ton CO₂e
      </div>
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
              2.4 tCO₂e/çalışan
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
