// lib/paypal.ts
const PAYPAL_API = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID!
  const secret = process.env.PAYPAL_CLIENT_SECRET!
  const credentials = Buffer.from(`${clientId}:${secret}`).toString('base64')

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await res.json()
  if (!res.ok) throw new Error(`PayPal Auth Error: ${data.error_description}`)
  return data.access_token
}

export async function createPayPalOrder(
  orderNumber: string,
  amount: number // in Cent
): Promise<{ id: string; approveUrl: string }> {
  const token = await getAccessToken()
  const amountStr = (amount / 100).toFixed(2)

  const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `IC-${orderNumber}-${Date.now()}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: orderNumber,
        description: `InseratCheck Werkstattprüfung – ${orderNumber}`,
        amount: {
          currency_code: 'EUR',
          value: amountStr,
        },
      }],
      application_context: {
        brand_name: 'InseratCheck',
        locale: 'de-DE',
        landing_page: 'BILLING',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/${orderNumber}/payment-success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/${orderNumber}`,
      },
    }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(`PayPal Order Error: ${JSON.stringify(data)}`)

  const approveLink = data.links.find((l: { rel: string; href: string }) => l.rel === 'approve')
  return { id: data.id, approveUrl: approveLink.href }
}

export async function capturePayPalOrder(paypalOrderId: string): Promise<{
  status: string
  payerId: string
  amount: string
  transactionId: string
}> {
  const token = await getAccessToken()

  const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  const data = await res.json()
  if (!res.ok) throw new Error(`PayPal Capture Error: ${JSON.stringify(data)}`)

  const capture = data.purchase_units[0].payments.captures[0]
  return {
    status: data.status,
    payerId: data.payer?.payer_id || '',
    amount: capture.amount.value,
    transactionId: capture.id,
  }
}

export async function verifyPayPalOrder(paypalOrderId: string): Promise<boolean> {
  try {
    const token = await getAccessToken()
    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${paypalOrderId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const data = await res.json()
    return data.status === 'COMPLETED'
  } catch {
    return false
  }
}
