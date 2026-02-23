// app/partnerwerkstatt/page.tsx
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Partnerwerkstatt werden – InseratCheck',
  description: 'Werde InseratCheck Partnerwerkstatt. Kostenlos, keine Gebühren. 79 € pro Auftrag. Gebietsschutz.',
}

export default function PartnerwerkstattPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-anthrazit-900 text-white py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm text-anthrazit-200 mb-6 border border-white/10">
            🔧 Für Kfz-Werkstätten
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            Neue Kunden.<br />
            <span className="text-brand-400">79 € pro Auftrag.</span><br />
            Null Risiko.
          </h1>
          <p className="text-xl text-anthrazit-300 leading-relaxed max-w-2xl mx-auto mb-8">
            Werde InseratCheck Partnerwerkstatt – kostenlos, ohne monatliche Gebühren. 
            Du bekommst direkte Kundenanfragen in deinem Gebiet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register?role=werkstatt" className="btn-primary text-base px-8 py-3">
              Jetzt kostenlos registrieren →
            </Link>
          </div>
        </div>
      </section>

      {/* Vorteile */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">Was du bekommst</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { icon: '💰', title: '79 € pro Auftrag', text: 'Du verdienst 79 € für jeden abgeschlossenen Werkstattcheck. Direkt, fair, transparent. Ohne Abzüge außer dem vereinbarten Split.' },
              { icon: '🛡️', title: 'Gebietsschutz', text: 'Du deckst deine Region ab. Kunden in deiner PLZ-Zone werden primär zu dir geleitet. Kein Preiskampf mit anderen Werkstätten.' },
              { icon: '📱', title: 'Digitale Checkliste', text: 'Alles mobil-optimiert. Checkliste ausfüllen, Fotos hochladen, Bericht senden – direkt vom Smartphone aus der Werkstatt.' },
              { icon: '📊', title: 'Eigenes Dashboard', text: 'Sieh alle Anfragen, bestätige Termine, verwalte laufende Prüfungen. Alles an einem Ort, ohne Papierkram.' },
              { icon: '🚫', title: 'Null Fixkosten', text: 'Keine monatlichen Gebühren. Kein Abo. Du zahlst nichts – du verdienst nur. InseratCheck trägt das volle Plattform-Risiko.' },
              { icon: '📧', title: 'Direktkontakt', text: 'Du kommunizierst direkt mit dem Kunden. Keine vermittelnde Plattform dazwischen, die euch trennt.' },
            ].map(item => (
              <div key={item.title} className="card hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-anthrazit-900 mb-2">{item.title}</h3>
                <p className="text-sm text-anthrazit-500 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ablauf */}
      <section className="py-20 bg-anthrazit-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-12">So läuft ein Auftrag ab</h2>
          <div className="space-y-4">
            {[
              { step: '1', icon: '📩', title: 'Du bekommst eine Anfrage', text: 'Kunde fragt Termin an → Du siehst Fahrzeugdaten, Terminwünsche und Fahrzeugstandort.' },
              { step: '2', icon: '✓', title: 'Termin bestätigen', text: 'Du wählst einen passenden Termin aus den Wünschen des Kunden (oder schlägst einen vor).' },
              { step: '3', icon: '💳', title: 'Kunde bezahlt', text: 'Nach Terminbestätigung bezahlt der Kunde sicher über PayPal. Der Auftrag wird aktiv.' },
              { step: '4', icon: '🔍', title: 'Prüfung durchführen', text: 'Fahrzeug prüfen, digitale Checkliste ausfüllen, VIN-Foto hochladen und Fotos dokumentieren.' },
              { step: '5', icon: '📋', title: 'Bericht senden', text: 'Du schließt die Checkliste ab → System erzeugt automatisch den Bericht für den Kunden.' },
              { step: '6', icon: '💸', title: 'Auszahlung (79 €)', text: 'Deine Vergütung wird durch InseratCheck Admin erfasst und überwiesen.' },
            ].map(item => (
              <div key={item.step} className="flex gap-4 items-start">
                <div className="h-10 w-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold shrink-0">
                  {item.step}
                </div>
                <div className="card flex-1 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-semibold text-anthrazit-900">{item.title}</span>
                  </div>
                  <p className="text-sm text-anthrazit-500">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ für Werkstätten */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-10">Häufige Fragen</h2>
          <div className="space-y-4">
            {[
              { q: 'Was kostet die Registrierung?', a: 'Gar nichts. Die Registrierung und Teilnahme als Partnerwerkstatt ist kostenlos. Keine Grundgebühren, kein Abo.' },
              { q: 'Muss ich eine Mindestanzahl an Prüfungen durchführen?', a: 'Nein. Du kannst Anfragen ablehnen, wenn du keine Kapazität hast. Du hast volle Kontrolle.' },
              { q: 'Welche Ausrüstung brauche ich?', a: 'Smartphone oder Tablet (für die Checkliste und Fotos) sowie ein OBD-Lesegerät. Das war\'s.' },
              { q: 'Wie funktioniert der Gebietsschutz?', a: 'Du kannst deine PLZ-Zone hinterlegen. Kunden in deinem Gebiet werden bevorzugt zu dir geleitet.' },
              { q: 'Wie und wann erhalte ich meine Vergütung?', a: 'Im MVP werden Auszahlungen manuell durch InseratCheck veranlasst. Bankdaten kannst du im Profil hinterlegen.' },
            ].map(item => (
              <div key={item.q} className="card">
                <h3 className="font-semibold text-anthrazit-900 mb-2">{item.q}</h3>
                <p className="text-sm text-anthrazit-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-600">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Bereit, Partnerwerkstatt zu werden?</h2>
          <p className="text-brand-100 text-lg mb-8">
            Registriere dich jetzt in 2 Minuten. Kostenlos, unverbindlich.
          </p>
          <Link href="/auth/register?role=werkstatt" className="btn-primary bg-white text-brand-700 hover:bg-brand-50 text-base px-8 py-3">
            Jetzt kostenlos registrieren →
          </Link>
        </div>
      </section>
    </div>
  )
}
