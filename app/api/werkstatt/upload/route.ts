// app/api/werkstatt/upload/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { uploadFile } from '@/lib/upload'
import { ok, err, forbidden, handleError } from '@/lib/api'
import type { UploadType } from '@prisma/client'

const ALLOWED_TYPES: UploadType[] = [
  'VIN_PHOTO',
  'ODOMETER',
  'OBD_SCREENSHOT',
  'BRAKE_FRONT',
  'BRAKE_REAR',
  'BODY',
  'HU_STICKER',
  'OTHER',
]

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(['WERKSTATT'])

    const formData   = await req.formData()
    const file       = formData.get('file') as File | null
    const orderNumber = formData.get('orderNumber') as string | null
    const uploadTypeRaw = (formData.get('uploadType') as string | null)?.toUpperCase() as UploadType | null
    const checklistId = formData.get('checklistId') as string | null

    if (!file)        return err('Keine Datei übermittelt')
    if (!orderNumber) return err('orderNumber fehlt')

    const uploadType: UploadType =
      uploadTypeRaw && ALLOWED_TYPES.includes(uploadTypeRaw)
        ? uploadTypeRaw
        : 'OTHER'

    // Werkstatt-Zugehörigkeit prüfen
    const workshop = await prisma.workshop.findUnique({ where: { userId: session.id } })
    if (!workshop) return forbidden()

    const order = await prisma.order.findUnique({
      where:   { orderNumber },
      include: { checklist: { select: { id: true, vinConfirmed: true } } },
    })

    if (!order)                           return err('Auftrag nicht gefunden', 404)
    if (order.workshopId !== workshop.id) return forbidden()

    // Gate: VIN_PHOTO darf nur hochgeladen werden wenn VIN bereits erfasst ist
    if (uploadType === 'VIN_PHOTO') {
      const vinOnOrder    = order.vin?.trim()
      const vinOnChecklist = order.checklist?.vinConfirmed?.trim()

      if (!vinOnOrder && !vinOnChecklist) {
        return err(
          'VIN-Foto kann erst hochgeladen werden, wenn die VIN in der Checkliste eingetragen ist',
          400
        )
      }
    }

    // Datei speichern
    const { filename, path: filePath, url } = await uploadFile(
      file,
      order.id,
      uploadType
    )

    const upload = await prisma.upload.create({
      data: {
        orderId:      order.id,
        checklistId:  checklistId ?? undefined,
        uploadedBy:   session.id,
        filename,
        originalName: file.name,
        mimeType:     file.type,
        size:         file.size,
        uploadType,
        path:         filePath,
      },
    })

    return ok({ upload: { ...upload, url } }, 201)
  } catch (error) {
    return handleError(error)
  }
}
