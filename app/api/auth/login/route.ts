// app/api/auth/login/route.ts
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createToken } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/api'
import { logAudit } from '@/lib/audit'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = LoginSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { email: data.email } })
    
    if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
      return err('E-Mail oder Passwort falsch', 401)
    }

    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    logAudit('LOGIN', 'User', user.id, user.id).catch(() => {})

    const response = ok({
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    })

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    return handleError(error)
  }
}
