import { NextRequest, NextResponse } from 'next/server'

const LOCALES = ['en', 'tr'] as const
type Locale = typeof LOCALES[number]

function detectLocale(request: NextRequest): Locale {
  const acceptLanguage = request.headers.get('accept-language') ?? ''
  return acceptLanguage.toLowerCase().includes('tr') ? 'tr' : 'en'
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip Next.js internals, static assets, API routes, auth pages
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/legal') ||
    pathname.startsWith('/p/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // /en/* → rewrite to root (English is the default, no prefix needed)
  if (pathname.startsWith('/en/') || pathname === '/en') {
    const newPath = pathname === '/en' ? '/' : pathname.slice(3)
    const url = request.nextUrl.clone()
    url.pathname = newPath
    return NextResponse.rewrite(url)
  }

  // /tr/* → served as-is from app/tr/ directory
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

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
