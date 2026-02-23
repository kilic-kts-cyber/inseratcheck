// app/werkstatt/checklist/[orderNumber]/page.tsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type TristateResult = 'GUT' | 'MITTEL' | 'SCHLECHT' | null

function ResultSelect({ label, value, onChange }: { label: string; value: TristateResult; onChange: (v: TristateResult) => void }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex gap-2">
        {(['GUT', 'MITTEL', 'SCHLECHT'] as const).map(opt => (
          <button key={opt} type="button" onClick={() => onChange(opt === value ? null : opt)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${
              value === opt
                ? opt === 'GUT' ? 'bg-green-500 border-green-500 text-white'
                  : opt === 'MITTEL' ? 'bg-yellow-500 border-yellow-500 text-white'
                  : 'bg-red-500 border-red-500 text-white'
                : 'border-anthrazit-200 text-anthrazit-600 hover:border-anthrazit-300'
            }`}>
            {opt === 'GUT' ? '✓ Gut' : opt === 'MITTEL' ? '⚠ Mittel' : '✗ Schlecht'}
          </button>
        ))}
      </div>
    </div>
  )
}

function YesNoSelect({ label, value, onChange, invertColors = false }: { label: string; value: boolean | null; onChange: (v: boolean | null) => void; invertColors?: boolean }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex gap-2">
        <button type="button" onClick={() => onChange(value === false ? null : false)}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${
            value === false
              ? invertColors ? 'bg-red-500 border-red-500 text-white' : 'bg-green-500 border-green-500 text-white'
              : 'border-anthrazit-200 text-anthrazit-600 hover:border-anthrazit-300'
          }`}>
          Nein
        </button>
        <button type="button" onClick={() => onChange(value === true ? null : true)}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${
            value === true
              ? invertColors ? 'bg-green-500 border-green-500 text-white' : 'bg-red-500 border-red-500 text-white'
              : 'border-anthrazit-200 text-anthrazit-600 hover:border-anthrazit-300'
          }`}>
          Ja
        </button>
      </div>
    </div>
  )
}

export default function ChecklistPage({ params }: { params: { orderNumber: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    // Fahrzeugdaten
    vinConfirmed: '',
    mileageConfirmed: '',
    firstRegistration: '',
    // OBD
    obdErrors: null as boolean | null,
    obdNote: '',
    // Bremsen
    brakeFrontStatus: null as TristateResult,
    brakeRearStatus: null as TristateResult,
    brakeFluidOk: null as boolean | null,
    brakeNote: '',
    // Reifen
    tireFrontDepth: '',
    tireRearDepth: '',
    tireFrontDot: '',
    tireRearDot: '',
    tireUneven: null as boolean | null,
    tireNote: '',
    // Fahrwerk
    suspensionNoises: null as boolean | null,
    steeringPlay: null as boolean | null,
    suspensionNote: '',
    // Motorraum
    engineLeaks: null as boolean | null,
    engineNote: '',
    // Karosserie
    paintValues: '',
    accidentSuspect: null as boolean | null,
    bodyNote: '',
    // HU/AU
    huValid: '',
    huNote: '',
    // Probefahrt
    testDriveIssues: null as boolean | null,
    testDriveNote: '',
    // Gesamturteil
    overallResult: null as TristateResult,
    overallComment: '',
  })

  useEffect(() => {
    fetch(`/api/orders/${params.orderNumber}/checklist`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data.checklist) {
          const c = d.data.checklist
          setForm(prev => ({
            ...prev,
            vinConfirmed: c.vinConfirmed || '',
            mileageConfirmed: c.mileageConfirmed?.toString() || '',
            firstRegistration: c.firstRegistration ? c.firstRegistration.slice(0, 10) : '',
            obdErrors: c.obdErrors ?? null,
            obdNote: c.obdNote || '',
            brakeFrontStatus: c.brakeFrontStatus || null,
            brakeRearStatus: c.brakeRearStatus || null,
            brakeFluidOk: c.brakeFluidOk ?? null,
            brakeNote: c.brakeNote || '',
            tireFrontDepth: c.tireFrontDepth?.toString() || '',
            tireRearDepth: c.tireRearDepth?.toString() || '',
            tireFrontDot: c.tireFrontDot || '',
            tireRearDot: c.tireRearDot || '',
            tireUneven: c.tireUneven ?? null,
            tireNote: c.tireNote || '',
            suspensionNoises: c.suspensionNoises ?? null,
            steeringPlay: c.steeringPlay ?? null,
            suspensionNote: c.suspensionNote || '',
            engineLeaks: c.engineLeaks ?? null,
            engineNote: c.engineNote || '',
            paintValues: c.paintValues || '',
            accidentSuspect: c.accidentSuspect ?? null,
            bodyNote: c.bodyNote || '',
            huValid: c.huValid ? c.huValid.slice(0, 10) : '',
            huNote: c.huNote || '',
            testDriveIssues: c.testDriveIssues ?? null,
            testDriveNote: c.testDriveNote || '',
            overallResult: c.overallResult || null,
            overallComment: c.overallComment || '',
          }))
        }
      })
      .finally(() => setLoading(false))
  }, [params.orderNumber])

  async function saveChecklist(complete = false) {
    setError('')
    setSaving(true)
    try {
      const res = await fetch(`/api/orders/${params.orderNumber}/checklist`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          mileageConfirmed: form.mileageConfirmed ? parseInt(form.mileageConfirmed) : undefined,
          tireFrontDepth: form.tireFrontDepth ? parseFloat(form.tireFrontDepth) : undefined,
          tireRearDepth: form.tireRearDepth ? parseFloat(form.tireRearDepth) : undefined,
          firstRegistration: form.firstRegistration ? form.firstRegistration : undefined,
          huValid: form.huValid ? form.huValid : undefined,
          completedAt: complete ? new Date().toISOString() : undefined,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Speichern fehlgeschlagen')
        return
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      if (complete) router.push(`/werkstatt/orders/${params.orderNumber}`)
    } catch {
      setError('Netzwerkfehler')
    } finally {
      setSaving(false)
    }
  }

  const u = (field: string) => (val: unknown) => setForm(prev => ({ ...prev, [field]: val }))
  const t = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  if (loading) return <div className="min-h-screen bg-anthrazit-50 flex items-center justify-center"><div className="text-anthrazit-500">Lädt...</div></div>

  return (
    <div className="min-h-screen bg-anthrazit-50 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-anthrazit-100 shadow-sm">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
          <div>
            <Link href={`/werkstatt/orders/${params.orderNumber}`} className="text-xs text-anthrazit-500 hover:text-anthrazit-700">
              ← {params.orderNumber}
            </Link>
            <div className="text-sm font-semibold text-anthrazit-900">Prüfcheckliste</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => saveChecklist(false)} disabled={saving}
              className="btn-secondary text-xs py-1.5 px-3">
              {saving ? '...' : saved ? '✓ Gespeichert' : 'Zwischenspeichern'}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        {error && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

        {/* 1. Fahrzeugdaten */}
        <section className="card space-y-4">
          <h2 className="font-semibold text-anthrazit-900 text-base flex items-center gap-2">
            <span className="bg-brand-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shrink-0">1</span>
            Fahrzeugdaten
          </h2>
          <div>
            <label className="label">VIN / Fahrgestellnummer <span className="text-red-500">*</span></label>
            <input type="text" className="input-field font-mono uppercase" placeholder="WBA..." maxLength={17}
              value={form.vinConfirmed} onChange={t('vinConfirmed')} />
            <p className="text-xs text-anthrazit-400 mt-1">Pflicht: VIN-Foto hochladen (Upload im nächsten Schritt)</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Km-Stand (bestätigt)</label>
              <input type="number" className="input-field" placeholder="z.B. 85432"
                value={form.mileageConfirmed} onChange={t('mileageConfirmed')} />
            </div>
            <div>
              <label className="label">Erstzulassung</label>
              <input type="date" className="input-field" value={form.firstRegistration} onChange={t('firstRegistration')} />
            </div>
          </div>
        </section>

        {/* 2. OBD */}
        <section className="card space-y-3">
          <h2 className="font-semibold text-anthrazit-900 flex items-center gap-2">
            <span className="bg-brand-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shrink-0">2</span>
            OBD-Diagnose
          </h2>
          <YesNoSelect label="Fehlerspeicher vorhanden?" value={form.obdErrors} onChange={u('obdErrors') as (v: boolean | null) => void} invertColors={false} />
          <div>
            <label className="label">Hinweise / Fehlercodes</label>
            <textarea className="input-field h-20 resize-none" placeholder="z.B. P0300 Zündaussetzer..."
              value={form.obdNote} onChange={t('obdNote')} />
          </div>
        </section>

        {/* 3. Bremsen */}
        <section className="card space-y-3">
          <h2 className="font-semibold text-anthrazit-900 flex items-center gap-2">
            <span className="bg-brand-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shrink-0">3</span>
            Bremsen
          </h2>
          <ResultSelect label="Bremsen vorne" value={form.brakeFrontStatus} onChange={u('brakeFrontStatus') as (v: TristateResult) => void} />
          <ResultSelect label="Bremsen hinten" value={form.brakeRearStatus} onChange={u('brakeRearStatus') as (v: TristateResult) => void} />
          <YesNoSelect label="Bremsflüssigkeit OK?" value={form.brakeFluidOk} onChange={u('brakeFluidOk') as (v: boolean | null) => void} invertColors={true} />
          <div>
            <label className="label">Hinweise Bremsen</label>
            <textarea className="input-field h-16 resize-none" placeholder="Auffälligkeiten..."
              value={form.brakeNote} onChange={t('brakeNote')} />
          </div>
        </section>

        {/* 4. Reifen */}
        <section className="card space-y-3">
          <h2 className="font-semibold text-anthrazit-900 flex items-center gap-2">
            <span className="bg-brand-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shrink-0">4</span>
            Reifen
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Profil vorne (mm)</label>
              <input type="number" step="0.1" className="input-field" placeholder="z.B. 4.5"
                value={form.tireFrontDepth} onChange={t('tireFrontDepth')} />
            </div>
            <div>
              <label className="label">Profil hinten (mm)</label>
              <input type="number" step="0.1" className="input-field" placeholder="z.B. 3.2"
                value={form.tireRearDepth} onChange={t('tireRearDepth')} />
            </div>
            <div>
              <label className="label">DOT vorne</label>
              <input type="text" className="input-field" placeholder="z.B. 2421"
                value={form.tireFrontDot} onChange={t('tireFrontDot')} />
            </div>
            <div>
              <label className="label">DOT hinten</label>
              <input type="text" className="input-field" placeholder="z.B. 1919"
                value={form.tireRearDot} onChange={t('tireRearDot')} />
            </div>
          </div>
          <YesNoSelect label="Ungleichmäßiger Verschleiß?" value={form.tireUneven} onChange={u('tireUneven') as (v: boolean | null) => void} />
          <div>
            <label className="label">Hinweise Reifen</label>
            <textarea className="input-field h-16 resize-none" value={form.tireNote} onChange={t('tireNote')} />
          </div>
        </section>

        {/* 5. Fahrwerk */}
        <section className="card space-y-3">
          <h2 className="font-semibold text-anthrazit-900 flex items-center gap-2">
            <span className="bg-brand-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shrink-0">5</span>
            Fahrwerk & Lenkung
          </h2>
          <YesNoSelect label="Geräusche Fahrwerk?" value={form.suspensionNoises} onChange={u('suspensionNoises') as (v: boolean | null) => void} />
          <YesNoSelect label="Lenkungsspiel auffällig?" value={form.steeringPlay} onChange={u('steeringPlay') as (v: boolean | null) => void} />
          <div>
            <label className="label">Hinweise Fahrwerk/Lenkung</label>
            <textarea className="input-field h-16 resize-none" value={form.suspensionNote} onChange={t('suspensionNote')} />
          </div>
        </section>

        {/* 6. Motorraum */}
        <section className="card space-y-3">
          <h2 className="font-semibold text-anthrazit-900 flex items-center gap-2">
            <span className="bg-brand-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shrink-0">6</span>
            Motorraum
          </h2>
          <YesNoSelect label="Ölverlust / Lecks sichtbar?" value={form.engineLeaks} onChange={u('engineLeaks') as (v: boolean | null) => void} />
          <div>
            <label className="label">Hinweise Motorraum</label>
            <textarea className="input-field h-16 resize-none" value={form.engineNote} onChange={t('engineNote')} />
          </div>
        </section>

        {/* 7. Karosserie */}
        <section className="card space-y-3">
          <h2 className="font-semibold text-anthrazit-900 flex items-center gap-2">
            <span className="bg-brand-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shrink-0">7</span>
            Karosserie & Lack
          </h2>
          <div>
            <label className="label">Lackschichtdicken (µm, manuell eingeben)</label>
            <input type="text" className="input-field" placeholder='{"fl": 90, "fr": 95, "rl": 88, "rr": 92, "dach": 85}'
              value={form.paintValues} onChange={t('paintValues')} />
            <p className="text-xs text-anthrazit-400 mt-1">Format: Frontlinks, Frontrechts, Hinterlinks, Hinterrechts, Dach</p>
          </div>
          <YesNoSelect label="Unfalschäden-Verdacht?" value={form.accidentSuspect} onChange={u('accidentSuspect') as (v: boolean | null) => void} />
          <div>
            <label className="label">Hinweise Karosserie</label>
            <textarea className="input-field h-16 resize-none" value={form.bodyNote} onChange={t('bodyNote')} />
          </div>
        </section>

        {/* 8. HU/AU */}
        <section className="card space-y-3">
          <h2 className="font-semibold text-anthrazit-900 flex items-center gap-2">
            <span className="bg-brand-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shrink-0">8</span>
            HU / AU
          </h2>
          <div>
            <label className="label">HU gültig bis</label>
            <input type="date" className="input-field" value={form.huValid} onChange={t('huValid')} />
          </div>
          <div>
            <label className="label">Hinweise</label>
            <textarea className="input-field h-16 resize-none" value={form.huNote} onChange={t('huNote')} />
          </div>
        </section>

        {/* 9. Probefahrt */}
        <section className="card space-y-3">
          <h2 className="font-semibold text-anthrazit-900 flex items-center gap-2">
            <span className="bg-brand-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shrink-0">9</span>
            Probefahrt
          </h2>
          <YesNoSelect label="Auffälligkeiten bei Probefahrt?" value={form.testDriveIssues} onChange={u('testDriveIssues') as (v: boolean | null) => void} />
          <div>
            <label className="label">Beschreibung</label>
            <textarea className="input-field h-20 resize-none" placeholder="Geräusche, Vibrationen, Schaltverhalten..."
              value={form.testDriveNote} onChange={t('testDriveNote')} />
          </div>
        </section>

        {/* 10. Gesamturteil */}
        <section className="card space-y-4 border-brand-300 bg-brand-50">
          <h2 className="font-semibold text-brand-900 flex items-center gap-2 text-base">
            <span className="bg-brand-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shrink-0">10</span>
            Gesamturteil <span className="text-red-500">*</span>
          </h2>
          <ResultSelect label="Gesamtzustand" value={form.overallResult} onChange={u('overallResult') as (v: TristateResult) => void} />
          <div>
            <label className="label">Kommentar / Empfehlung</label>
            <textarea className="input-field h-24 resize-none" placeholder="Zusammenfassung für den Kunden..."
              value={form.overallComment} onChange={t('overallComment')} />
          </div>
        </section>

        {/* Fotos Upload Hinweis */}
        <div className="card bg-yellow-50 border-yellow-200">
          <h3 className="font-semibold text-yellow-900 mb-2">📸 Pflichtfotos</h3>
          <p className="text-sm text-yellow-800 mb-3">
            Bitte lade mindestens das VIN-Foto hoch. Weitere Fotos (Tacho, Bremsen, Karosserie) sind empfohlen.
          </p>
          <p className="text-xs text-yellow-700">
            Upload-Funktion: Nutze die Auftrag-Detailseite zum Hochladen von Fotos (Kategorien: VIN, Tacho, Bremsen, OBD, Karosserie, HU).
          </p>
        </div>

        {/* Aktionen */}
        <div className="flex flex-col gap-3">
          <button onClick={() => saveChecklist(false)} disabled={saving} className="btn-secondary py-3 text-base">
            {saving ? 'Speichert...' : '💾 Zwischenspeichern'}
          </button>
          <button
            onClick={() => {
              if (!form.vinConfirmed) { setError('VIN ist Pflichtfeld'); return }
              if (!form.overallResult) { setError('Bitte Gesamturteil auswählen'); return }
              saveChecklist(true)
            }}
            disabled={saving || !form.overallResult || !form.vinConfirmed}
            className="btn-primary py-3 text-base"
          >
            {saving ? 'Wird gespeichert...' : '✓ Checkliste abschließen'}
          </button>
        </div>
      </div>
    </div>
  )
}
