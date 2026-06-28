import { NextRequest, NextResponse } from 'next/server'

const LOCALES = ['en', 'tr'] as const
type Locale = typeof LOCALES[number]

const PUBLIC_PATHS = ['/login', '/register', '/legal', '/p/']

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

  // Auth check
  const token = request.cookies.get('sustain_token')?.value
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p))

  if (!token && !isPublic) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
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
