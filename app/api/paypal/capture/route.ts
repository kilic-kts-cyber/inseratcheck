// app/api/paypal/capture/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { capturePayPalOrder } from '@/lib/paypal'
import { ok, handleError, notFound, forbidden, err } from '@/lib/api'
import { sendPaymentConfirmation } from '@/lib/email'
import { logAudit } from '@/lib/audit'

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(['KUNDE'])
    const { paypalOrderId, orderNumber } = await req.json()

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { customer: true },
    })
    if (!order) return notFound('Auftrag')
    if (order.customerId !== session.id) return forbidden()
    if (order.paidAt) return err('Bereits bezahlt')
    if (order.paypalOrderId !== paypalOrderId) return err('PayPal-Referenz ungültig')

    const capture = await capturePayPalOrder(paypalOrderId)

    if (capture.status !== 'COMPLETED') {
      return err('Zahlung nicht abgeschlossen')
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'PAID',
        paypalPayerId: capture.payerId,
        paidAt: new Date(),
      },
    })

    logAudit('PAYMENT', 'Order', order.id, session.id).catch(() => {})

    sendPaymentConfirmation(
      order.customer.email,
      order.customer.name || '',
      orderNumber,
      order.totalAmount
    ).catch(console.error)

    return ok({ order: updated, transactionId: capture.transactionId })
  } catch (error) {
    return handleError(error)
  }
}
