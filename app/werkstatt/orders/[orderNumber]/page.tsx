// app/werkstatt/orders/[orderNumber]/page.tsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Order {
  id: string
  orderNumber: string
  status: string
  make?: string
  model?: string
  year?: number
  mileage?: number
  vehicleZip?: string
  vehicleCity?: string
  vehicleAddress?: string
  listingUrl?: string
  preferredDate1?: string
  preferredDate2?: string
  preferredDate3?: string
  customerNote?: string
  workshopNote?: string
  confirmedDate?: string
  customer: { name?: string; email: string; phone?: string }
  checklist?: { overallResult?: string; completedAt?: string }
}

export default function WerkstattOrderPage({ params }: { params: { orderNumber: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmedDate, setConfirmedDate] = useState('')
  const [workshopNote, setWorkshopNote] = useState('')
  const [showConfirmForm, setShowConfirmForm] = useState(false)

  useEffect(() => {
    fetch(`/api/orders/${params.orderNumber}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setOrder(d.data.order)
          setWorkshopNote(d.data.order.workshopNote || '')
        }
      })
      .finally(() => setLoading(false))
  }, [params.orderNumber])

  async function doAction(action: string, extra?: Record<string, unknown>) {
    setError('')
    setActionLoading(true)
    try {
      const res = await fetch(`/api/orders/${params.orderNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, confirmedDate, workshopNote, ...extra }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Fehler'); return }
      setOrder(data.data.order)
      if (action === 'COMPLETE') router.push('/werkstatt/dashboard')
    } catch {
      setError('Netzwerkfehler')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-anthrazit-50 flex items-center justify-center"><div className="text-anthrazit-500">Lädt...</div></div>
  if (!order) return <div className="min-h-screen bg-anthrazit-50 flex items-center justify-center"><div className="text-anthrazit-500">Auftrag nicht gefunden</div></div>

  const minDate = new Date(); minDate.setDate(minDate.getDate() + 1)

  return (
    <div className="min-h-screen bg-anthrazit-50 py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="mb-6">
          <Link href="/werkstatt/dashboard" className="text-sm text-anthrazit-500 hover:text-anthrazit-700 mb-4 inline-block">
            ← Zurück zum Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-anthrazit-900">{order.orderNumber}</h1>
            <span className={`badge ${
              order.status === 'PENDING' ? 'badge-pending' :
              order.status === 'CONFIRMED' ? 'badge-confirmed' :
              order.status === 'PAID' ? 'badge-paid' :
              order.status === 'IN_PROGRESS' ? 'badge-progress' :
              order.status === 'COMPLETED' ? 'badge-completed' : 'badge'
            }`}>
              {order.status === 'PENDING' ? 'Neue Anfrage' :
               order.status === 'CONFIRMED' ? 'Bestätigt' :
               order.status === 'PAID' ? 'Bezahlt – Bereit' :
               order.status === 'IN_PROGRESS' ? 'In Bearbeitung' :
               order.status === 'COMPLETED' ? 'Abgeschlossen' : order.status}
            </span>
          </div>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

        {/* Aktionen */}
        {order.status === 'PENDING' && (
          <div className="card mb-6 bg-yellow-50 border-yellow-300">
            <h2 className="font-semibold text-anthrazit-900 mb-3">Anfrage bearbeiten</h2>

            {!showConfirmForm ? (
              <div className="flex gap-3">
                <button onClick={() => setShowConfirmForm(true)} className="btn-primary flex-1">
                  ✓ Termin bestätigen
                </button>
                <button onClick={() => doAction('REJECT')} disabled={actionLoading} className="btn-danger flex-1">
                  ✗ Ablehnen
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="label">Bestätigter Termin *</label>
                  <input type="datetime-local" className="input-field"
                    min={minDate.toISOString().slice(0, 16)}
                    value={confirmedDate} onChange={e => setConfirmedDate(e.target.value)} required />
                  <p className="text-xs text-anthrazit-400 mt-1">
                    Wünsche: {order.preferredDate1 ? new Date(order.preferredDate1).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }) : '–'}
                    {order.preferredDate2 && `, ${new Date(order.preferredDate2).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}`}
                    {order.preferredDate3 && `, ${new Date(order.preferredDate3).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}`}
                  </p>
                </div>
                <div>
                  <label className="label">Nachricht an Kunden (optional)</label>
                  <textarea className="input-field h-20 resize-none" placeholder="Hinweise, Anfahrt, etc."
                    value={workshopNote} onChange={e => setWorkshopNote(e.target.value)} />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowConfirmForm(false)} className="btn-secondary flex-1">Abbrechen</button>
                  <button onClick={() => doAction('CONFIRM')} disabled={actionLoading || !confirmedDate} className="btn-primary flex-1">
                    {actionLoading ? 'Wird gesendet...' : 'Bestätigen & Kunde benachrichtigen'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {order.status === 'PAID' && (
          <div className="card mb-6 bg-green-50 border-green-300">
            <h2 className="font-semibold text-green-900 mb-2">✅ Bezahlt – Fahrzeug prüfen</h2>
            <p className="text-sm text-green-700 mb-3">
              Die Zahlung ist eingegangen. Starte die Prüfung, wenn das Fahrzeug bei dir ist.
            </p>
            <div className="flex gap-3">
              <button onClick={() => doAction('START')} disabled={actionLoading} className="btn-primary">
                Prüfung starten
              </button>
              <Link href={`/werkstatt/checklist/${order.orderNumber}`} className="btn-secondary">
                Zur Checkliste →
              </Link>
            </div>
          </div>
        )}

        {order.status === 'IN_PROGRESS' && (
          <div className="card mb-6 bg-purple-50 border-purple-300">
            <h2 className="font-semibold text-purple-900 mb-2">🔧 Prüfung läuft</h2>
            <p className="text-sm text-purple-700 mb-3">Fülle die Checkliste aus und lade Fotos hoch. Dann kannst du den Auftrag abschließen.</p>
            <div className="flex gap-3">
              <Link href={`/werkstatt/checklist/${order.orderNumber}`} className="btn-primary">
                Checkliste ausfüllen
              </Link>
              {order.checklist?.overallResult && (
                <button onClick={() => doAction('COMPLETE')} disabled={actionLoading} className="btn-secondary">
                  Abschließen & Bericht senden
                </button>
              )}
            </div>
          </div>
        )}

        {/* Fahrzeugdaten */}
        <div className="card mb-4">
          <h2 className="font-semibold text-anthrazit-900 mb-3">Fahrzeugdaten</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Marke', value: order.make },
              { label: 'Modell', value: order.model },
              { label: 'Baujahr', value: order.year },
              { label: 'Kilometerstand', value: order.mileage ? `${order.mileage.toLocaleString('de-DE')} km` : undefined },
              { label: 'Fahrzeug PLZ', value: order.vehicleZip },
              { label: 'Fahrzeug Ort', value: order.vehicleCity },
            ].filter(i => i.value).map(item => (
              <div key={item.label}>
                <dt className="text-anthrazit-500 text-xs">{item.label}</dt>
                <dd className="font-medium text-anthrazit-900 mt-0.5">{item.value}</dd>
              </div>
            ))}
          </dl>
          {order.vehicleAddress && (
            <div className="mt-3 pt-3 border-t border-anthrazit-100 text-sm">
              <span className="text-anthrazit-500">Adresse: </span>
              <span className="text-anthrazit-900">{order.vehicleAddress}</span>
            </div>
          )}
          {order.listingUrl && (
            <div className="mt-3 pt-3 border-t border-anthrazit-100">
              <a href={order.listingUrl} target="_blank" rel="noopener noreferrer"
                className="text-sm text-brand-600 hover:text-brand-700">
                Zum Inserat →
              </a>
            </div>
          )}
        </div>

        {/* Kundendaten */}
        <div className="card mb-4">
          <h2 className="font-semibold text-anthrazit-900 mb-3">Kunde</h2>
          <div className="text-sm space-y-1">
            <div className="font-medium text-anthrazit-900">{order.customer.name || 'Unbekannt'}</div>
            <div className="text-anthrazit-500">{order.customer.email}</div>
            {order.customer.phone && <div className="text-anthrazit-500">📞 {order.customer.phone}</div>}
          </div>
          {order.customerNote && (
            <div className="mt-3 pt-3 border-t border-anthrazit-100">
              <div className="text-xs text-anthrazit-500 mb-1">Hinweis vom Kunden</div>
              <div className="text-sm text-anthrazit-700 italic">„{order.customerNote}"</div>
            </div>
          )}
        </div>

        {/* Terminwünsche */}
        <div className="card">
          <h2 className="font-semibold text-anthrazit-900 mb-3">Terminwünsche</h2>
          <div className="space-y-2 text-sm">
            {[order.preferredDate1, order.preferredDate2, order.preferredDate3].filter(Boolean).map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-anthrazit-600">
                <span className="text-xs bg-anthrazit-100 rounded px-1.5 py-0.5 font-medium">{i + 1}.</span>
                {new Date(d!).toLocaleString('de-DE', { dateStyle: 'full', timeStyle: 'short' })}
              </div>
            ))}
          </div>
          {order.confirmedDate && (
            <div className="mt-3 pt-3 border-t border-anthrazit-100">
              <div className="text-xs text-anthrazit-500 mb-1">Bestätigter Termin</div>
              <div className="text-sm font-medium text-green-700">
                ✓ {new Date(order.confirmedDate).toLocaleString('de-DE', { dateStyle: 'full', timeStyle: 'short' })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
