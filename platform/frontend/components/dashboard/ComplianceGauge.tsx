'use client'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'

const checks = [
  { label: 'Yönetişim — YK izleme', ok: true },
  { label: 'YK Ücretlendirme bağlantısı', ok: true },
  { label: 'Senaryo analizi (IEA/IPCC)', ok: true },
  { label: 'Kapsam 1 & 2 emisyonları', ok: true },
  { label: 'Kapsam 3 — tüm kategoriler', ok: null },
  { label: 'Geçiş planı detayı', ok: null },
  { label: 'SBTi hedef onayı', ok: false },
  { label: 'TSRS İçerik Endeksi', ok: true },
  { label: 'Güvence beyanı (PwC)', ok: true },
]

export function ComplianceGauge() {
  const score = 87
  const data = [{ value: score, fill: '#2E7D32' }]

  return (
    <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'var(--border)' }}>
      <div className="text-sm font-bold mb-4" style={{ color: 'var(--foreground)' }}>
        TSRS Uyumluluk Kontrol
      </div>
      <div className="flex items-center gap-6">
        <div className="relative w-28 h-28 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%" cy="50%"
              innerRadius="70%" outerRadius="100%"
              startAngle={90} endAngle={-270}
              data={[{ value: score, fill: '#2E7D32' }, { value: 100 - score, fill: '#E0E0E0' }]}
            >
              <RadialBar dataKey="value" cornerRadius={4} background={false} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black" style={{ color: 'var(--green-800)' }}>{score}</span>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>/ 100</span>
            <span
              className="text-xs font-black mt-0.5 px-2 py-0.5 rounded"
              style={{ background: 'var(--green-700)', color: 'white' }}
            >
              B
            </span>
          </div>
        </div>
        <div className="flex-1 space-y-1">
          {checks.map(({ label, ok }) => (
            <div key={label} className="flex items-center gap-2 text-xs py-0.5 border-b"
              style={{ borderColor: 'var(--green-50)', color: 'var(--gray-700, #424242)' }}>
              <span style={{ color: ok === true ? '#388E3C' : ok === null ? '#F57F17' : '#C62828' }}>
                {ok === true ? '✓' : ok === null ? '⚠' : '✗'}
              </span>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
