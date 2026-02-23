// lib/api.ts
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function err(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export function unauthorized() {
  return err('Nicht angemeldet', 401)
}

export function forbidden() {
  return err('Keine Berechtigung', 403)
}

export function notFound(resource = 'Ressource') {
  return err(`${resource} nicht gefunden`, 404)
}

export function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return err(error.errors.map(e => e.message).join(', '), 422)
  }
  if (error instanceof Error) {
    if (error.message === 'UNAUTHORIZED') return unauthorized()
    if (error.message === 'FORBIDDEN') return forbidden()
    console.error('[API Error]', error.message)
    return err(error.message)
  }
  return err('Interner Serverfehler', 500)
}

export function getIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || 'unknown'
}
