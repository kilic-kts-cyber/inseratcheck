// app/werkstatt/dashboard/page.tsx
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Werkstatt-Dashboard' }

export default async function WerkstattDashboard() {
  const session = await getSession()
  if (!session) redirect('/auth/login')
  if (session.role !== 'WERKSTATT') redirect('/dashboard')

  const workshop = await prisma.workshop.findUnique({
    where: { userId: session.id },
    include: {
      orders: {
        include: {
          customer: { select: { name: true, email: true } },
          checklist: { select: { overallResult: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  })

  if (!workshop) redirect('/werkstatt/profile')

  const orders = workshop.orders
  const stats = {
    new: orders.filter(o => o.status === 'PENDING').length,
    confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
    active: orders.filter(o => ['PAID', 'IN_PROGRESS'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
  }

  function StatusBadge({ status }: { status: string }) {
    const map: Record<string, [string, string]> = {
      PENDING:     ['badge-pending', 'Neu'],
      CONFIRMED:   ['badge-confirmed', 'Bestätigt'],
      PAID:        ['badge-paid', 'Bezahlt'],
      IN_PROGRESS: ['badge-progress', 'In Arbeit'],
      COMPLETED:   ['badge-completed', 'Fertig'],
      REJECTED:    ['badge-rejected', 'Abgelehnt'],
    }
    const [cls, label] = map[status] || ['badge', status]
    return <span className={cls}>{label}</span>
  }

  return (
    <div className="min-h-screen bg-anthrazit-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-anthrazit-900">
              {workshop.name}
            </h1>
            <p className="text-anthrazit-500 mt-1">
              {workshop.isActive
                ? '✅ Aktiv – du empfängst Anfragen'
                : '⚠️ Noch nicht freigeschaltet – warte auf Admin-Freigabe'}
            </p>
          </div>
          <Link href="/werkstatt/profile" className="btn-secondary text-sm">
            ⚙ Profil bearbeiten
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Neue Anfragen', value: stats.new, color: 'text-yellow-600', href: '#pending' },
            { label: 'Bestätigt', value: stats.confirmed, color: 'text-blue-600', href: '#confirmed' },
            { label: 'Aktive Aufträge', value: stats.active, color: 'text-brand-600', href: '#active' },
            { label: 'Abgeschlossen', value: stats.completed, color: 'text-green-600', href: '#done' },
          ].map(s => (
            <a key={s.label} href={s.href} className="card text-center hover:shadow-md transition-shadow">
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-anthrazit-500 mt-1">{s.label}</div>
            </a>
          ))}
        </div>

        {/* Neue Anfragen */}
        {stats.new > 0 && (
          <div id="pending" className="card mb-6 border-yellow-300 bg-yellow-50">
            <h2 className="font-semibold text-anthrazit-900 mb-4">
              🔔 Neue Anfragen ({stats.new})
            </h2>
            <div className="space-y-3">
              {orders.filter(o => o.status === 'PENDING').map(order => (
                <Link
                  key={order.id}
                  href={`/werkstatt/orders/${order.orderNumber}`}
                  className="flex items-center justify-between bg-white rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div>
                    <div className="font-medium text-anthrazit-900 text-sm">{order.orderNumber}</div>
                    <div className="text-xs text-anthrazit-500 mt-0.5">
                      {order.make && order.model ? `${order.make} ${order.model}` : 'Unbekanntes Fahrzeug'}
                      {' · '}{order.customer.name || order.customer.email}
                    </div>
                    <div className="text-xs text-anthrazit-400 mt-0.5">
                      PLZ {order.vehicleZip} · 
                      Wunsch: {new Date(order.preferredDate1!).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={order.status} />
                    <span className="text-anthrazit-300">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Alle Aufträge */}
        <div id="active" className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-anthrazit-100">
            <h2 className="font-semibold text-anthrazit-900">Alle Aufträge</h2>
          </div>
          {orders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-anthrazit-500 text-sm">
                {workshop.isActive
                  ? 'Noch keine Anfragen. Kunden in deiner Nähe werden dich finden.'
                  : 'Dein Profil wird gerade geprüft. Bald gehst du online!'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-anthrazit-100">
              {orders.map(order => (
                <Link
                  key={order.id}
                  href={`/werkstatt/orders/${order.orderNumber}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-anthrazit-50 transition-colors"
                >
                  <div>
                    <div className="font-medium text-anthrazit-900 text-sm">{order.orderNumber}</div>
                    <div className="text-xs text-anthrazit-500 mt-0.5">
                      {order.make && order.model ? `${order.make} ${order.model}` : 'Fahrzeug unbekannt'}
                      {' · '}{order.customer.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    {order.checklist?.overallResult && (
                      <span className="text-xs font-medium text-anthrazit-500">
                        {order.checklist.overallResult}
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
