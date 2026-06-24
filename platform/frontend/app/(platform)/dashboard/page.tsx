import { Header } from '@/components/layout/Header'
import { KpiGrid } from '@/components/dashboard/KpiGrid'
import { EmissionTrendChart } from '@/components/dashboard/EmissionTrendChart'
import { ScopeDonutChart } from '@/components/dashboard/ScopeDonutChart'
import { ComplianceGauge } from '@/components/dashboard/ComplianceGauge'
import { SatelliteWidget } from '@/components/dashboard/SatelliteWidget'
import { RecentReports } from '@/components/dashboard/RecentReports'
import { ComplianceCalendar } from '@/components/dashboard/ComplianceCalendar'
import { UKMarketAccessWidget } from '@/components/dashboard/UKMarketAccessWidget'

export default function DashboardPage() {
  return (
    <>
      <Header
        title="📊 Dashboard"
        subtitle="Akbank T.A.Ş. · 2024 Reporting Period"
      />
      <div className="p-6 flex-1 space-y-5">
        <KpiGrid />
        <div className="grid grid-cols-2 gap-5">
          <EmissionTrendChart />
          <ScopeDonutChart />
        </div>
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2">
            <ComplianceGauge />
          </div>
          <div className="col-span-1 space-y-5">
            <UKMarketAccessWidget />
            <SatelliteWidget />
          </div>
        </div>
        <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 2fr' }}>
          <ComplianceCalendar />
          <RecentReports />
        </div>
      </div>
    </>
  )
}
