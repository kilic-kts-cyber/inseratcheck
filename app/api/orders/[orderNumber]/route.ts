// app/api/orders/[orderNumber]/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, notFound, forbidden, handleError } from '@/lib/api'
import { sendOrderConfirmationToCustomer, sendReportReady } from '@/lib/email'

export async function GET(
  req: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const session = await requireAuth()

    const order = await prisma.order.findUnique({
      where: { orderNumber: params.orderNumber },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true, street: true, zip: true, city: true } },
        workshop: { select: { id: true, name: true, street: true, city: true, zip: true, phone: true, user: { select: { email: true } } } },
        checklist: { include: { uploads: true } },
        uploads: true,
        messages: { orderBy: { createdAt: 'asc' } },
      },
    })

    if (!order) return notFound('Auftrag')

    // Zugriffscheck
    if (session.role === 'KUNDE' && order.customerId !== session.id) return forbidden()
    if (session.role === 'WERKSTATT') {
      const workshop = await prisma.workshop.findUnique({ where: { userId: session.id } })
      if (!workshop || order.workshopId !== workshop.id) return forbidden()
    }

    return ok({ order })
  } catch (error) {
    return handleError(error)
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const session = await requireAuth()
    const body = await req.json()
    const { action, confirmedDate, workshopNote } = body

    const order = await prisma.order.findUnique({
      where: { orderNumber: params.orderNumber },
      include: {
        customer: true,
        workshop: { include: { user: true } },
      },
    })

    if (!order) return notFound('Auftrag')

    // Werkstatt: Termin bestätigen oder ablehnen
    if (session.role === 'WERKSTATT') {
      const workshop = await prisma.workshop.findUnique({ where: { userId: session.id } })
      if (!workshop || order.workshopId !== workshop.id) return forbidden()

      if (action === 'CONFIRM') {
        const updated = await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'CONFIRMED',
            confirmedDate: new Date(confirmedDate),
            workshopNote,
          },
        })

        // Kunde benachrichtigen
        sendOrderConfirmationToCustomer(
          order.customer.email,
          order.customer.name || '',
          order.orderNumber,
          workshop.name,
          new Date(confirmedDate)
        ).catch(console.error)

        return ok({ order: updated })
      }

      if (action === 'REJECT') {
        const updated = await prisma.order.update({
          where: { id: order.id },
          data: { status: 'REJECTED', workshopNote },
        })
        return ok({ order: updated })
      }

      if (action === 'START') {
        const updated = await prisma.order.update({
          where: { id: order.id },
          data: { status: 'IN_PROGRESS' },
        })
        return ok({ order: updated })
      }

      if (action === 'COMPLETE') {
        const checklist = await prisma.checklist.findUnique({ where: { orderId: order.id } })
        if (!checklist?.overallResult) {
          return handleError(new Error('Checkliste muss zuerst ausgefüllt werden'))
        }

        const updated = await prisma.order.update({
          where: { id: order.id },
          data: { status: 'COMPLETED' },
        })

        // Historien-Datenbank Eintrag
        await prisma.vehicleHistory.create({
          data: {
            vin: checklist.vinConfirmed || order.vin || '',
            orderId: order.id,
            checkedAt: new Date(),
            mileage: checklist.mileageConfirmed || order.mileage,
            overallResult: checklist.overallResult,
            make: order.make,
            model: order.model,
            year: order.year,
            workshopCity: order.workshop?.city,
          },
        })

        // Kunden benachrichtigen
        sendReportReady(
          order.customer.email,
          order.customer.name || '',
          order.orderNumber,
          checklist.overallResult
        ).catch(console.error)

        return ok({ order: updated })
      }
    }

    // Admin: Status ändern
    if (session.role === 'ADMIN') {
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: body,
      })
      return ok({ order: updated })
    }

    return forbidden()
  } catch (error) {
    return handleError(error)
  }
}
