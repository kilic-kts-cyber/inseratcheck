// app/dashboard/orders/[orderNumber]/page.tsx
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PayPalButton } from './PayPalButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Auftragsdetails' }

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    PENDING:     ['badge-pending',   'Anfrage gestellt'],
    CONFIRMED:   ['badge-confirmed', 'Bestätigt – Bitte bezahlen'],
    PAID:        ['badge-paid',      'Bezahlt – Prüfung läuft'],
    IN_PROGRESS: ['badge-progress',  'In Bearbeitung'],
    COMPLETED:   ['badge-completed', 'Abgeschlossen'],
    CANCELLED:   ['badge-cancelled', 'Storniert'],
    REJECTED:    ['badge-rejected',  'Abgelehnt'],
  }
  const [cls, label] = map[status] || ['badge', status]
  return <span className={cls}>{label}</span>
}

function ResultIcon({ result }: { result: string }) {
  if (result === 'GUT')     return <span className="text-green-600 font-bold">✓ Gut</span>
  if (result === 'MITTEL')  return <span className="text-yellow-600 font-bold">⚠ Mittel</span>
  return <span className="text-red-600 font-bold">✗ Schlecht</span>
}

const UPLOAD_TYPE_LABEL: Record<string, string> = {
  VIN_PHOTO:      'VIN-Foto',
  ODOMETER:       'Tacho',
  OBD_SCREENSHOT: 'OBD-Diagnose',
  BRAKE_FRONT:    'Bremse vorne',
  BRAKE_REAR:     'Bremse hinten',
  BODY:           'Karosserie',
  HU_STICKER:     'HU-Plakette',
  OTHER:          'Sonstiges',
}

export default async function OrderDetailPage({ params }: { params: { orderNumber: string } }) {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: {
      customer: { select: { name: true, email: true } },
      workshop: { select: { name: true, street: true, city: true, zip: true, phone: true } },
      checklist: true,
      uploads: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!order) notFound()
  if (order.customerId !== session.id && session.role !== 'ADMIN') redirect('/dashboard')

  const canPay      = order.status === 'CONFIRMED' && !order.paidAt
  const isCompleted = order.status === 'COMPLETED'

  const vinPhotos    = order.uploads.filter(u => u.uploadType === 'VIN_PHOTO')
  const otherUploads = order.uploads.filter(u => u.uploadType !== 'VIN_PHOTO')

  return (
    <div className="min-h-screen bg-anthrazit-50 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">

        {/* Breadcrumb + Header */}
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-anthrazit-500 hover:text-anthrazit-700 mb-4 inline-block">
            ← Zurück zum Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-anthrazit-900">{order.orderNumber}</h1>
              <p className="text-sm text-anthrazit-500 mt-0.5">
                Erstellt am {new Date(order.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <StatusBadge status={order.status} />
          </div>
        </div>

        {/* Zahlung CTA */}
        {canPay && (
          <div className="card border-brand-300 bg-brand-50 mb-6">
            <h2 className="font-semibold text-brand-900 mb-2">✅ Termin bestätigt – Jetzt bezahlen</h2>
            <p className="text-sm text-brand-700 mb-1">
              <strong>Termin:</strong>{' '}
              {order.confirmedDate
                ? new Date(order.confirmedDate).toLocaleString('de-DE', { dateStyle: 'full', timeStyle: 'short' })
                : 'Wird noch mitgeteilt'}
            </p>
            {order.workshopNote && (
              <p className="text-sm text-brand-700 mb-4">
                <strong>Hinweis der Werkstatt:</strong> {order.workshopNote}
              </p>
            )}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-brand-900">118,00 €</span>
                <span className="text-sm text-brand-600 ml-2">inkl. MwSt.</span>
              </div>
              <PayPalButton orderNumber={order.orderNumber} paypalOrderId={order.paypalOrderId} />
            </div>
          </div>
        )}

        {/* Bericht + Download-Buttons */}
        {isCompleted && order.checklist && (
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-anthrazit-900">Prüfbericht</h2>
              <div className="flex gap-2 flex-wrap justify-end">
                <Link
                  href={`/report/${order.orderNumber}`}
                  className="btn-secondary text-sm py-1.5 px-4"
                  target="_blank"
                >
                  👁 Report ansehen
                </Link>
                <a
                  href={`/api/orders/${order.orderNumber}/report.pdf`}
                  className="btn-primary text-sm py-1.5 px-4"
                  download
                >
                  ⬇ PDF herunterladen
                </a>
              </div>
            </div>

            {/* Gesamturteil */}
            <div className="text-center py-4">
              <div className="text-5xl mb-2">
                {order.checklist.overallResult === 'GUT'     ? '✅' :
                 order.checklist.overallResult === 'MITTEL'  ? '⚠️' : '❌'}
              </div>
              <div className="text-2xl font-bold text-anthrazit-900">
                Gesamturteil:{' '}
                {order.checklist.overallResult && <ResultIcon result={order.checklist.overallResult} />}
              </div>
              {order.checklist.overallComment && (
                <p className="mt-3 text-anthrazit-600 text-sm leading-relaxed max-w-md mx-auto">
                  {order.checklist.overallComment}
                </p>
              )}
            </div>

            {/* Einzelergebnisse */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Bremsen vorne',  val: order.checklist.brakeFrontStatus },
                { label: 'Bremsen hinten', val: order.checklist.brakeRearStatus },
                { label: 'Motorraum',      val: order.checklist.engineLeaks  === false ? 'GUT' : order.checklist.engineLeaks  === true ? 'SCHLECHT' : null },
                { label: 'OBD-Fehler',     val: order.checklist.obdErrors    === false ? 'GUT' : order.checklist.obdErrors    === true ? 'SCHLECHT' : null },
                { label: 'Karosserie',     val: order.checklist.accidentSuspect === false ? 'GUT' : order.checklist.accidentSuspect === true ? 'SCHLECHT' : null },
                { label: 'Probefahrt',     val: order.checklist.testDriveIssues === false ? 'GUT' : order.checklist.testDriveIssues === true ? 'MITTEL'   : null },
              ].filter(i => i.val).map(item => (
                <div key={item.label} className="bg-anthrazit-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-anthrazit-500 mb-1">{item.label}</div>
                  {item.val && <ResultIcon result={item.val} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload-Galerie */}
        {order.uploads.length > 0 && (
          <div className="card mb-6">
            <h2 className="font-semibold text-anthrazit-900 mb-4">
              Dokumentationsfotos
              <span className="text-xs text-anthrazit-400 font-normal ml-2">({order.uploads.length} Dateien)</span>
            </h2>

            {vinPhotos.length > 0 && (
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-anthrazit-500 uppercase tracking-wide mb-3">
                  VIN-Fotos
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {vinPhotos.map(u => (
                    <a
                      key={u.id}
                      href={`/uploads/${u.filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block rounded-lg overflow-hidden border border-brand-200 bg-brand-50 hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-video bg-brand-100 flex items-center justify-center overflow-hidden">
                        <img
                          src={`/uploads/${u.filename}`}
                          alt={u.originalName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            const el = e.currentTarget as HTMLImageElement
                            el.style.display = 'none'
                            const parent = el.parentElement
                            if (parent) parent.innerHTML = '<span class="text-brand-400 text-xs">Kein Vorschau</span>'
                          }}
                        />
                      </div>
                      <div className="px-2 py-1.5">
                        <div className="text-xs font-medium text-brand-700 truncate">{UPLOAD_TYPE_LABEL[u.uploadType] || u.uploadType}</div>
                        <div className="text-xs text-anthrazit-400 truncate">{u.originalName}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {otherUploads.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-anthrazit-500 uppercase tracking-wide mb-3">
                  Weitere Fotos
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {otherUploads.map(u => (
                    <a
                      key={u.id}
                      href={`/uploads/${u.filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block rounded-lg overflow-hidden border border-anthrazit-200 hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-video bg-anthrazit-100 flex items-center justify-center overflow-hidden">
                        <img
                          src={`/uploads/${u.filename}`}
                          alt={u.originalName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            const el = e.currentTarget as HTMLImageElement
                            el.style.display = 'none'
                          }}
                        />
                      </div>
                      <div className="px-2 py-1.5">
                        <div className="text-xs font-medium text-anthrazit-700 truncate">{UPLOAD_TYPE_LABEL[u.uploadType] || u.uploadType}</div>
                        <div className="text-xs text-anthrazit-400 truncate">{u.originalName}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fahrzeugdaten */}
        <div className="card mb-6">
          <h2 className="font-semibold text-anthrazit-900 mb-4">Fahrzeugdaten</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Marke',            value: order.make },
              { label: 'Modell',           value: order.model },
              { label: 'Baujahr',          value: order.year },
              { label: 'Kilometerstand',   value: order.mileage ? `${order.mileage.toLocaleString('de-DE')} km` : undefined },
              { label: 'Standort PLZ',     value: order.vehicleZip },
              { label: 'Standort Stadt',   value: order.vehicleCity },
              { label: 'VIN',              value: order.vin },
            ].filter(i => i.value).map(item => (
              <div key={item.label}>
                <dt className="text-anthrazit-500">{item.label}</dt>
                <dd className="font-medium text-anthrazit-900 mt-0.5">{item.value}</dd>
              </div>
            ))}
          </dl>
          {order.listingUrl && (
            <div className="mt-3 pt-3 border-t border-anthrazit-100">
              <a href={order.listingUrl} target="_blank" rel="noopener noreferrer"
                className="text-sm text-brand-600 hover:text-brand-700">
                Zum Inserat →
              </a>
            </div>
          )}
        </div>

        {/* Werkstatt */}
        {order.workshop && (
          <div className="card mb-6">
            <h2 className="font-semibold text-anthrazit-900 mb-3">Partnerwerkstatt</h2>
            <div className="text-sm space-y-1">
              <div className="font-medium text-anthrazit-900">{order.workshop.name}</div>
              <div className="text-anthrazit-500">{order.workshop.street}</div>
              <div className="text-anthrazit-500">{order.workshop.zip} {order.workshop.city}</div>
              {order.workshop.phone && <div className="text-anthrazit-500">📞 {order.workshop.phone}</div>}
            </div>
            {order.confirmedDate && (
              <div className="mt-3 pt-3 border-t border-anthrazit-100">
                <div className="text-xs text-anthrazit-500">Bestätigter Termin</div>
                <div className="text-sm font-medium text-anthrazit-900 mt-0.5">
                  {new Date(order.confirmedDate).toLocaleString('de-DE', { dateStyle: 'full', timeStyle: 'short' })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status-Hinweise */}
        {order.status === 'PENDING' && (
          <div className="card bg-yellow-50 border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>⏳ Warte auf Bestätigung</strong><br />
              Die Werkstatt prüft deine Anfrage und bestätigt einen Termin. Du wirst per E-Mail benachrichtigt.
            </p>
          </div>
        )}
        {order.status === 'PAID' && (
          <div className="card bg-green-50 border-green-200">
            <p className="text-sm text-green-800">
              <strong>✅ Auftrag aktiv</strong><br />
              Deine Zahlung ist eingegangen. Die Werkstatt wird das Fahrzeug zum vereinbarten Termin prüfen.
            </p>
          </div>
        )}
        {order.status === 'IN_PROGRESS' && (
          <div className="card bg-blue-50 border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>🔍 Prüfung läuft</strong><br />
              Die Werkstatt führt gerade die Fahrzeugprüfung durch.
            </p>
          </div>
        )}
        {order.status === 'REJECTED' && (
          <div className="card bg-red-50 border-red-200">
            <p className="text-sm text-red-800">
              <strong>❌ Anfrage abgelehnt</strong><br />
              {order.workshopNote || 'Die Werkstatt konnte den Termin nicht durchführen.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
