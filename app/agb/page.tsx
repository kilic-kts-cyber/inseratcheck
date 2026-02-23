// app/agb/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'AGB – InseratCheck' }

export default function AgbPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-anthrazit-900 mb-2">Allgemeine Geschäftsbedingungen</h1>
        <p className="text-sm text-anthrazit-500 mb-8">Stand: {new Date().toLocaleDateString('de-DE')}</p>

        <div className="card bg-yellow-50 border-yellow-200 mb-8">
          <p className="text-sm text-yellow-800">
            <strong>Platzhalter:</strong> Diese AGB sind für den MVP-Betrieb vereinfacht. Bitte lasse sie vor dem kommerziellen Betrieb von einem Rechtsanwalt erstellen oder prüfen.
          </p>
        </div>

        <div className="space-y-8 text-anthrazit-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-anthrazit-900 mb-3">§ 1 Geltungsbereich</h2>
            <p>Diese AGB gelten für alle Verträge zwischen InseratCheck (Firat Kilic, Schlachthofstraße 61, 67433 Neustadt an der Weinstraße) und Nutzern der Plattform inseratcheck.de.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-anthrazit-900 mb-3">§ 2 Leistungsbeschreibung</h2>
            <p>InseratCheck bietet eine Plattform zur Vermittlung von Fahrzeugprüfungen zwischen Käufern (Kunden) und zertifizierten Kfz-Werkstätten (Partnerwerkstätten). Das Hauptprodukt ist der Werkstattcheck für 118,00 € inkl. MwSt.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-anthrazit-900 mb-3">§ 3 Vertragsschluss</h2>
            <p>Ein verbindlicher Vertrag kommt zustande, wenn (1) der Kunde eine Buchungsanfrage stellt, (2) die Werkstatt den Termin bestätigt und (3) der Kunde die Zahlung über PayPal abschließt.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-anthrazit-900 mb-3">§ 4 Preise und Zahlung</h2>
            <p>Alle Preise verstehen sich in Euro inkl. gesetzlicher Mehrwertsteuer. Die Zahlung erfolgt ausschließlich über PayPal. Eine Zahlung per Rechnung ist nicht möglich.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-anthrazit-900 mb-3">§ 5 Widerrufsrecht</h2>
            <p>Verbrauchern steht ein 14-tägiges Widerrufsrecht zu. Das Widerrufsrecht erlischt, sobald die Werkstattprüfung vollständig durchgeführt wurde und der Kunde der vorzeitigen Ausführung ausdrücklich zugestimmt hat. Näheres siehe Widerrufserklärung.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-anthrazit-900 mb-3">§ 6 Haftung</h2>
            <p>InseratCheck haftet für die ordnungsgemäße Vermittlung des Prüftermins. Für die fachliche Qualität der Prüfung haftet die jeweilige Partnerwerkstatt. InseratCheck übernimmt keine Gewähr für die Kaufentscheidung des Kunden.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-anthrazit-900 mb-3">§ 7 Datenschutz</h2>
            <p>Es gilt die separate Datenschutzerklärung unter /datenschutz.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-anthrazit-900 mb-3">§ 8 Anwendbares Recht</h2>
            <p>Es gilt deutsches Recht. Gerichtsstand ist, soweit gesetzlich zulässig, Neustadt an der Weinstraße.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
