// app/api/orders/[orderNumber]/checklist/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, handleError, notFound, forbidden } from '@/lib/api'

export async function GET(
  req: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const session = await requireAuth()
    const order = await prisma.order.findUnique({
      where: { orderNumber: params.orderNumber },
      include: { checklist: { include: { uploads: true } } },
    })
    if (!order) return notFound('Auftrag')

    // Zugriffscheck
    if (session.role === 'WERKSTATT') {
      const ws = await prisma.workshop.findUnique({ where: { userId: session.id } })
      if (!ws || order.workshopId !== ws.id) return forbidden()
    } else if (session.role === 'KUNDE' && order.customerId !== session.id) {
      return forbidden()
    }

    return ok({ checklist: order.checklist })
  } catch (error) {
    return handleError(error)
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const session = await requireAuth(['WERKSTATT'])
    const body = await req.json()

    const order = await prisma.order.findUnique({
      where: { orderNumber: params.orderNumber },
    })
    if (!order) return notFound('Auftrag')

    const ws = await prisma.workshop.findUnique({ where: { userId: session.id } })
    if (!ws || order.workshopId !== ws.id) return forbidden()

    // Filtere nur Checklisten-Felder
    const {
      vinConfirmed, mileageConfirmed, firstRegistration,
      obdErrors, obdNote,
      brakeFrontStatus, brakeRearStatus, brakeFluidOk, brakeNote,
      tireFrontDepth, tireRearDepth, tireFrontDot, tireRearDot, tireUneven, tireNote,
      suspensionNoises, steeringPlay, suspensionNote,
      engineLeaks, engineNote,
      paintValues, accidentSuspect, bodyNote,
      huValid, huNote,
      testDriveIssues, testDriveNote,
      overallResult, overallComment,
      completedAt,
    } = body

    const checklist = await prisma.checklist.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        vinConfirmed, mileageConfirmed,
        firstRegistration: firstRegistration ? new Date(firstRegistration) : undefined,
        obdErrors, obdNote,
        brakeFrontStatus, brakeRearStatus, brakeFluidOk, brakeNote,
        tireFrontDepth, tireRearDepth, tireFrontDot, tireRearDot, tireUneven, tireNote,
        suspensionNoises, steeringPlay, suspensionNote,
        engineLeaks, engineNote,
        paintValues, accidentSuspect, bodyNote,
        huValid: huValid ? new Date(huValid) : undefined,
        huNote,
        testDriveIssues, testDriveNote,
        overallResult, overallComment,
        completedAt: completedAt ? new Date(completedAt) : undefined,
      },
      update: {
        vinConfirmed, mileageConfirmed,
        firstRegistration: firstRegistration ? new Date(firstRegistration) : undefined,
        obdErrors, obdNote,
        brakeFrontStatus, brakeRearStatus, brakeFluidOk, brakeNote,
        tireFrontDepth, tireRearDepth, tireFrontDot, tireRearDot, tireUneven, tireNote,
        suspensionNoises, steeringPlay, suspensionNote,
        engineLeaks, engineNote,
        paintValues, accidentSuspect, bodyNote,
        huValid: huValid ? new Date(huValid) : undefined,
        huNote,
        testDriveIssues, testDriveNote,
        overallResult, overallComment,
        completedAt: completedAt ? new Date(completedAt) : undefined,
      },
    })

    return ok({ checklist })
  } catch (error) {
    return handleError(error)
  }
}
