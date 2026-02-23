// lib/report-data.ts
import { prisma } from '@/lib/prisma'

export async function getReportData(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      workshop: { select: { id: true, name: true, street: true, zip: true, city: true, phone: true } },
      checklist: true,
      uploads: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })
}

export type ReportData = NonNullable<Awaited<ReturnType<typeof getReportData>>>
