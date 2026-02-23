export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { cookies as nextCookies } from 'next/headers'
import { getSessionFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  const { orderNumber } = params
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!

  const { default: puppeteer } = await import('puppeteer')
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | undefined

  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Zugriff: Admin | Customer des Auftrags | Werkstatt des Auftrags
    const order = await prisma.order.findUnique({
      where:  { orderNumber },
      select: { customerId: true, workshopId: true },   // ← customerId, nicht userId
    })

    if (!order) {
      return new NextResponse('Not found', { status: 404 })
    }

    let allowed = session.role === 'ADMIN'                    // session.role, nicht session.user.role

    if (!allowed && order.customerId === session.id) {        // session.id, nicht session.user.id
      allowed = true
    }

    if (!allowed && session.role === 'WERKSTATT') {
      const ws = await prisma.workshop.findUnique({
        where:  { userId: session.id },
        select: { id: true },
      })
      if (ws?.id === order.workshopId) allowed = true
    }

    if (!allowed) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    })

    const page = await browser.newPage()

    const cookieStore = nextCookies()
    const domain = new URL(baseUrl).hostname
    const cookieArray = cookieStore.getAll().map(c => ({
      name:   c.name,
      value:  c.value,
      domain,
      path:   '/',
    }))
    if (cookieArray.length) await page.setCookie(...cookieArray)

    await page.goto(`${baseUrl}/report/${orderNumber}`, {
      waitUntil: 'networkidle0',
      timeout:   30_000,
    })
    await page.evaluate(() => document.fonts.ready)

    const pdf = await page.pdf({
      format:          'A4',
      printBackground: true,
    })

    return new NextResponse(pdf, {
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="InseratCheck_Report_${orderNumber}.pdf"`,
        'Content-Length':      pdf.byteLength.toString(),
        'Cache-Control':       'private, no-store',
      },
    })

  } catch (error: unknown) {
    console.error('[report.pdf]', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    await browser?.close()
  }
}
