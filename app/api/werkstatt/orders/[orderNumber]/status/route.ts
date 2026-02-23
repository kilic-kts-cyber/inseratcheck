// app/api/werkstatt/orders/[orderNumber]/status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, err, forbidden, notFound, handleError } from '@/lib/api'
import { logAudit } from '@/lib/audit'
import type { Checklist, OrderStatus } from '@prisma/client'

// ─── Allowed state machine ────────────────────────────────────────────────────
const ALLOWED_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus>> = {
  PAID:        'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
}

// ─── Checklist required-field validation ─────────────────────────────────────
interface GateError { code: string; message: string }

function validateChecklist(checklist: Checklist | null): GateError[] {
  const errors: GateError[] = []

  if (!checklist) {
    errors.push({
      code:    'checklist_incomplete',
      message: 'Checkliste wurde noch nicht ausgefüllt',
    })
    return errors // alle weiteren checks wären null-refs
  }

  if (!checklist.vinConfirmed || checklist.vinConfirmed.trim() === '') {
    errors.push({
      code:    'checklist_incomplete',
      message: 'Pflichtfeld fehlt: vinConfirmed',
    })
  }

  if (!checklist.overallResult) {
    errors.push({
      code:    'checklist_incomplete',
      message: 'Pflichtfeld fehlt: overallResult (Gesamturteil)',
    })
  }

  if (!checklist.brakeFrontStatus) {
    errors.push({
      code:    'checklist_incomplete',
      message: 'Pflichtfeld fehlt: brakeFrontStatus (Bremsen vorne)',
    })
  }

  if (!checklist.brakeRearStatus) {
    errors.push({
      code:    'checklist_incomplete',
      message: 'Pflichtfeld fehlt: brakeRearStatus (Bremsen hinten)',
    })
  }

  if (checklist.obdErrors === null || checklist.obdErrors === undefined) {
    errors.push({
      code:    'checklist_incomplete',
      message: 'Pflichtfeld fehlt: obdErrors (OBD-Diagnose)',
    })
  }

  if (checklist.engineLeaks === null || checklist.engineLeaks === undefined) {
    errors.push({
      code:    'checklist_incomplete',
      message: 'Pflichtfeld fehlt: engineLeaks (Motorraum)',
    })
  }

  return errors
}

// ─── Route ────────────────────────────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const session = await requireAuth(['WERKSTATT'])

    const body = await req.json() as { targetStatus?: OrderStatus }
    const { targetStatus } = body
    if (!targetStatus) return err('targetStatus fehlt', 400)

    // Werkstatt verifizieren
    const workshop = await prisma.workshop.findUnique({
      where: { userId: session.id },
    })
    if (!workshop) return forbidden()

    // Order + Checkliste laden (Uploads werden separat gezählt)
    const order = await prisma.order.findUnique({
      where:   { orderNumber: params.orderNumber },
      include: { checklist: true },
    })

    if (!order)                           return notFound('Auftrag')
    if (order.workshopId !== workshop.id) return forbidden()

    // State-machine: transition erlaubt?
    const allowedTarget = ALLOWED_TRANSITIONS[order.status]

    if (allowedTarget !== targetStatus) {
      logAudit(
        'STATUS_TRANSITION_INVALID', 'Order', order.id, session.id,
        JSON.stringify({ from: order.status, to: targetStatus })
      ).catch(() => {})

      return err(
        `Übergang "${order.status}" → "${targetStatus}" nicht erlaubt.` +
        (allowedTarget ? ` Erlaubt: "${order.status}" → "${allowedTarget}"` : ' Keine weiteren Übergänge.'),
        400
      )
    }

    // ── IN_PROGRESS gate ──────────────────────────────────────────────────────
    if (targetStatus === 'IN_PROGRESS') {
      // ALLOWED_TRANSITIONS garantiert order.status === 'PAID' — kein weiterer Check nötig
      const updated = await prisma.order.update({
        where: { id: order.id },
        data:  { status: 'IN_PROGRESS' },
      })
      logAudit('STATUS_IN_PROGRESS', 'Order', order.id, session.id).catch(() => {})
      return ok({ order: updated })
    }

    // ── COMPLETED gate ────────────────────────────────────────────────────────
    if (targetStatus === 'COMPLETED') {
      const errors: GateError[] = []

      // Gate 1: status muss IN_PROGRESS sein
      //   (ALLOWED_TRANSITIONS stellt das sicher, aber explizit für Klarheit)
      if (order.status !== 'IN_PROGRESS') {
        return NextResponse.json(
          {
            success: false,
            error: { codes: ['invalid_status'], errors: [{
              code:    'invalid_status',
              message: `Status muss "IN_PROGRESS" sein, ist aber "${order.status}"`,
            }]},
          },
          { status: 400 }
        )
      }

      // Gate 2: order.vin gesetzt und nicht leer
      const orderVin = order.vin?.trim() ?? ''
      if (!orderVin) {
        errors.push({
          code:    'missing_vin',
          message: 'order.vin ist nicht gesetzt — VIN muss am Auftrag hinterlegt sein',
        })
      }

      // Gate 3: Checkliste Pflichtfelder
      for (const e of validateChecklist(order.checklist)) {
        errors.push(e)
      }

      // Gate 4: checklist.vinConfirmed muss exakt === order.vin sein
      //   (nur prüfen wenn beide vorhanden — fehlende VIN ist bereits Gate 2/3)
      if (orderVin && order.checklist?.vinConfirmed) {
        const checklistVin = order.checklist.vinConfirmed.trim()
        if (checklistVin !== orderVin) {
          errors.push({
            code:    'vin_mismatch',
            message: `VIN stimmt nicht überein — Auftrag: "${orderVin}", Checkliste: "${checklistVin}"`,
          })
        }
      }

      // Gate 5: mindestens 1 Upload mit uploadType === VIN_PHOTO (direkt aus DB gezählt)
      const vinPhotoCount = await prisma.upload.count({
        where: { orderId: order.id, uploadType: 'VIN_PHOTO' },
      })
      if (vinPhotoCount === 0) {
        errors.push({
          code:    'missing_vin_photo',
          message: 'Mindestens ein VIN-Foto (uploadType: VIN_PHOTO) muss hochgeladen sein',
        })
      }

      // Alle Fehler auf einmal zurückgeben
      if (errors.length > 0) {
        logAudit(
          'COMPLETION_GATE_FAILED', 'Order', order.id, session.id,
          JSON.stringify(errors.map(e => e.code))
        ).catch(() => {})

        return NextResponse.json(
          {
            success: false,
            error: {
              codes:  errors.map(e => e.code),
              errors,
            },
          },
          { status: 400 }
        )
      }

      // ── Alle 5 Gates bestanden ─────────────────────────────────────────────

      const updated = await prisma.order.update({
        where: { id: order.id },
        data:  { status: 'COMPLETED' },
      })

      logAudit('STATUS_COMPLETED', 'Order', order.id, session.id).catch(() => {})

      // Historien-Eintrag upsert
      await prisma.vehicleHistory.upsert({
        where:  { orderId: order.id },
        update: {
          vin:           orderVin,
          workshopId:    workshop.id,
          checkedAt:     new Date(),
          mileage:       order.checklist!.mileageConfirmed ?? order.mileage ?? undefined,
          overallResult: order.checklist!.overallResult!,
          make:          order.make  ?? undefined,
          model:         order.model ?? undefined,
          year:          order.year  ?? undefined,
          workshopCity:  workshop.city,
        },
        create: {
          vin:           orderVin,
          orderId:       order.id,
          workshopId:    workshop.id,
          checkedAt:     new Date(),
          mileage:       order.checklist!.mileageConfirmed ?? order.mileage ?? undefined,
          overallResult: order.checklist!.overallResult!,
          make:          order.make  ?? undefined,
          model:         order.model ?? undefined,
          year:          order.year  ?? undefined,
          workshopCity:  workshop.city,
        },
      })

      logAudit('HISTORY_RECORD_UPSERTED', 'VehicleHistory', orderVin, session.id).catch(() => {})

      return ok({ order: updated })
    }

    return err(`Unbekannter targetStatus: "${targetStatus}"`, 400)

  } catch (error) {
    return handleError(error)
  }
}
