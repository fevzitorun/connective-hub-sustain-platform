import type { ReactNode } from 'react'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#0F172A', color: '#fff' }}>
      {/* Top Nav */}
      <nav className="border-b flex items-center justify-between px-8 h-16" style={{ borderColor: '#1e293b', background: '#0F172A' }}>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black" style={{ background: '#10b981' }}>S</div>
          <span className="font-black text-white tracking-tight">SustainHub</span>
          <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ background: '#7c3aed', color: '#fff' }}>ADMIN</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-semibold" style={{ color: '#94a3b8' }}>
          <Link href="/admin" className="hover:text-white transition-colors">Cockpit</Link>
          <Link href="/dashboard" className="hover:text-white transition-colors">Platform →</Link>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}
