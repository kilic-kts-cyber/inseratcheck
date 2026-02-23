// components/layout/Header.tsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SessionUser {
  id: string
  email: string
  name: string | null
  role: 'KUNDE' | 'WERKSTATT' | 'ADMIN'
}

export function Header() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => d.success && setUser(d.data.user))
      .catch(() => {})
  }, [pathname])

  const dashboardPath =
    user?.role === 'WERKSTATT' ? '/werkstatt/dashboard' :
    user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    window.location.href = '/'
  }

  const isActive = (path: string) => pathname === path

  return (
    <header className="sticky top-0 z-50 border-b border-anthrazit-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <span className="text-sm font-bold text-white">IC</span>
            </div>
            <span className="text-lg font-bold text-anthrazit-900">InseratCheck</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/so-funktionierts"
              className={`text-sm font-medium transition-colors ${isActive('/so-funktionierts') ? 'text-brand-600' : 'text-anthrazit-600 hover:text-anthrazit-900'}`}>
              So funktioniert's
            </Link>
            <Link href="/preise"
              className={`text-sm font-medium transition-colors ${isActive('/preise') ? 'text-brand-600' : 'text-anthrazit-600 hover:text-anthrazit-900'}`}>
              Preise
            </Link>
            <Link href="/partnerwerkstatt"
              className={`text-sm font-medium transition-colors ${isActive('/partnerwerkstatt') ? 'text-brand-600' : 'text-anthrazit-600 hover:text-anthrazit-900'}`}>
              Partnerwerkstatt
            </Link>
            <Link href="/faq"
              className={`text-sm font-medium transition-colors ${isActive('/faq') ? 'text-brand-600' : 'text-anthrazit-600 hover:text-anthrazit-900'}`}>
              FAQ
            </Link>
          </nav>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href={dashboardPath} className="btn-secondary py-2 px-4 text-sm">
                  Dashboard
                </Link>
                <button onClick={logout} className="text-sm text-anthrazit-500 hover:text-anthrazit-900 transition-colors">
                  Abmelden
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-medium text-anthrazit-600 hover:text-anthrazit-900 transition-colors">
                  Anmelden
                </Link>
                <Link href="/auth/register" className="btn-primary py-2 px-4 text-sm">
                  Kostenlos starten
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-anthrazit-600 hover:bg-anthrazit-50"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-anthrazit-100 space-y-1">
            {[
              { href: '/so-funktionierts', label: 'So funktioniert\'s' },
              { href: '/preise', label: 'Preise' },
              { href: '/partnerwerkstatt', label: 'Partnerwerkstatt' },
              { href: '/faq', label: 'FAQ' },
            ].map(link => (
              <Link key={link.href} href={link.href}
                className="block px-3 py-2 rounded-lg text-sm text-anthrazit-700 hover:bg-anthrazit-50"
                onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              {user ? (
                <>
                  <Link href={dashboardPath} className="btn-primary text-center" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                  <button onClick={logout} className="text-sm text-center text-anthrazit-500">Abmelden</button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="btn-secondary text-center" onClick={() => setMenuOpen(false)}>Anmelden</Link>
                  <Link href="/auth/register" className="btn-primary text-center" onClick={() => setMenuOpen(false)}>Kostenlos starten</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
