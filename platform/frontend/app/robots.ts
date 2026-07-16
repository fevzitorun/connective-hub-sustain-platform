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
  '/uydu', '/risk-assets', '/denetim', '/pazaryeri', '/pre-launch',
  '/agency', '/denetci', '/grid-plus', '/nhs-ppn',
  '/api/', '/_next/',
]

export default function robots(): MetadataRoute.Robots {
  // Lansman öncesi: tüm site tarayıcılara kapalı. Tam lansmanda bu kural
  // aşağıdaki allow-liste + PLATFORM_DISALLOW yapısına geri döndürülecek.
  return {
    rules: [
      {
        userAgent: '*',
        disallow: '/',
      },
    ],
    host: 'https://www.sustainhub.online',
  }
}

// NOT: PLATFORM_DISALLOW yukarıda tam lansmanda kullanılmak üzere korunuyor.
void PLATFORM_DISALLOW
