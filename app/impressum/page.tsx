// app/impressum/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Impressum – InseratCheck' }

export default function ImpressumPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-anthrazit-900 mb-8">Impressum</h1>
        <div className="prose prose-slate max-w-none space-y-6 text-anthrazit-700">
          <section>
            <h2 className="text-lg font-semibold text-anthrazit-900 mb-3">Angaben gemäß § 5 TMG</h2>
            <p>
              InseratCheck<br />
              Firat Kilic<br />
              Schlachthofstraße 61<br />
              67433 Neustadt an der Weinstraße<br />
              Deutschland
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-anthrazit-900 mb-3">Kontakt</h2>
            <p>
              E-Mail: <a href="mailto:info@inseratcheck.de" className="text-brand-600 hover:underline">info@inseratcheck.de</a>
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-anthrazit-900 mb-3">Umsatzsteuer-Identifikationsnummer</h2>
            <p>[Umsatzsteuer-ID gemäß §27a UStG – bitte ergänzen]</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-anthrazit-900 mb-3">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p>Firat Kilic, Schlachthofstraße 61, 67433 Neustadt an der Weinstraße</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-anthrazit-900 mb-3">Streitschlichtung</h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                https://ec.europa.eu/consumers/odr
              </a>
            </p>
            <p className="mt-2">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
