// app/api/paypal/create-order/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createPayPalOrder } from '@/lib/paypal'
import { ok, handleError, notFound, forbidden, err } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(['KUNDE'])
    const { orderNumber } = await req.json()

    const order = await prisma.order.findUnique({ where: { orderNumber } })
    if (!order) return notFound('Auftrag')
    if (order.customerId !== session.id) return forbidden()
    if (order.status !== 'CONFIRMED') return err('Auftrag muss zuerst von der Werkstatt bestätigt werden')
    if (order.paidAt) return err('Auftrag bereits bezahlt')

    const paypal = await createPayPalOrder(orderNumber, order.totalAmount)

    await prisma.order.update({
      where: { id: order.id },
      data: { paypalOrderId: paypal.id },
    })

    return ok({ paypalOrderId: paypal.id, approveUrl: paypal.approveUrl })
  } catch (error) {
    return handleError(error)
  }
}
