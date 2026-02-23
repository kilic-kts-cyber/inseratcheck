// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword, createToken } from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/email'
import { ok, err, handleError } from '@/lib/api'

const RegisterSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen haben'),
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen haben'),
  role: z.enum(['KUNDE', 'WERKSTATT']).optional().default('KUNDE'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = RegisterSchema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) return err('E-Mail-Adresse bereits registriert', 409)

    const passwordHash = await hashPassword(data.password)

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        role: data.role,
      },
    })

    // Werkstatt-Profil anlegen wenn Werkstatt-Registrierung
    if (data.role === 'WERKSTATT') {
      await prisma.workshop.create({
        data: {
          userId: user.id,
          name: data.name,
          street: '',
          zip: '',
          city: '',
          isActive: false,
        },
      })
    }

    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    // Willkommens-E-Mail (nicht-blockierend)
    sendWelcomeEmail(user.email, user.name || '').catch(console.error)

    const response = ok({ 
      user: { id: user.id, email: user.email, name: user.name, role: user.role } 
    }, 201)
    
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 Tage
      path: '/',
    })

    return response
  } catch (error) {
    return handleError(error)
  }
}
