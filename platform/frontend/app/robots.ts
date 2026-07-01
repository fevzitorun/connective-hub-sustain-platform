import type { MetadataRoute } from 'next'

// Platform (auth-required) routes — block all crawlers
const PLATFORM_DISALLOW = [
  '/dashboard', '/gar', '/bank', '/executive', '/onboarding',
  '/veri-girisi', '/raporlar', '/abonelik', '/admin',
  '/health-check', '/tcfd', '/tsrs', '/issb', '/gri', '/cdp',
  '/csrd', '/eu-taxonomy', '/uk-sdr', '/cbam', '/eudr',
  '/scenarios', '/hub', '/hedefler', '/sbti', '/scope3',
  '/benchmark', '/esg-benchmark', '/tedarikciler', '/autopilot',
  '/report-builder', '/entegrasyon', '/destekler', '/iso14064',
  '/pcf', '/tnfd', '/sroi', '/kobi-credit-score', '/esg',
  '/university', '/academy', '/simulator', '/tcsi', '/sasb-sdg',
  '/uydu', '/denetim', '/pazaryeri', '/pre-launch',
  '/api/', '/_next/',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/products',
          '/pricing',
          '/investors',
          '/request-demo',
          '/contact',
          '/about',
          '/legal/',
        ],
        disallow: PLATFORM_DISALLOW,
      },
    ],
    sitemap: 'https://www.sustainhub.online/sitemap.xml',
    host: 'https://www.sustainhub.online',
  }
}
