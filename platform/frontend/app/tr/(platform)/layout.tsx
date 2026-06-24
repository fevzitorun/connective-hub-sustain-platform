import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-slate-50" style={{ paddingLeft: 'var(--sidebar-width, 240px)' }}>
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        {children}
        <Footer />
      </main>
    </div>
  )
}
