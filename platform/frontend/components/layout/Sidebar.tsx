'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { section: 'Genel', items: [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  ]},
  { section: 'Raporlama', items: [
    { href: '/veri-girisi', label: 'Veri Girişi', icon: '📥' },
    { href: '/ai-rapor', label: 'AI Rapor Yaz', icon: '🤖', badge: 'YENİ' },
    { href: '/raporlar', label: 'Raporlarım', icon: '📄' },
  ]},
  { section: 'Analiz', items: [
    { href: '/uydu', label: 'Uydu Doğrulama', icon: '🛰️' },
    { href: '/gar', label: 'Banka GAR Portalı', icon: '🏦' },
    { href: '/esg', label: 'ESG Web Sayfam', icon: '🌍' },
  ]},
  { section: 'Destek', items: [
    { href: '/destekler', label: 'Devlet Destekleri', icon: '💰' },
  ]},
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-50"
      style={{ width: 'var(--sidebar-width, 240px)', background: 'var(--green-900)', color: 'white' }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold"
          style={{ background: 'var(--green-500)' }}
        >
          🌿
        </div>
        <div>
          <div className="text-sm font-bold">sustain.com.tr</div>
          <div className="text-xs" style={{ color: 'var(--green-300)' }}>Connective Hub · v1.0</div>
        </div>
      </div>

      {/* Company switcher */}
      <div className="mx-3 mt-3 rounded-lg px-3 py-2.5 flex items-center gap-2 cursor-pointer"
        style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold"
          style={{ background: 'var(--green-500)' }}
        >
          AK
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold truncate">Akbank T.A.Ş.</div>
          <div className="text-xs" style={{ color: 'var(--green-300)' }}>Banka GAR Planı</div>
        </div>
        <span className="text-xs opacity-40">⌄</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map(({ section, items }) => (
          <div key={section}>
            <div
              className="px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'var(--green-300)' }}
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
                      ? 'font-semibold border-l-[var(--green-400)] bg-white/10 text-white'
                      : 'border-transparent text-white/70 hover:bg-white/8 hover:text-white'
                  )}
                >
                  <span className="text-base w-5 text-center">{icon}</span>
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: 'var(--green-500)', color: 'white', fontSize: '10px' }}
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
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: 'var(--green-600)' }}
        >
          KY
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold">Kemal Yılmaz</div>
          <div className="text-xs truncate" style={{ color: 'var(--green-300)' }}>Sürdürülebilirlik Müdürü</div>
        </div>
      </div>
    </aside>
  )
}
