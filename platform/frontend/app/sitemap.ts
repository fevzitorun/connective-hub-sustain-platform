import type { MetadataRoute } from 'next'

const BASE = 'https://sustainhub.online'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()

  const publicPages = [
    { url: BASE, priority: 1.0 },
    { url: `${BASE}/products`, priority: 0.9 },
    { url: `${BASE}/request-demo`, priority: 0.9 },
    { url: `${BASE}/about`, priority: 0.7 },
    { url: `${BASE}/contact`, priority: 0.7 },
    { url: `${BASE}/cop31`, priority: 0.8 },
    { url: `${BASE}/data-library`, priority: 0.6 },
    { url: `${BASE}/news-insights`, priority: 0.6 },
    { url: `${BASE}/sustainability-insights`, priority: 0.6 },
    { url: `${BASE}/login`, priority: 0.5 },
    { url: `${BASE}/register`, priority: 0.8 },
  ]

  const platformPages = [
    '/dashboard', '/executive', '/tsrs', '/issb', '/gri', '/cbam', '/eudr',
    '/report-builder', '/ai-rapor', '/uydu', '/gar', '/kobi-credit-score',
    '/esg-benchmark', '/tcfd', '/sbti', '/scope3', '/cdp', '/eu-taxonomy',
    '/health-check', '/magic-import', '/onboarding', '/abonelik',
  ].map(p => ({ url: `${BASE}${p}`, priority: 0.6 }))

  return [
    ...publicPages.map(p => ({
      url: p.url,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: p.priority,
    })),
    ...platformPages.map(p => ({
      url: p.url,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: p.priority,
    })),
  ]
}
