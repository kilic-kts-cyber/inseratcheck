// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: {
    default: 'InseratCheck – Sicher. Legal. Geprüft.',
    template: '%s | InseratCheck',
  },
  description: 'Mehr Sicherheit beim Gebrauchtwagenkauf. Inserat prüfen lassen und professionellen Werkstattcheck buchen – bevor du Geld verlierst.',
  keywords: ['Gebrauchtwagen prüfen', 'Fahrzeugcheck', 'Werkstattprüfung', 'Gebrauchtwagen kaufen', 'Fahrzeug Inserat prüfen'],
  authors: [{ name: 'InseratCheck' }],
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'InseratCheck',
    title: 'InseratCheck – Sicher. Legal. Geprüft.',
    description: 'Mehr Sicherheit beim Gebrauchtwagenkauf – bevor du Geld verlierst.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
