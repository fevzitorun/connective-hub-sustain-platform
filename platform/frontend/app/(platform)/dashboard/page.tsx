import { Header } from '@/components/layout/Header'
import { KpiGrid } from '@/components/dashboard/KpiGrid'
import { EmissionTrendChart } from '@/components/dashboard/EmissionTrendChart'
import { ScopeDonutChart } from '@/components/dashboard/ScopeDonutChart'
import { ComplianceGauge } from '@/components/dashboard/ComplianceGauge'
import { SatelliteWidget } from '@/components/dashboard/SatelliteWidget'
import { RecentReports } from '@/components/dashboard/RecentReports'

export default function DashboardPage() {
  return (
    <>
      <Header
        title="📊 Dashboard"
        subtitle="Akbank T.A.Ş. · 2024 Raporlama Dönemi"
      />
      <div className="p-6 flex-1 space-y-5">
        <KpiGrid />
        <div className="grid grid-cols-2 gap-5">
          <EmissionTrendChart />
          <ScopeDonutChart />
        </div>
        <div className="grid gap-5" style={{ gridTemplateColumns: '2fr 1fr' }}>
          <ComplianceGauge />
          <SatelliteWidget />
        </div>
        <RecentReports />
      </div>
    </>
  )
}
