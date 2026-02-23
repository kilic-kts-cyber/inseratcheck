// app/datenschutz/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Datenschutz – InseratCheck' }

export default function DatenschutzPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-anthrazit-900 mb-2">Datenschutzerklärung</h1>
        <p className="text-sm text-anthrazit-500 mb-8">Stand: {new Date().toLocaleDateString('de-DE')}</p>
        
        <div className="space-y-8 text-anthrazit-700">
          <section>
            <h2 className="text-lg font-semibold text-anthrazit-900 mb-3">1. Verantwortlicher</h2>
            <p>Firat Kilic · InseratCheck · Schlachthofstraße 61 · 67433 Neustadt an der Weinstraße · info@inseratcheck.de</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-anthrazit-900 mb-3">2. Daten, die wir erheben</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Kontaktdaten (Name, E-Mail) bei Registrierung</li>
              <li>Fahrzeugdaten und Inseratslinks, die du uns übermittelst</li>
              <li>Zahlungsdaten (werden an PayPal weitergeleitet, nicht bei uns gespeichert)</li>
              <li>Fotos und Dokumente, die du im Rahmen einer Prüfung hochlädst</li>
              <li>Server-Logs (IP-Adresse, Zeitstempel) zur Sicherheit</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-anthrazit-900 mb-3">3. Zweck der Datenverarbeitung</h2>
            <p className="text-sm">Deine Daten werden ausschließlich zur Bereitstellung der InseratCheck-Dienstleistungen verwendet: Auftragsabwicklung, Kommunikation, Erstellung von Prüfberichten.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-anthrazit-900 mb-3">4. Rechtsgrundlagen</h2>
            <p className="text-sm">Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung), Art. 6 Abs. 1 lit. f DSGVO (berechtigte Interessen).</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-anthrazit-900 mb-3">5. Drittanbieter</h2>
            <p className="text-sm"><strong>PayPal:</strong> Zahlungsabwicklung. <strong>IONOS:</strong> E-Mail-Versand. Diese Anbieter verarbeiten Daten gemäß ihrer eigenen Datenschutzerklärungen.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-anthrazit-900 mb-3">6. Deine Rechte</h2>
            <p className="text-sm">Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Wende dich dafür an info@inseratcheck.de.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-anthrazit-900 mb-3">7. Speicherdauer</h2>
            <p className="text-sm">Deine Daten werden nur so lange gespeichert, wie es zur Auftragsabwicklung und für gesetzliche Aufbewahrungspflichten (i.d.R. 10 Jahre für Rechnungen) erforderlich ist.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-anthrazit-900 mb-3">8. Cookies</h2>
            <p className="text-sm">Wir verwenden nur technisch notwendige Session-Cookies für den Login. Keine Tracking- oder Werbe-Cookies ohne Einwilligung.</p>
          </section>

          <div className="card bg-yellow-50 border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Hinweis:</strong> Dies ist eine vereinfachte Datenschutzerklärung für MVP-Zwecke. 
              Bitte lasse diese vor dem Live-Betrieb von einem Datenschutzbeauftragten oder Anwalt prüfen und ergänzen.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
