// app/api/upload/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { uploadFile } from '@/lib/upload'
import { ok, handleError, forbidden, err } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    const formData = await req.formData()

    const file = formData.get('file') as File
    const orderNumber = formData.get('orderNumber') as string
    const category = (formData.get('category') as string) || 'OTHER'
    const checklistId = formData.get('checklistId') as string | null

    if (!file || !orderNumber) return err('Datei und Auftragsnummer erforderlich')

    const order = await prisma.order.findUnique({ where: { orderNumber } })
    if (!order) return err('Auftrag nicht gefunden', 404)

    // Zugriffscheck
    if (session.role === 'KUNDE' && order.customerId !== session.id) return forbidden()
    if (session.role === 'WERKSTATT') {
      const ws = await prisma.workshop.findUnique({ where: { userId: session.id } })
      if (!ws || order.workshopId !== ws.id) return forbidden()
    }

    const { filename, path: filePath, url } = await uploadFile(file, order.id, category)

    const upload = await prisma.upload.create({
      data: {
        orderId: order.id,
        checklistId: checklistId || undefined,
        uploadedBy: session.id,
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        category,
        path: filePath,
      },
    })

    return ok({ upload: { ...upload, url } }, 201)
  } catch (error) {
    return handleError(error)
  }
}
