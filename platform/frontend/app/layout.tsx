import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'SustainHub.online — Sürdürülebilirlik Raporlama Platformu',
  description: "Türkiye'nin ilk AI + uydu destekli TSRS uyumlu sürdürülebilirlik raporlama platformu.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
