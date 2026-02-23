// components/layout/Footer.tsx
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-anthrazit-900 text-anthrazit-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600">
                <span className="text-xs font-bold text-white">IC</span>
              </div>
              <span className="text-sm font-bold text-white">InseratCheck</span>
            </div>
            <p className="text-sm text-anthrazit-400 leading-relaxed">
              Sicher. Legal. Geprüft.<br />
              Mehr Sicherheit beim Gebrauchtwagenkauf.
            </p>
            <p className="mt-4 text-xs text-anthrazit-500">
              info@inseratcheck.de
            </p>
          </div>

          {/* Service */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-anthrazit-400 mb-4">
              Service
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/so-funktionierts', label: 'So funktioniert\'s' },
                { href: '/preise', label: 'Preise' },
                { href: '/faq', label: 'FAQ' },
                { href: '/auth/register', label: 'Kostenlos starten' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-anthrazit-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Werkstätten */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-anthrazit-400 mb-4">
              Werkstätten
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/partnerwerkstatt', label: 'Partnerwerkstatt werden' },
                { href: '/auth/register?role=werkstatt', label: 'Jetzt registrieren' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-anthrazit-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Rechtliches */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-anthrazit-400 mb-4">
              Rechtliches
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/impressum', label: 'Impressum' },
                { href: '/datenschutz', label: 'Datenschutz' },
                { href: '/agb', label: 'AGB' },
                { href: '/widerruf', label: 'Widerruf' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-anthrazit-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-anthrazit-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-anthrazit-500">
            © {new Date().getFullYear()} InseratCheck · Firat Kilic · Schlachthofstraße 61, 67433 Neustadt an der Weinstraße
          </p>
          <p className="text-xs text-anthrazit-600">Made in Germany 🇩🇪</p>
        </div>
      </div>
    </footer>
  )
}
