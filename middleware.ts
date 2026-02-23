// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'

const PUBLIC_PATHS = [
  '/',
  '/so-funktionierts',
  '/preise',
  '/partnerwerkstatt',
  '/faq',
  '/impressum',
  '/datenschutz',
  '/agb',
  '/widerruf',
  '/auth/login',
  '/auth/register',
]

const WERKSTATT_PATHS = ['/werkstatt']
const ADMIN_PATHS = ['/admin']
const API_ADMIN = ['/api/admin']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Statische Dateien & Next Internals überspringen
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/paypal/webhook') ||
    pathname.includes('.') // Dateien mit Extension
  ) {
    return NextResponse.next()
  }

  // Öffentliche Pfade ohne Auth
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  const session = await getSessionFromRequest(req)

  // Nicht angemeldet → Login
  if (!session) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Admin-Pfade
  if (
    (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) &&
    session.role !== 'ADMIN'
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Werkstatt-Pfade
  if (pathname.startsWith('/werkstatt') && session.role !== 'WERKSTATT' && session.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Kunden-Dashboard: Werkstatt → eigenes Dashboard
  if (pathname.startsWith('/dashboard') && session.role === 'WERKSTATT') {
    return NextResponse.redirect(new URL('/werkstatt/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
