import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'
import { DemoWizard } from '@/components/layout/DemoWizard'

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col" style={{ marginLeft: '240px' }}>
        {children}
        <Footer />
      </main>
      <DemoWizard />
    </div>
  )
}
