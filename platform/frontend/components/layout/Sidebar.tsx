'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const BANK_NAV = [
  { section: '🏦 Bank Workspace', items: [
    { href: '/bank', label: 'Intelligence Suite', icon: '🏦', badge: 'GAR' },
    { href: '/gar', label: 'GAR Calculator', icon: '🌿' },
    { href: '/gar/kobi-dashboard', label: 'SME Portfolio', icon: '🏪' },
    { href: '/eu-taxonomy', label: 'EU Taxonomy Art.8', icon: '🇪🇺' },
    { href: '/executive', label: 'Board Summary', icon: '🏛️' },
  ]},
]

// ENGLISH FIRST FOR DEMO
const navItems = [
  { section: 'General', items: [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/executive', label: 'YK / CFO Özet', icon: '🏛️', badge: 'NEW' },
  ]},
  { section: 'Reporting', items: [
    { href: '/veri-girisi', label: 'Data Entry', icon: '📥' },
    { href: '/ai-rapor', label: 'AI Report Writer', icon: '🤖', badge: 'AI' },
    { href: '/raporlar', label: 'My Reports', icon: '📄' },
    { href: '/audit', label: 'Audit Trail', icon: '🔍' },
  ]},
  { section: 'Compliance', items: [
    { href: '/compliance', label: 'Global Tracker', icon: '🗓️', badge: 'NEW' },
    { href: '/cbam', label: 'CBAM Declaration', icon: '🏭' },
    { href: '/eudr', label: 'EUDR Supply', icon: '🌳' },
  ]},
  { section: 'Climate & ESG', items: [
    { href: '/health-check', label: 'ESG Health Check', icon: '🩺', badge: 'NEW' },
    { href: '/csrd', label: 'CSRD Çift Önemlilik', icon: '🇪🇺', badge: 'ESRS' },
    { href: '/tcfd', label: 'TCFD Scenarios', icon: '🌡️', badge: 'NEW' },
    { href: '/sroi', label: 'SROI Calculator', icon: '💹' },
    { href: '/tedarikciler', label: 'Supplier ESG Audit', icon: '🔗' },
    { href: '/benchmark', label: 'Benchmark', icon: '📈' },
    { href: '/hedefler', label: 'Targets (SBTi)', icon: '🎯' },
    { href: '/sbti', label: 'SBTi Target Calculator', icon: '🎯', badge: 'NEW' },
    { href: '/scope3', label: 'Scope 3 Value Chain', icon: '🔗', badge: 'NEW' },
    { href: '/issb', label: 'ISSB IFRS S1+S2', icon: '📋', badge: 'NEW' },
    { href: '/tsrs', label: 'TSRS 1+2 (KGK)', icon: '🇹🇷', badge: 'NEW' },
    { href: '/sasb-sdg', label: 'SASB + SDG', icon: '📊', badge: 'NEW' },
    { href: '/water-esrs', label: 'Water + ESRS E2-E5', icon: '💧', badge: 'NEW' },
    { href: '/esg-benchmark', label: 'ESG Benchmark', icon: '📈', badge: 'NEW' },
    { href: '/uydu', label: 'Earth Intelligence', icon: '🛰️', badge: 'NEW' },
    { href: '/gar', label: 'Bank GAR Portal', icon: '🏦', badge: 'PCAF' },
    { href: '/gar/kobi-dashboard', label: 'KOBİ Portföy', icon: '🏪' },
    { href: '/kobi-credit-score', label: 'KOBİ ESG Credit Score', icon: '🏅', badge: 'NEW' },
    { href: '/iso14064', label: 'Karbon Ayak İzi', icon: '🌿', badge: 'ISO' },
    { href: '/pcf', label: 'Ürün PCF (ISO 14067)', icon: '📦', badge: 'NEW' },
    { href: '/uk-sdr', label: 'FCA SDR + SFDR', icon: '🇬🇧', badge: 'UK' },
    { href: '/cdp', label: 'CDP Questionnaire', icon: '🌍', badge: 'CDP' },
    { href: '/eu-taxonomy', label: 'EU Taxonomy', icon: '🇪🇺', badge: 'NEW' },
    { href: '/gri', label: 'GRI 2021 Tracker', icon: '📖', badge: 'GRI' },
    { href: '/tnfd', label: 'TNFD Doğa Riski', icon: '🌿', badge: 'NEW' },
  ]},
  { section: 'Intelligence', items: [
    { href: '/hub', label: 'Intelligence Hub', icon: '🌍', badge: 'NEW' },
    { href: '/tcsi', label: 'Turkey ESG Index', icon: '🏆', badge: 'COP31' },
    { href: '/scenarios', label: 'TCFD War-Room', icon: '🌊' },
    { href: '/simulator', label: 'ROI Simulator', icon: '⚡' },
    { href: '/university', label: 'University Portal', icon: '🏛️' },
    { href: '/academy', label: 'Academy', icon: '🎓' },
    { href: '/esg', label: 'Public ESG Page', icon: '🌟' },
  ]},
  { section: 'Support', items: [
    { href: '/report-builder', label: 'Report Builder', icon: '📄', badge: 'NEW' },
    { href: '/autopilot', label: 'Sustain Autopilot', icon: '🤖', badge: 'NEW' },
    { href: '/entegrasyon', label: 'Integrations', icon: '🔌' },
    { href: '/destekler', label: 'Subsidies', icon: '💰' },
  ]},
  { section: 'Account', items: [
    { href: '/abonelik', label: 'Subscription', icon: '💳', badge: 'NEW' },
    { href: '/pre-launch', label: 'Pre-Launch QA', icon: '🚀', badge: 'ADMIN' },
  ]},
]

export function Sidebar() {
  const pathname = usePathname()
  const [companyType, setCompanyType] = useState<string>('')

  useEffect(() => {
    setCompanyType(localStorage.getItem('company_type') ?? '')
  }, [])

  const isBank = companyType === 'bank'
  const activeNav = isBank ? [...BANK_NAV, ...navItems] : navItems

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-50 bg-slate-900 text-white"
      style={{ width: 'var(--sidebar-width, 240px)' }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold bg-emerald-500"
        >
          🌿
        </div>
        <div>
          <div className="text-sm font-bold text-white">SustainHub</div>
          <div className="text-xs text-emerald-400">SustainHub.online · v2.0</div>
        </div>
      </div>

      {/* Company switcher */}
      <div className="mx-3 mt-3 rounded-lg px-3 py-2.5 flex items-center gap-2 cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold bg-emerald-500 text-white"
        >
          {isBank ? '🏦' : 'AK'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold truncate">{isBank ? 'Bank Demo Account' : 'Akbank T.A.Ş.'}</div>
          <div className="text-xs text-emerald-400">{isBank ? 'Bank GAR Workspace' : 'Corporate Plan'}</div>
        </div>
        <span className="text-xs opacity-40">⌄</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {activeNav.map(({ section, items }) => (
          <div key={section}>
            <div
              className={cn(
                'px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-widest',
                section.startsWith('🏦') ? 'text-yellow-400/90' : 'text-emerald-400/80'
              )}
            >
              {section}
            </div>
            {items.map(({ href, label, icon, badge }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all border-l-[3px]',
                    active
                      ? 'font-semibold border-emerald-400 bg-white/10 text-emerald-50'
                      : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <span className="text-base w-5 text-center">{icon}</span>
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      style={{ fontSize: '10px' }}
                    >
                      {badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-white/10 flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-slate-800 border border-slate-700"
        >
          KY
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-slate-200">Kemal Yılmaz</div>
          <div className="text-xs truncate text-emerald-400/80">Sustainability Dir.</div>
        </div>
      </div>
    </aside>
  )
}
