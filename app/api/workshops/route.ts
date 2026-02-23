// app/api/workshops/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, handleError } from '@/lib/api'
import { findNearbyWorkshops } from '@/lib/geo'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const zip = searchParams.get('zip')
    const radius = parseInt(searchParams.get('radius') || '100')

    const workshops = await prisma.workshop.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        street: true,
        zip: true,
        city: true,
        lat: true,
        lng: true,
        phone: true,
        website: true,
        description: true,
        openingHours: true,
        capacity: true,
        coverZips: true,
      },
    })

    if (!zip) {
      return ok({ workshops, total: workshops.length })
    }

    const nearby = findNearbyWorkshops(workshops, zip, radius)
    return ok({ workshops: nearby, total: nearby.length })
  } catch (error) {
    return handleError(error)
  }
}
