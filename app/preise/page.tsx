// app/preise/page.tsx
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Preise – InseratCheck',
  description: 'Transparente Preise für deinen Gebrauchtwagen-Check. Basischeck kostenlos, Werkstattcheck ab 118 €.',
}

export default function PreisePage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="section-title">Transparente Preise</h1>
          <p className="section-subtitle">Ein Preis, keine versteckten Kosten.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16">
          <div className="card">
            <span className="badge bg-anthrazit-100 text-anthrazit-700 mb-4 inline-block">Kostenlos</span>
            <h2 className="text-xl font-bold text-anthrazit-900">InseratCheck Basis</h2>
            <div className="text-4xl font-bold text-anthrazit-900 my-4">0 €</div>
            <ul className="space-y-3 mb-6 text-sm text-anthrazit-600">
              {['Inserats-Analyse', 'Strukturierte Hinweise', 'Checkliste zum Mitnehmen', 'Was fehlt im Inserat', 'Sofortiger Download'].map(f => (
                <li key={f} className="flex gap-2"><span className="text-green-500">✓</span>{f}</li>
              ))}
            </ul>
            <Link href="/dashboard/check" className="btn-secondary w-full text-center block">Kostenlos starten</Link>
          </div>

          <div className="card border-brand-300 bg-gradient-to-b from-brand-50 to-white relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="badge bg-brand-600 text-white px-4 py-1">Empfohlen</span>
            </div>
            <span className="badge bg-brand-100 text-brand-700 mb-4 inline-block">Werkstattcheck</span>
            <h2 className="text-xl font-bold text-anthrazit-900">Professionelle Prüfung</h2>
            <div className="flex items-baseline gap-2 my-4">
              <span className="text-4xl font-bold text-anthrazit-900">118 €</span>
              <span className="text-anthrazit-500">inkl. MwSt.</span>
            </div>
            <ul className="space-y-3 mb-6 text-sm text-anthrazit-700">
              {[
                'VIN-Verifikation mit Pflichtfoto',
                'OBD-Fehlerdiagnose',
                'Bremsen & Reifen (inkl. mm & DOT)',
                'Fahrwerk & Lenkung',
                'Motorraum & Lecks',
                'Karosserie & Lackdickenmessung',
                'HU/AU Prüfung',
                'Probefahrt',
                'Digitaler Prüfbericht',
                'PDF-Download',
                'Eintrag in Historien-Datenbank',
              ].map(f => (
                <li key={f} className="flex gap-2"><span className="text-brand-500 font-bold">✓</span>{f}</li>
              ))}
            </ul>
            <Link href="/dashboard/book" className="btn-primary w-full text-center block">Jetzt buchen</Link>
          </div>
        </div>

        {/* Werkstatt Split */}
        <div className="card bg-anthrazit-50 max-w-2xl mx-auto mb-16 text-center">
          <h3 className="font-semibold text-anthrazit-900 mb-3">Wie setzt sich der Preis zusammen?</h3>
          <div className="flex justify-center gap-8">
            <div><div className="text-2xl font-bold text-anthrazit-900">79 €</div><div className="text-sm text-anthrazit-500">Werkstatt-Vergütung</div></div>
            <div className="text-2xl font-bold text-anthrazit-300">+</div>
            <div><div className="text-2xl font-bold text-anthrazit-900">39 €</div><div className="text-sm text-anthrazit-500">InseratCheck Plattform</div></div>
          </div>
          <p className="text-xs text-anthrazit-400 mt-4">Keine zusätzlichen Gebühren für Werkstätten.</p>
        </div>

        {/* FAQ kurz */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-anthrazit-900 mb-6 text-center">Häufige Fragen zum Preis</h2>
          <div className="space-y-4">
            {[
              { q: 'Wann zahle ich?', a: 'Erst nachdem die Werkstatt deinen Terminwunsch bestätigt hat. Du zahlst sicher über PayPal.' },
              { q: 'Gibt es eine Erstattung?', a: 'Ja, falls der Termin nicht zustande kommt oder du innerhalb von 14 Tagen widerrufst (vor Durchführung der Prüfung).' },
              { q: 'Gibt es versteckte Kosten?', a: 'Nein. 118 € ist der Komplettpreis – inklusive Bericht, PDF und allem.' },
            ].map(item => (
              <div key={item.q} className="card">
                <h3 className="font-semibold text-anthrazit-900 mb-2">{item.q}</h3>
                <p className="text-sm text-anthrazit-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
