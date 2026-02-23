// app/auth/login/page.tsx
'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Metadata } from 'next'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Anmeldung fehlgeschlagen')
        return
      }

      const { role } = data.data.user
      const dest = role === 'WERKSTATT' ? '/werkstatt/dashboard' : role === 'ADMIN' ? '/admin/dashboard' : redirect
      router.push(dest)
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
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-brand-600 flex items-center justify-center">
              <span className="text-base font-bold text-white">IC</span>
            </div>
            <span className="text-xl font-bold text-anthrazit-900">InseratCheck</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-anthrazit-900">Willkommen zurück</h1>
          <p className="mt-2 text-sm text-anthrazit-500">Melde dich an, um fortzufahren</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">E-Mail-Adresse</label>
              <input
                type="email"
                className="input-field"
                placeholder="deine@email.de"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Passwort</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? 'Anmeldung läuft...' : 'Anmelden'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-anthrazit-500">
              Noch kein Konto?{' '}
              <Link href="/auth/register" className="text-brand-600 font-medium hover:text-brand-700">
                Kostenlos registrieren
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
