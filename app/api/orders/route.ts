// app/api/orders/route.ts
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth, generateOrderNumber } from '@/lib/auth'
import { ok, handleError, forbidden } from '@/lib/api'
import { sendNewOrderToWorkshop } from '@/lib/email'

const CreateOrderSchema = z.object({
  workshopId: z.string(),
  listingUrl: z.string().url().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().optional(),
  mileage: z.number().int().optional(),
  price: z.number().int().optional(),
  vehicleZip: z.string().min(5).max(5),
  vehicleCity: z.string().optional(),
  vehicleAddress: z.string().optional(),
  preferredDate1: z.string().datetime(),
  preferredDate2: z.string().datetime().optional(),
  preferredDate3: z.string().datetime().optional(),
  customerNote: z.string().max(1000).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(['KUNDE'])
    const body = await req.json()
    const data = CreateOrderSchema.parse(body)

    const workshop = await prisma.workshop.findUnique({
      where: { id: data.workshopId, isActive: true },
      include: { user: true },
    })
    if (!workshop) return handleError(new Error('Werkstatt nicht gefunden'))

    const orderNumber = generateOrderNumber()

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: session.id,
        workshopId: data.workshopId,
        listingUrl: data.listingUrl,
        make: data.make,
        model: data.model,
        year: data.year,
        mileage: data.mileage,
        price: data.price ? data.price * 100 : undefined,
        vehicleZip: data.vehicleZip,
        vehicleCity: data.vehicleCity,
        vehicleAddress: data.vehicleAddress,
        preferredDate1: new Date(data.preferredDate1),
        preferredDate2: data.preferredDate2 ? new Date(data.preferredDate2) : undefined,
        preferredDate3: data.preferredDate3 ? new Date(data.preferredDate3) : undefined,
        customerNote: data.customerNote,
        status: 'PENDING',
      },
    })

    // Werkstatt benachrichtigen
    const vehicleInfo = [data.make, data.model, data.year].filter(Boolean).join(' ') || 'Unbekannt'
    sendNewOrderToWorkshop(
      workshop.user.email,
      workshop.name,
      orderNumber,
      session.name || session.email,
      vehicleInfo,
      data.vehicleZip
    ).catch(console.error)

    return ok({ order }, 201)
  } catch (error) {
    return handleError(error)
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 10
    const skip = (page - 1) * limit

    let where: Record<string, unknown> = {}
    
    if (session.role === 'KUNDE') {
      where = { customerId: session.id }
    } else if (session.role === 'WERKSTATT') {
      const workshop = await prisma.workshop.findUnique({ where: { userId: session.id } })
      if (!workshop) return forbidden()
      where = { workshopId: workshop.id }
    }
    // Admin sieht alle

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { name: true, email: true } },
          workshop: { select: { name: true, city: true } },
          checklist: { select: { overallResult: true, completedAt: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return ok({ orders, total, page, pages: Math.ceil(total / limit) })
  } catch (error) {
    return handleError(error)
  }
}
