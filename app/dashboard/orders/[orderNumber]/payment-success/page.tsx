// app/dashboard/orders/[orderNumber]/payment-success/page.tsx
'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function PaymentSuccessContent({ orderNumber }: { orderNumber: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const paypalOrderId = searchParams.get('token') || searchParams.get('paypalOrderId')
    if (!paypalOrderId) {
      setError('PayPal-Referenz fehlt')
      setStatus('error')
      return
    }

    fetch('/api/paypal/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paypalOrderId, orderNumber }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStatus('success')
          setTimeout(() => router.push(`/dashboard/orders/${orderNumber}`), 3000)
        } else {
          setError(data.error || 'Zahlung konnte nicht bestätigt werden')
          setStatus('error')
        }
      })
      .catch(() => {
        setError('Netzwerkfehler')
        setStatus('error')
      })
  }, [orderNumber, searchParams, router])

  if (status === 'loading') {
    return (
      <div className="text-center">
        <div className="h-12 w-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin mx-auto mb-4" />
        <p className="text-anthrazit-600">Zahlung wird bestätigt...</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-anthrazit-900 mb-2">Zahlung erfolgreich!</h1>
        <p className="text-anthrazit-500 mb-6">
          Deine Zahlung ist eingegangen. Die Werkstatt wird dich zur Prüfung kontaktieren.
          Du wirst in 3 Sekunden weitergeleitet...
        </p>
        <Link href={`/dashboard/orders/${orderNumber}`} className="btn-primary">
          Zum Auftrag →
        </Link>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="text-6xl mb-4">❌</div>
      <h1 className="text-2xl font-bold text-anthrazit-900 mb-2">Zahlung fehlgeschlagen</h1>
      <p className="text-anthrazit-500 mb-2">{error}</p>
      <p className="text-sm text-anthrazit-400 mb-6">Bitte versuche es erneut oder kontaktiere info@inseratcheck.de</p>
      <Link href={`/dashboard/orders/${orderNumber}`} className="btn-secondary">
        Zurück zum Auftrag
      </Link>
    </div>
  )
}

export default function PaymentSuccessPage({ params }: { params: { orderNumber: string } }) {
  return (
    <div className="min-h-screen bg-anthrazit-50 flex items-center justify-center py-12 px-4">
      <div className="card max-w-md w-full">
        <Suspense fallback={<div>Lädt...</div>}>
          <PaymentSuccessContent orderNumber={params.orderNumber} />
        </Suspense>
      </div>
    </div>
  )
}
