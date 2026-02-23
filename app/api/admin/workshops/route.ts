// app/api/admin/workshops/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, handleError } from '@/lib/api'

export async function GET(_req: NextRequest) {
  try {
    await requireAuth(['ADMIN'])

    const workshops = await prisma.workshop.findMany({
      include: {
        user: { select: { email: true, name: true, createdAt: true } },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return ok({ workshops })
  } catch (error) {
    return handleError(error)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAuth(['ADMIN'])
    const { id, isActive, isVerified } = await req.json()

    const workshop = await prisma.workshop.update({
      where: { id },
      data: { isActive, isVerified },
    })

    return ok({ workshop })
  } catch (error) {
    return handleError(error)
  }
}
