// app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: 'badge-pending',
    CONFIRMED: 'badge-confirmed',
    PAID: 'badge-paid',
    IN_PROGRESS: 'badge-progress',
    COMPLETED: 'badge-completed',
    CANCELLED: 'badge-cancelled',
    REJECTED: 'badge-rejected',
  }
  const labels: Record<string, string> = {
    PENDING: 'Ausstehend',
    CONFIRMED: 'Bestätigt',
    PAID: 'Bezahlt',
    IN_PROGRESS: 'In Bearbeitung',
    COMPLETED: 'Abgeschlossen',
    CANCELLED: 'Storniert',
    REJECTED: 'Abgelehnt',
  }
  return <span className={map[status] || 'badge'}>{labels[status] || status}</span>
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/auth/login')
  if (session.role === 'WERKSTATT') redirect('/werkstatt/dashboard')
  if (session.role === 'ADMIN') redirect('/admin/dashboard')

  const orders = await prisma.order.findMany({
    where: { customerId: session.id },
    include: {
      workshop: { select: { name: true, city: true } },
      checklist: { select: { overallResult: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  const stats = {
    total: orders.length,
    active: orders.filter(o => ['PENDING', 'CONFIRMED', 'PAID', 'IN_PROGRESS'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
  }

  return (
    <div className="min-h-screen bg-anthrazit-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-anthrazit-900">
            Hallo, {session.name?.split(' ')[0] || 'Willkommen'} 👋
          </h1>
          <p className="mt-1 text-anthrazit-500">Hier findest du alle deine Fahrzeugprüfungen.</p>
        </div>

        {/* Schnellaktionen */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Link href="/dashboard/check" className="card hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-brand-100 flex items-center justify-center group-hover:bg-brand-200 transition-colors">
                <span className="text-xl">🔍</span>
              </div>
              <div>
                <div className="font-semibold text-anthrazit-900">Inserat prüfen</div>
                <div className="text-sm text-anthrazit-500">Kostenlose Schnellprüfung</div>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/book" className="card hover:shadow-md transition-shadow group bg-brand-600 border-brand-600">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                <span className="text-xl">📅</span>
              </div>
              <div>
                <div className="font-semibold text-white">Werkstattcheck buchen</div>
                <div className="text-sm text-brand-200">Professionelle Prüfung – 118 €</div>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Aufträge gesamt', value: stats.total },
            { label: 'Aktive Aufträge', value: stats.active },
            { label: 'Abgeschlossen', value: stats.completed },
          ].map(s => (
            <div key={s.label} className="card text-center">
              <div className="text-2xl font-bold text-brand-600">{s.value}</div>
              <div className="text-xs text-anthrazit-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Aufträge */}
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-anthrazit-100 flex justify-between items-center">
            <h2 className="font-semibold text-anthrazit-900">Meine Aufträge</h2>
            <Link href="/dashboard/orders" className="text-sm text-brand-600 hover:text-brand-700">
              Alle ansehen →
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-anthrazit-500 text-sm">Noch keine Aufträge.</p>
              <Link href="/dashboard/book" className="btn-primary mt-4 inline-flex">
                Ersten Werkstattcheck buchen
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-anthrazit-100">
              {orders.map(order => (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.orderNumber}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-anthrazit-50 transition-colors"
                >
                  <div>
                    <div className="font-medium text-anthrazit-900 text-sm">{order.orderNumber}</div>
                    <div className="text-xs text-anthrazit-500 mt-0.5">
                      {order.make && order.model ? `${order.make} ${order.model}` : 'Fahrzeug unbekannt'}
                      {order.workshop && ` · ${order.workshop.name}, ${order.workshop.city}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    {order.checklist?.overallResult && (
                      <span className={`text-xs font-medium ${
                        order.checklist.overallResult === 'GUT' ? 'text-green-600' :
                        order.checklist.overallResult === 'MITTEL' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {order.checklist.overallResult === 'GUT' ? '✓ Gut' :
                         order.checklist.overallResult === 'MITTEL' ? '⚠ Mittel' : '✗ Schlecht'}
                      </span>
                    )}
                    <span className="text-anthrazit-300">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
