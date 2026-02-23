// app/page.tsx
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'InseratCheck – Gebrauchtwagen sicher kaufen',
  description: 'Mehr Sicherheit beim Gebrauchtwagenkauf – bevor du Geld verlierst. Professioneller Werkstattcheck mit Bericht. Ab 118 €.',
}

function CheckIcon() {
  return (
    <svg className="h-5 w-5 text-brand-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}

export default function HomePage() {
  return (
    <div>
      {/* HERO */}
      <section className="relative bg-gradient-to-b from-anthrazit-900 via-brand-950 to-brand-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-brand-400 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-brand-600 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-brand-200 mb-6 backdrop-blur-sm border border-white/10">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              Deutschlandweit · Partnerwerkstätten · DSGVO-konform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Sicher.<br />Legal.<br />
              <span className="text-brand-400">Geprüft.</span>
            </h1>
            <p className="mt-6 text-xl text-anthrazit-200 leading-relaxed max-w-2xl">
              Mehr Sicherheit beim Gebrauchtwagenkauf – bevor du Geld verlierst. 
              Lass dein Wunschauto von einer zertifizierten Partnerwerkstatt prüfen.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard/book" className="btn-primary text-base px-6 py-3 bg-brand-500 hover:bg-brand-400">
                🔍 Werkstattcheck buchen – 118 €
              </Link>
              <Link href="/so-funktionierts" className="btn-secondary text-base px-6 py-3 bg-white/10 border-white/20 text-white hover:bg-white/20">
                So funktioniert's →
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6">
              {[
                'Keine versteckten Gebühren',
                'Offizieller Prüfbericht',
                'VIN-verifiziert',
                'Bundesweit verfügbar',
              ].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-anthrazit-300">
                  <CheckIcon />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-16 bg-anthrazit-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-anthrazit-900">
              Gebrauchtwagen kaufen ist riskant.
            </h2>
            <p className="mt-4 text-lg text-anthrazit-600">
              Jedes vierte Gebrauchtfahrzeug hat versteckte Mängel. Dreher am Tacho, verschwiegene Unfallschäden, 
              manipulierte Servicenachweise – als Privatperson erkennst du das ohne Fachwissen kaum.
            </p>
          </div>
          <div className="mt-12 grid sm:grid-cols-3 gap-6">
            {[
              { icon: '🔧', title: 'Versteckte Mängel', text: 'Motor, Getriebe, Fahrwerk – Schäden, die erst nach dem Kauf auftauchen.' },
              { icon: '📉', title: 'Manipulierter Kilometerstand', text: 'Tachostand-Manipulation ist in Deutschland weit verbreitet und kaum sichtbar.' },
              { icon: '💸', title: 'Finanzielle Verluste', text: 'Reparaturen nach dem Kauf kosten oft mehr als das Fahrzeug selbst.' },
            ].map(item => (
              <div key={item.title} className="card text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-semibold text-anthrazit-900 mb-2">{item.title}</h3>
                <p className="text-sm text-anthrazit-500 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LÖSUNG / ABLAUF */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="section-title">So einfach funktioniert InseratCheck</h2>
            <p className="section-subtitle">In 3 Schritten zu einem sicheren Autokauf – ohne selbst Experte sein zu müssen.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: '🔗',
                title: 'Inserat prüfen',
                text: 'Gib den Link zum Fahrzeug-Inserat ein. Wir analysieren sofort, was du beachten musst – kostenlos.',
                cta: 'Jetzt prüfen',
                href: '/dashboard/check',
              },
              {
                step: '02',
                icon: '📅',
                title: 'Werkstattcheck buchen',
                text: 'Gib deine PLZ ein, wähle eine Partnerwerkstatt in der Nähe und wünsche dir deinen Termin.',
                cta: 'Termin anfragen',
                href: '/dashboard/book',
              },
              {
                step: '03',
                icon: '📋',
                title: 'Bericht erhalten',
                text: 'Die Werkstatt prüft das Fahrzeug vor Ort und erstellt einen detaillierten digitalen Bericht.',
                cta: null,
                href: null,
              },
            ].map((item, i) => (
              <div key={item.step} className="relative">
                {i < 2 && (
                  <div className="hidden sm:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-brand-200 to-transparent -translate-x-4 z-0" />
                )}
                <div className="card relative z-10 h-full hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-bold text-brand-600 bg-brand-50 rounded-full px-2.5 py-1">
                      {item.step}
                    </span>
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-anthrazit-900 mb-3">{item.title}</h3>
                  <p className="text-sm text-anthrazit-500 leading-relaxed mb-4">{item.text}</p>
                  {item.cta && item.href && (
                    <Link href={item.href} className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
                      {item.cta} →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREISE */}
      <section className="py-20 bg-anthrazit-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="section-title">Transparent & fair</h2>
            <p className="section-subtitle">Ein Preis, keine Überraschungen.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Basis */}
            <div className="card">
              <div className="mb-4">
                <span className="badge bg-anthrazit-100 text-anthrazit-700">Kostenlos</span>
              </div>
              <h3 className="text-xl font-bold text-anthrazit-900">InseratCheck Basis</h3>
              <div className="text-3xl font-bold text-anthrazit-900 my-3">0 €</div>
              <p className="text-sm text-anthrazit-500 mb-6">Sofortanalyse deines Inserats mit Hinweisen auf typische Risiken.</p>
              <ul className="space-y-2 mb-6">
                {[
                  'Inserats-Analyse',
                  'Checkliste mit Hinweisen',
                  'Was fehlt im Inserat',
                  'Sofortiger Download',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-anthrazit-600">
                    <CheckIcon />{f}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard/check" className="btn-secondary w-full text-center block">
                Kostenlos prüfen
              </Link>
            </div>

            {/* Premium */}
            <div className="card border-brand-300 bg-brand-50 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="badge bg-brand-600 text-white">Empfohlen</span>
              </div>
              <div className="mb-4">
                <span className="badge bg-brand-100 text-brand-700">Werkstattcheck</span>
              </div>
              <h3 className="text-xl font-bold text-anthrazit-900">Professionelle Prüfung</h3>
              <div className="flex items-baseline gap-1 my-3">
                <span className="text-3xl font-bold text-anthrazit-900">118 €</span>
                <span className="text-sm text-anthrazit-500">inkl. MwSt.</span>
              </div>
              <p className="text-sm text-anthrazit-600 mb-6">Komplette Fahrzeugprüfung durch eine zertifizierte Partnerwerkstatt.</p>
              <ul className="space-y-2 mb-6">
                {[
                  'VIN-Verifikation mit Foto',
                  'OBD-Fehlerdiagnose',
                  'Bremsen & Reifen Check',
                  'Karosserie & Lack',
                  'Probefahrt',
                  'Digitaler Prüfbericht (PDF)',
                  'Historien-Datenbank Eintrag',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-anthrazit-700">
                    <CheckIcon />{f}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard/book" className="btn-primary w-full text-center block">
                Werkstattcheck buchen
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WERKSTATT CTA */}
      <section className="py-20 bg-anthrazit-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Du bist eine Werkstatt?</h2>
            <p className="text-lg text-anthrazit-300 mb-8 leading-relaxed">
              Werde Partnerwerkstatt – <strong className="text-white">kostenlos, keine Gebühren.</strong><br />
              79 € pro Auftrag. Gebietsschutz. Direkte Anfragen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/partnerwerkstatt" className="btn-primary text-base px-6 py-3">
                Jetzt Partnerwerkstatt werden →
              </Link>
              <Link href="/auth/register?role=werkstatt" className="btn-secondary text-base px-6 py-3 bg-white/10 border-white/20 text-white hover:bg-white/20">
                Direkt registrieren
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* VERTRAUEN */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-4 gap-6 text-center">
            {[
              { value: '100%', label: 'Unabhängig' },
              { value: '24h', label: 'Terminbestätigung' },
              { value: 'VIN', label: 'Verifiziert' },
              { value: 'DSGVO', label: 'Konform' },
            ].map(item => (
              <div key={item.label}>
                <div className="text-2xl font-bold text-brand-600">{item.value}</div>
                <div className="mt-1 text-sm text-anthrazit-500">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-brand-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Bereit für einen sicheren Autokauf?
          </h2>
          <p className="text-brand-100 text-lg mb-8">
            Fang heute an – der kostenlose InseratCheck dauert nur 2 Minuten.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="btn-primary bg-white text-brand-700 hover:bg-brand-50 text-base px-8 py-3">
              Kostenlos registrieren
            </Link>
            <Link href="/dashboard/book" className="btn-secondary bg-transparent border-white/50 text-white hover:bg-white/10 text-base px-8 py-3">
              Direkt buchen – 118 €
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
