'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

// ENGLISH FIRST FOR DEMO
const navItems = [
  { section: 'General', items: [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
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
  { section: 'Analytics', items: [
    { href: '/university', label: 'University Portal', icon: '🏛️', badge: 'NEW' },
    { href: '/academy', label: 'SustainHub Academy', icon: '🎓', badge: 'NEW' },
    { href: '/maturity', label: 'Maturity Test', icon: '🎯', badge: 'NEW' },
    { href: '/scenarios', label: 'TCFD War-Room', icon: '🌊', badge: 'NEW' },
    { href: '/hub', label: 'Intelligence Hub', icon: '🌍', badge: 'NEW' },
    { href: '/benchmark', label: 'Benchmark', icon: '📈' },
    { href: '/simulator', label: 'ROI Simulator', icon: '⚡', badge: 'NEW' },
    { href: '/hedefler', label: 'Targets (SBTi)', icon: '🎯' },
    { href: '/uydu', label: 'Satellite Verify', icon: '🛰️' },
    { href: '/gar', label: 'Bank GAR Portal', icon: '🏦' },
    { href: '/esg', label: 'Public ESG Page', icon: '🌟' },
  ]},
  { section: 'Support', items: [
    { href: '/entegrasyon', label: 'Integrations', icon: '🔗' },
    { href: '/destekler', label: 'Subsidies', icon: '💰' },
  ]},
  { section: 'Account', items: [
    { href: '/abonelik', label: 'Subscription', icon: '💳', badge: 'NEW' },
  ]},
]

export function Sidebar() {
  const pathname = usePathname()

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
          AK
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold truncate">Akbank T.A.Ş.</div>
          <div className="text-xs text-emerald-400">Bank GAR Plan</div>
        </div>
        <span className="text-xs opacity-40">⌄</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map(({ section, items }) => (
          <div key={section}>
            <div
              className="px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-widest text-emerald-400/80"
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
