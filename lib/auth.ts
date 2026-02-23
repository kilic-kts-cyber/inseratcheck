// lib/auth.ts
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import type { Role } from '@prisma/client'

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'fallback-secret-change-in-production'
)

export interface SessionUser {
  id: string
  email: string
  name: string | null
  role: Role
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createToken(user: SessionUser): Promise<string> {
  return new SignJWT({ 
    sub: user.id, 
    email: user.email, 
    name: user.name, 
    role: user.role 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return {
      id: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string | null,
      role: payload.role as Role,
    }
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function getSessionFromRequest(req: NextRequest): Promise<SessionUser | null> {
  const token = req.cookies.get('session')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function requireAuth(roles?: Role[]): Promise<SessionUser> {
  const session = await getSession()
  if (!session) throw new Error('UNAUTHORIZED')
  if (roles && !roles.includes(session.role)) throw new Error('FORBIDDEN')
  return session
}

export function generateOrderNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `IC-${year}${month}-${random}`
}
