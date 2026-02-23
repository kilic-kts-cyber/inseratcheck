// app/dashboard/orders/[orderNumber]/PayPalButton.tsx
'use client'
import { useState } from 'react'

interface PayPalButtonProps {
  orderNumber: string
  paypalOrderId: string | null
}

export function PayPalButton({ orderNumber, paypalOrderId: existingPaypalOrderId }: PayPalButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePayPal() {
    setError('')
    setLoading(true)
    try {
      // PayPal Order erstellen oder vorhandene verwenden
      let paypalId = existingPaypalOrderId

      if (!paypalId) {
        const res = await fetch('/api/paypal/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderNumber }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'PayPal konnte nicht gestartet werden')
          return
        }
        // Direkt zu PayPal weiterleiten
        window.location.href = data.data.approveUrl
        return
      }

      // Falls schon eine PayPal-Order existiert, direkt zum Capture
      window.location.href = `/dashboard/orders/${orderNumber}/payment-success?paypalOrderId=${paypalId}`
    } catch {
      setError('Fehler beim Starten der Zahlung')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      <button
        onClick={handlePayPal}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-[#FFC43A] px-5 py-2.5 font-bold text-[#003087] hover:bg-[#f0b429] transition-colors disabled:opacity-50"
      >
        {loading ? (
          <span>Weiterleitung...</span>
        ) : (
          <>
            <svg className="h-5" viewBox="0 0 101 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.8 2H4.8C4.2 2 3.7 2.4 3.6 3L0.5 21.1c-.1.4.2.8.6.8h4c.5 0 1-.4 1.1-.9l.7-4.7c.1-.5.5-.9 1.1-.9h2.6c5.4 0 8.5-2.6 9.3-7.7.4-2.2 0-4-1-5.2C17.5 2.5 15.4 2 12.8 2zm.9 7.6c-.4 2.9-2.6 2.9-4.7 2.9h-1.2l.8-5.2c.1-.3.4-.6.7-.6H9.7c1.4 0 2.8 0 3.5.8.4.5.5 1.2.5 2.1z" fill="#003087"/>
              <path d="M35.5 9.5h-4c-.3 0-.6.2-.7.6l-.2 1.1-.3-.4c-.9-1.3-2.8-1.7-4.8-1.7-4.5 0-8.4 3.4-9.1 8.2-.4 2.4.2 4.7 1.5 6.3 1.2 1.5 3 2.1 5.1 2.1 3.6 0 5.6-2.3 5.6-2.3l-.2 1.1c-.1.4.2.8.6.8h3.6c.5 0 1-.4 1.1-.9l2.2-13.7c.1-.5-.2-.9-.6-.9l-.8.7zm-5.5 7.9c-.4 2.3-2.3 3.9-4.6 3.9-1.2 0-2.1-.4-2.7-1.1-.6-.7-.8-1.8-.6-2.9.4-2.3 2.3-3.9 4.6-3.9 1.1 0 2 .4 2.6 1.1.7.8.9 1.8.7 2.9z" fill="#003087"/>
              <path d="M56.5 9.5h-4c-.4 0-.8.2-1 .5L46.1 19l-2.3-8.6c-.1-.5-.6-.9-1.1-.9H38.7c-.5 0-.8.4-.7.9l4.4 12.9-4.1 5.8c-.3.4 0 1 .5 1h4c.4 0 .8-.2 1-.5L57 10.5c.3-.4 0-1-.5-1z" fill="#003087"/>
            </svg>
            Mit PayPal bezahlen
          </>
        )}
      </button>
    </div>
  )
}
