import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const LOCALES = ['en', 'tr'] as const
type Locale = typeof LOCALES[number]

const PUBLIC_PATHS = ['/login', '/register', '/legal']

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
    pathname.startsWith('/p/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // ── Locale routing ──────────────────────────────────────────────────────────

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

  // Root path with Turkish browser → redirect to /tr
  if (pathname === '/') {
    const locale = detectLocale(request)
    if (locale === 'tr') {
      const url = request.nextUrl.clone()
      url.pathname = '/tr'
      return NextResponse.redirect(url)
    }
  }

  // ── Auth protection ─────────────────────────────────────────────────────────

  const token = request.cookies.get('sustain_token')?.value
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p))

  if (!token && !isPublic) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  if (token && isPublic) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
