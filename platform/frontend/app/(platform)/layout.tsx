import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'
import { DemoWizard } from '@/components/layout/DemoWizard'
import { CopilotPanel } from '@/components/copilot/CopilotPanel'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col" style={{ marginLeft: '240px' }}>
        {children}
        <Footer />
      </main>
      <DemoWizard />
      <CopilotPanel />
    </div>
  )
}
