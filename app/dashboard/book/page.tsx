// app/dashboard/book/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Workshop {
  id: string
  name: string
  street: string
  city: string
  zip: string
  phone?: string
  description?: string
  distanceKm: number
}

export default function BookPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [zip, setZip] = useState('')
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    listingUrl: '',
    make: '',
    model: '',
    year: '',
    mileage: '',
    price: '',
    vehicleZip: '',
    vehicleCity: '',
    vehicleAddress: '',
    preferredDate1: '',
    preferredDate2: '',
    preferredDate3: '',
    customerNote: '',
  })

  async function searchWorkshops() {
    if (!/^\d{5}$/.test(zip)) {
      setError('Bitte gib eine gültige 5-stellige PLZ ein')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/workshops?zip=${zip}&radius=100`)
      const data = await res.json()
      setWorkshops(data.data.workshops)
      if (data.data.workshops.length === 0) {
        setError('Leider noch keine Partnerwerkstatt in deiner Nähe. Wir arbeiten daran!')
      }
    } catch {
      setError('Suche fehlgeschlagen')
    } finally {
      setLoading(false)
    }
  }

  async function submitOrder() {
    if (!selectedWorkshop || !form.preferredDate1 || !form.vehicleZip) {
      setError('Bitte fülle alle Pflichtfelder aus')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workshopId: selectedWorkshop.id,
          listingUrl: form.listingUrl || undefined,
          make: form.make || undefined,
          model: form.model || undefined,
          year: form.year ? parseInt(form.year) : undefined,
          mileage: form.mileage ? parseInt(form.mileage) : undefined,
          price: form.price ? parseInt(form.price) : undefined,
          vehicleZip: form.vehicleZip,
          vehicleCity: form.vehicleCity || undefined,
          vehicleAddress: form.vehicleAddress || undefined,
          preferredDate1: new Date(form.preferredDate1).toISOString(),
          preferredDate2: form.preferredDate2 ? new Date(form.preferredDate2).toISOString() : undefined,
          preferredDate3: form.preferredDate3 ? new Date(form.preferredDate3).toISOString() : undefined,
          customerNote: form.customerNote || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Buchung fehlgeschlagen')
        return
      }
      router.push(`/dashboard/orders/${data.data.order.orderNumber}`)
    } catch {
      setError('Netzwerkfehler')
    } finally {
      setLoading(false)
    }
  }

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().slice(0, 16)

  return (
    <div className="min-h-screen bg-anthrazit-50 py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-sm text-anthrazit-500 hover:text-anthrazit-700 mb-4 inline-block">
            ← Zurück zum Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-anthrazit-900">Werkstattcheck buchen</h1>
          <p className="mt-1 text-anthrazit-500">Professionelle Fahrzeugprüfung durch eine Partnerwerkstatt – 118 €</p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step >= s ? 'bg-brand-600 text-white' : 'bg-anthrazit-200 text-anthrazit-500'
              }`}>{s}</div>
              {s < 3 && <div className={`h-0.5 w-12 ${step > s ? 'bg-brand-600' : 'bg-anthrazit-200'}`} />}
            </div>
          ))}
          <div className="ml-2 text-sm text-anthrazit-500">
            {step === 1 && 'Werkstatt wählen'}
            {step === 2 && 'Fahrzeugdaten'}
            {step === 3 && 'Terminwunsch'}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
        )}

        {/* STEP 1: Werkstatt suchen */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="card">
              <h2 className="font-semibold text-anthrazit-900 mb-4">Werkstatt in deiner Nähe finden</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  className="input-field"
                  placeholder="PLZ des Fahrzeugstandorts"
                  value={zip}
                  onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  maxLength={5}
                />
                <button onClick={searchWorkshops} disabled={loading || zip.length < 5} className="btn-primary whitespace-nowrap">
                  {loading ? 'Suche...' : 'Suchen'}
                </button>
              </div>
            </div>

            {workshops.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-anthrazit-500">{workshops.length} Werkstatt{workshops.length !== 1 ? 'en' : ''} gefunden</p>
                {workshops.map(ws => (
                  <button
                    key={ws.id}
                    onClick={() => { setSelectedWorkshop(ws); setStep(2) }}
                    className={`card w-full text-left hover:shadow-md transition-all ${selectedWorkshop?.id === ws.id ? 'border-brand-400 bg-brand-50' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-anthrazit-900">{ws.name}</div>
                        <div className="text-sm text-anthrazit-500 mt-1">{ws.street}, {ws.zip} {ws.city}</div>
                        {ws.description && <div className="text-xs text-anthrazit-400 mt-1">{ws.description}</div>}
                      </div>
                      <div className="text-sm text-brand-600 font-medium ml-4 shrink-0">
                        ~{Math.round(ws.distanceKm)} km
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Fahrzeugdaten */}
        {step === 2 && (
          <div className="card space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-anthrazit-900">Fahrzeugdaten (optional)</h2>
              <span className="text-xs text-anthrazit-400">Hilft der Werkstatt bei der Vorbereitung</span>
            </div>

            <div>
              <label className="label">Inseratslink</label>
              <input type="url" className="input-field" placeholder="https://www.mobile.de/..."
                value={form.listingUrl} onChange={e => setForm({ ...form, listingUrl: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Marke</label>
                <input type="text" className="input-field" placeholder="z.B. BMW"
                  value={form.make} onChange={e => setForm({ ...form, make: e.target.value })} />
              </div>
              <div>
                <label className="label">Modell</label>
                <input type="text" className="input-field" placeholder="z.B. 3er"
                  value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} />
              </div>
              <div>
                <label className="label">Baujahr</label>
                <input type="number" className="input-field" placeholder="z.B. 2018"
                  value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} min="1990" max={new Date().getFullYear()} />
              </div>
              <div>
                <label className="label">Kilometerstand</label>
                <input type="number" className="input-field" placeholder="z.B. 85000"
                  value={form.mileage} onChange={e => setForm({ ...form, mileage: e.target.value })} />
              </div>
              <div>
                <label className="label">Angebotspreis (€)</label>
                <input type="number" className="input-field" placeholder="z.B. 12500"
                  value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              </div>
            </div>

            <div className="border-t border-anthrazit-100 pt-4">
              <h3 className="text-sm font-medium text-anthrazit-900 mb-3">Fahrzeugstandort *</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">PLZ des Fahrzeugs *</label>
                  <input type="text" className="input-field" placeholder="12345"
                    value={form.vehicleZip} onChange={e => setForm({ ...form, vehicleZip: e.target.value.replace(/\D/g, '').slice(0, 5) })}
                    required maxLength={5} />
                </div>
                <div>
                  <label className="label">Stadt</label>
                  <input type="text" className="input-field" placeholder="Berlin"
                    value={form.vehicleCity} onChange={e => setForm({ ...form, vehicleCity: e.target.value })} />
                </div>
              </div>
              <div className="mt-4">
                <label className="label">Adresse (optional)</label>
                <input type="text" className="input-field" placeholder="Musterstraße 1"
                  value={form.vehicleAddress} onChange={e => setForm({ ...form, vehicleAddress: e.target.value })} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Zurück</button>
              <button onClick={() => { if (!form.vehicleZip) { setError('Bitte PLZ des Fahrzeugs eingeben'); return; } setError(''); setStep(3) }} className="btn-primary flex-1">Weiter →</button>
            </div>
          </div>
        )}

        {/* STEP 3: Termin */}
        {step === 3 && (
          <div className="card space-y-4">
            <h2 className="font-semibold text-anthrazit-900 mb-2">Terminwunsch</h2>
            <p className="text-sm text-anthrazit-500">Gib bis zu 3 Wunschtermine an. Die Werkstatt bestätigt einen davon.</p>

            <div>
              <label className="label">1. Wunschtermin *</label>
              <input type="datetime-local" className="input-field" min={minDateStr}
                value={form.preferredDate1} onChange={e => setForm({ ...form, preferredDate1: e.target.value })} required />
            </div>
            <div>
              <label className="label">2. Wunschtermin (optional)</label>
              <input type="datetime-local" className="input-field" min={minDateStr}
                value={form.preferredDate2} onChange={e => setForm({ ...form, preferredDate2: e.target.value })} />
            </div>
            <div>
              <label className="label">3. Wunschtermin (optional)</label>
              <input type="datetime-local" className="input-field" min={minDateStr}
                value={form.preferredDate3} onChange={e => setForm({ ...form, preferredDate3: e.target.value })} />
            </div>

            <div>
              <label className="label">Hinweise für die Werkstatt</label>
              <textarea className="input-field h-24 resize-none" placeholder="Besonderheiten, Hinweise, Fragen..."
                value={form.customerNote} onChange={e => setForm({ ...form, customerNote: e.target.value })} />
            </div>

            {/* Zusammenfassung */}
            <div className="bg-brand-50 rounded-lg p-4 border border-brand-200">
              <h3 className="text-sm font-semibold text-brand-900 mb-2">Zusammenfassung</h3>
              <div className="text-sm text-brand-800 space-y-1">
                <div>🔧 <strong>Werkstatt:</strong> {selectedWorkshop?.name}, {selectedWorkshop?.city}</div>
                {form.make && <div>🚗 <strong>Fahrzeug:</strong> {form.make} {form.model} ({form.year})</div>}
                <div>💰 <strong>Preis:</strong> 118,00 € inkl. MwSt.</div>
                <div className="text-xs text-brand-600 mt-2">Zahlung erfolgt NACH Terminbestätigung durch die Werkstatt.</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1">← Zurück</button>
              <button onClick={submitOrder} disabled={loading || !form.preferredDate1} className="btn-primary flex-1">
                {loading ? 'Wird gesendet...' : '✓ Anfrage senden'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
