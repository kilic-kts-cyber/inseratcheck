// app/auth/register/page.tsx
'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') === 'werkstatt' ? 'WERKSTATT' : 'KUNDE'

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: defaultRole,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.passwordConfirm) {
      setError('Passwörter stimmen nicht überein')
      return
    }
    if (form.password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen haben')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: form.role }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registrierung fehlgeschlagen')
        return
      }

      const { role } = data.data.user
      router.push(role === 'WERKSTATT' ? '/werkstatt/dashboard' : '/dashboard')
      router.refresh()
    } catch {
      setError('Netzwerkfehler – bitte versuche es erneut')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-anthrazit-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-brand-600 flex items-center justify-center">
              <span className="text-base font-bold text-white">IC</span>
            </div>
            <span className="text-xl font-bold text-anthrazit-900">InseratCheck</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-anthrazit-900">Konto erstellen</h1>
          <p className="mt-2 text-sm text-anthrazit-500">Kostenlos und unverbindlich</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Rolle wählen */}
          <div className="mb-5">
            <label className="label">Ich bin ein...</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'KUNDE', label: '🚗 Käufer', sub: 'Fahrzeug prüfen lassen' },
                { value: 'WERKSTATT', label: '🔧 Werkstatt', sub: 'Aufträge annehmen' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: opt.value })}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    form.role === opt.value
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-anthrazit-200 hover:border-anthrazit-300'
                  }`}
                >
                  <div className="font-medium text-sm text-anthrazit-900">{opt.label}</div>
                  <div className="text-xs text-anthrazit-500 mt-0.5">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Vor- und Nachname</label>
              <input type="text" className="input-field" placeholder="Max Mustermann"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">E-Mail-Adresse</label>
              <input type="email" className="input-field" placeholder="deine@email.de"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Passwort</label>
              <input type="password" className="input-field" placeholder="Mindestens 8 Zeichen"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div>
              <label className="label">Passwort bestätigen</label>
              <input type="password" className="input-field" placeholder="Passwort wiederholen"
                value={form.passwordConfirm} onChange={e => setForm({ ...form, passwordConfirm: e.target.value })} required />
            </div>

            <p className="text-xs text-anthrazit-400 leading-relaxed">
              Mit der Registrierung stimmst du unseren{' '}
              <Link href="/agb" className="text-brand-600 hover:underline">AGB</Link> und der{' '}
              <Link href="/datenschutz" className="text-brand-600 hover:underline">Datenschutzerklärung</Link> zu.
            </p>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? 'Registrierung läuft...' : 'Kostenlos registrieren'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-anthrazit-500">
              Bereits registriert?{' '}
              <Link href="/auth/login" className="text-brand-600 font-medium hover:text-brand-700">Anmelden</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>
}
