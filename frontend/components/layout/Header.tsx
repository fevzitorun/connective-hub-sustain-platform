'use client'
import Link from 'next/link'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-40 flex items-center gap-4 px-6 bg-white border-b"
      style={{ height: 'var(--header-height, 60px)', borderColor: 'var(--border)' }}
    >
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold truncate" style={{ color: 'var(--green-800)' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{subtitle}</p>
        )}
      </div>
      <Link
        href="/veri-girisi"
        className="px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors"
        style={{ borderColor: 'var(--green-700)', color: 'var(--green-700)' }}
      >
        + Veri Gir
      </Link>
      <Link
        href="/ai-rapor"
        className="px-3 py-1.5 rounded-md text-xs font-semibold text-white transition-colors"
        style={{ background: 'var(--green-700)' }}
      >
        🤖 Rapor Üret
      </Link>
      <div className="w-px h-6" style={{ background: 'var(--border)' }} />
      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
        TSRS 2024 · 87 gün kaldı
      </span>
    </header>
  )
}
