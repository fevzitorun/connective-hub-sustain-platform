import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Platform routes that require authentication
const PROTECTED_PREFIX = [
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
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PREFIX.some(p => pathname === p || pathname.startsWith(p + '/'))
  if (!isProtected) return NextResponse.next()

  const token = request.cookies.get('sustain_token')?.value
  if (!token) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
