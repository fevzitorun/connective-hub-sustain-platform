'use client'
import { useEffect, useState } from 'react'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'
import { api } from '@/lib/api'

// app/services/calculation_engine.py::calculate_tsrs_compliance() ile birebir eşleşir
const CHECK_LABELS: Record<string, string> = {
  governance_body_oversight: 'Yönetişim — YK izleme',
  governance_management_role: 'Yönetişim — Yönetimin rolü',
  governance_incentives: 'YK Ücretlendirme bağlantısı',
  strategy_risks_opportunities: 'Strateji — Risk ve fırsatlar',
  strategy_time_horizons: 'Strateji — Zaman ufukları',
  strategy_business_model: 'Strateji — İş modeli etkisi',
  strategy_scenario_analysis: 'Senaryo analizi (IEA/IPCC)',
  strategy_transition_plan: 'Geçiş planı detayı',
  risk_identification_process: 'Risk tespit süreci',
  risk_integration: 'Risk entegrasyonu',
  metrics_scope1: 'Kapsam 1 emisyonları',
  metrics_scope2_location: 'Kapsam 2 — konum bazlı',
  metrics_scope2_market: 'Kapsam 2 — piyasa bazlı',
  metrics_scope3: 'Kapsam 3 — tüm kategoriler',
  metrics_energy: 'Enerji metrikleri',
  metrics_cross_industry: 'Sektörler arası metrikler',
  metrics_sector_specific: 'Sektöre özgü metrikler',
  targets_climate: 'İklim hedefleri',
  annex_tsrs_index: 'TSRS İçerik Endeksi',
  annex_assurance: 'Güvence beyanı',
}

export function ComplianceGauge() {
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof api.dashboard.summary>> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.dashboard.summary()
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false))
  }, [])

  const score = summary?.compliance.score
  const grade = summary?.compliance.grade
  const checks = summary?.compliance.checks

  return (
    <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'var(--border)' }}>
      <div className="text-sm font-bold mb-4" style={{ color: 'var(--foreground)' }}>
        TSRS Uyumluluk Kontrol
      </div>
      {loading ? (
        <div className="h-28 animate-pulse bg-gray-50 rounded" />
      ) : score == null ? (
        <p className="text-sm text-slate-400 py-6 text-center">
          Henüz tamamlanmış bir rapor yok — bir AI rapor oluşturduğunuzda uyum skoru burada görünecek.
        </p>
      ) : (
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
              {grade && (
                <span
                  className="text-xs font-black mt-0.5 px-2 py-0.5 rounded"
                  style={{ background: 'var(--green-700)', color: 'white' }}
                >
                  {grade}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 space-y-1">
            {checks && Object.entries(checks).map(([key, ok]) => (
              <div key={key} className="flex items-center gap-2 text-xs py-0.5 border-b"
                style={{ borderColor: 'var(--green-50)', color: 'var(--gray-700, #424242)' }}>
                <span style={{ color: ok ? '#388E3C' : '#C62828' }}>
                  {ok ? '✓' : '✗'}
                </span>
                {CHECK_LABELS[key] ?? key}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
