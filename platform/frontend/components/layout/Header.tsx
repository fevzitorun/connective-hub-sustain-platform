'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const pathname = usePathname()
  const [lang, setLang] = useState('en')

  useEffect(() => {
    const savedLang = localStorage.getItem('sustain_lang')
    if (savedLang) {
      setLang(savedLang)
    } else if (pathname.startsWith('/tr')) {
      setLang('tr')
    }
  }, [pathname])

  const isTr = pathname.startsWith('/tr')

  return (
    <header
      className="sticky top-0 z-40 flex items-center gap-4 px-6 bg-white border-b border-slate-200"
      style={{ height: 'var(--header-height, 60px)' }}
    >
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold truncate text-slate-800">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-500">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <select 
          value={lang} 
          onChange={(e) => {
            const nextLang = e.target.value
            setLang(nextLang)
            localStorage.setItem('sustain_lang', nextLang)
            
            if (nextLang === 'tr') {
              window.location.href = '/tr/dashboard'
            } else {
              window.location.href = '/dashboard'
            }
          }}
          className="text-xs border border-slate-200 rounded-md px-2 py-1.5 outline-none bg-slate-50 text-slate-700 cursor-pointer focus:border-emerald-400"
        >
          <option value="en">🇬🇧 EN (CSRD)</option>
          <option value="tr">🇹🇷 TR (TSRS)</option>
          <option value="de">🇩🇪 DE (CSRD)</option>
        </select>
      </div>

      <Link
        href={isTr ? "/tr/dashboard" : "/veri-girisi"}
        className="px-3 py-1.5 rounded-md text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
      >
        {isTr ? "📊 Panel" : "+ Add Data"}
      </Link>
      <Link
        href="/cbam"
        className="px-3 py-1.5 rounded-md text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
      >
        {isTr ? "🌍 SKDM Dışa Aktar" : "🌍 CBAM Export"}
      </Link>
      <Link
        href="/ai-rapor"
        className="px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm"
      >
        {isTr ? "🤖 Yapay Zeka" : "🤖 AI Generate"}
      </Link>
      <div className="w-px h-6 bg-slate-200" />
      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
        {isTr ? "TSRS 2026 · Aktif" : "CSRD 2024 · Active"}
      </span>
    </header>
  )
}
