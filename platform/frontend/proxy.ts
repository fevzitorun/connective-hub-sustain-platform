import { NextRequest, NextResponse } from 'next/server'

const LOCALES = ['en', 'tr'] as const
type Locale = typeof LOCALES[number]

// Public marketing pages — no auth required
const PUBLIC_PATHS = [
  '/login', '/register', '/forgot-password',
  '/legal', '/p/',
  '/products', '/pricing', '/request-demo', '/contact',
  '/investors', '/about', '/blog',
  '/sitemap', '/robots',
]

// Platform routes — always require auth
const PLATFORM_PATHS = [
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
]

function detectLocale(request: NextRequest): Locale {
  const acceptLanguage = request.headers.get('accept-language') ?? ''
  return acceptLanguage.toLowerCase().includes('tr') ? 'tr' : 'en'
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip Next.js internals, static assets, API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Auth check — only protect platform routes
  const token = request.cookies.get('sustain_token')?.value
  const isPlatform = PLATFORM_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p)) || pathname === '/'

  if (isPlatform && !token) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (token && (pathname === '/login' || pathname === '/register')) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  // /en/* → rewrite to root (English is the default, no prefix needed)
  if (pathname.startsWith('/en/') || pathname === '/en') {
    const newPath = pathname === '/en' ? '/' : pathname.slice(3)
    const url = request.nextUrl.clone()
    url.pathname = newPath
    return NextResponse.rewrite(url)
  }

  // /tr/* → served as-is
  if (pathname.startsWith('/tr/') || pathname === '/tr') {
    return NextResponse.next()
  }

  // Root (landing page) is always public — no auth required
  if (pathname === '/') {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
