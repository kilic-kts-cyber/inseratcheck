// app/api/admin/stats/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, handleError } from '@/lib/api'

export async function GET(_req: NextRequest) {
  try {
    await requireAuth(['ADMIN'])

    const [
      totalOrders, totalUsers, totalWorkshops, activeWorkshops,
      pendingOrders, completedOrders, totalRevenue,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: 'KUNDE' } }),
      prisma.workshop.count(),
      prisma.workshop.count({ where: { isActive: true } }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
      prisma.order.aggregate({
        where: { paidAt: { not: null } },
        _sum: { totalAmount: true },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, email: true } },
          workshop: { select: { name: true, city: true } },
        },
      }),
    ])

    return ok({
      stats: {
        totalOrders,
        totalUsers,
        totalWorkshops,
        activeWorkshops,
        pendingOrders,
        completedOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
      },
      recentOrders,
    })
  } catch (error) {
    return handleError(error)
  }
}
