// lib/audit.ts
import { prisma } from './prisma'

export async function logAudit(
  action: string,
  resource: string,
  resourceId?: string,
  userId?: string,
  ip?: string
) {
  try {
    await prisma.auditLog.create({
      data: { action, resource, resourceId, userId, ip }
    })
  } catch {
    // Logging-Fehler dürfen App nicht blockieren
    console.error('[Audit] Logging fehlgeschlagen', { action, resource })
  }
}
