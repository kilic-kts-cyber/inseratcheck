// app/api/paypal/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPaymentConfirmation } from '@/lib/email'
import { logAudit } from '@/lib/audit'

const PAYPAL_API =
  process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  return data.access_token
}

async function verifyWebhookSignature(
  req: NextRequest,
  rawBody: string
): Promise<boolean> {
  try {
    const token = await getAccessToken()

    const payload = {
      auth_algo:         req.headers.get('paypal-auth-algo') || '',
      cert_url:          req.headers.get('paypal-cert-url') || '',
      transmission_id:   req.headers.get('paypal-transmission-id') || '',
      transmission_sig:  req.headers.get('paypal-transmission-sig') || '',
      transmission_time: req.headers.get('paypal-transmission-time') || '',
      webhook_id:        process.env.PAYPAL_WEBHOOK_ID || '',
      webhook_event:     JSON.parse(rawBody),
    }

    const res = await fetch(
      `${PAYPAL_API}/v1/notifications/verify-webhook-signature`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )

    const result = await res.json()
    return result.verification_status === 'SUCCESS'
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  let rawBody: string
  try {
    rawBody = await req.text()
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  // Signatur prüfen (überspringen wenn PAYPAL_WEBHOOK_ID nicht gesetzt – Dev-Modus)
  if (process.env.PAYPAL_WEBHOOK_ID) {
    const valid = await verifyWebhookSignature(req, rawBody)
    if (!valid) {
      logAudit('WEBHOOK_INVALID_SIGNATURE', 'PayPal', undefined).catch(() => {})
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  let event: { event_type: string; resource: Record<string, unknown> }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  logAudit('WEBHOOK_RECEIVED', 'PayPal', event.event_type).catch(() => {})

  switch (event.event_type) {
    case 'CHECKOUT.ORDER.APPROVED': {
      // Zahlung genehmigt, aber noch nicht captured – optionaler Hinweis
      const paypalOrderId = (event.resource as { id?: string }).id
      if (paypalOrderId) {
        await prisma.order.updateMany({
          where: { paypalOrderId, status: 'CONFIRMED' },
          data: { status: 'CONFIRMED' }, // bleibt CONFIRMED bis capture
        })
      }
      break
    }

    case 'PAYMENT.CAPTURE.COMPLETED': {
      const capture = event.resource as {
        id?: string
        supplementary_data?: { related_ids?: { order_id?: string } }
        amount?: { value?: string }
        payer?: { payer_id?: string }
      }

      const paypalOrderId = capture.supplementary_data?.related_ids?.order_id
      if (!paypalOrderId) break

      const order = await prisma.order.findFirst({
        where: { paypalOrderId },
        include: { customer: true },
      })

      if (!order) break

      // Idempotenz: bereits bezahlt → ignorieren
      if (order.paidAt) break

      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          paypalPayerId: capture.payer?.payer_id || '',
          paidAt: new Date(),
        },
      })

      logAudit('PAYMENT_CAPTURED', 'Order', order.id).catch(() => {})

      sendPaymentConfirmation(
        order.customer.email,
        order.customer.name || '',
        order.orderNumber,
        order.totalAmount
      ).catch(console.error)

      break
    }

    case 'PAYMENT.CAPTURE.DENIED':
    case 'PAYMENT.CAPTURE.REVERSED': {
      const capture = event.resource as {
        supplementary_data?: { related_ids?: { order_id?: string } }
      }
      const paypalOrderId = capture.supplementary_data?.related_ids?.order_id
      if (!paypalOrderId) break

      await prisma.order.updateMany({
        where: { paypalOrderId, status: { in: ['PAID', 'CONFIRMED'] } },
        data: { status: 'CANCELLED', paidAt: null },
      })

      logAudit('PAYMENT_DENIED_OR_REVERSED', 'Order', paypalOrderId).catch(() => {})
      break
    }

    case 'CHECKOUT.ORDER.CANCELLED': {
      const resource = event.resource as { id?: string }
      if (resource.id) {
        await prisma.order.updateMany({
          where: { paypalOrderId: resource.id, status: 'CONFIRMED' },
          data: { status: 'CANCELLED' },
        })
      }
      break
    }

    default:
      // Unbekannte Events ignorieren – trotzdem 200 zurückgeben
      break
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
