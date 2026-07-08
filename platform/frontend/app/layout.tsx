import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { GoogleAnalytics } from '@next/third-parties/google'
import { CookieConsent } from '@/components/ui/CookieConsent'

const BASE_URL = 'https://sustainhub.online'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'SustainHub — Türkiye\'nin #1 AI Sürdürülebilirlik Platformu',
    template: '%s | SustainHub',
  },
  description: 'TSRS • ISSB • GRI • CBAM • EUDR • CDP — 43 modül, AI + uydu destekli sürdürülebilirlik raporlama. BİST-100\'den KOBİ\'ye, bankadan holdinglara. Ücretsiz ESG skoru alın.',
  keywords: [
    'TSRS', 'ISSB', 'GRI raporlama', 'sürdürülebilirlik raporu',
    'ESG', 'karbon ayak izi', 'CBAM', 'EUDR', 'KGK uyum',
    'BDDK yeşil varlık oranı', 'GAR', 'PCAF', 'Net Zero',
    'SustainHub', 'carbon accounting', 'Türkiye ESG', 'KOBİ ESG',
  ],
  authors: [{ name: 'SustainHub — Connective Hub Digital Technologies' }],
  creator: 'Connective Hub Digital Technologies Ltd.',
  publisher: 'SustainHub',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    alternateLocale: 'en_GB',
    url: BASE_URL,
    siteName: 'SustainHub',
    title: 'SustainHub — Türkiye\'nin #1 AI Sürdürülebilirlik Platformu',
    description: 'TSRS • ISSB • GRI • CBAM • EUDR • CDP — 43 modül. AI + uydu destekli. Ücretsiz ESG skoru alın.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SustainHub — AI Sürdürülebilirlik Platformu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@sustainhubonline',
    creator: '@sustainhubonline',
    title: 'SustainHub — Türkiye\'nin #1 AI Sürdürülebilirlik Platformu',
    description: 'TSRS • ISSB • GRI • CBAM — 43 modül. AI + uydu. Ücretsiz ESG skoru.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon-32x32.png',
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: BASE_URL,
    languages: {
      'tr-TR': BASE_URL,
      'en-GB': `${BASE_URL}/en`,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? 'google-site-verification-placeholder',
  },
  category: 'technology',
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? ''

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body>
        {children}
        <CookieConsent />
        <Toaster richColors position="top-right" />
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      </body>
    </html>
  )
}
