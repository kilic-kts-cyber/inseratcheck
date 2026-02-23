// app/admin/dashboard/page.tsx
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboard() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/auth/login')

  const [
    totalOrders, totalUsers, totalWorkshops, activeWorkshops,
    pendingOrders, completedOrders, paidOrders,
    recentOrders, pendingWorkshops
  ] = await Promise.all([
    prisma.order.count(),
    prisma.user.count({ where: { role: 'KUNDE' } }),
    prisma.workshop.count(),
    prisma.workshop.count({ where: { isActive: true } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'COMPLETED' } }),
    prisma.order.count({ where: { paidAt: { not: null } } }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, email: true } },
        workshop: { select: { name: true } },
      },
    }),
    prisma.workshop.findMany({
      where: { isActive: false },
      include: { user: { select: { email: true } } },
      take: 5,
    }),
  ])

  const revenueData = await prisma.order.aggregate({
    where: { paidAt: { not: null } },
    _sum: { totalAmount: true },
  })
  const totalRevenue = revenueData._sum.totalAmount || 0

  const statusColors: Record<string, string> = {
    PENDING:     'badge-pending',
    CONFIRMED:   'badge-confirmed',
    PAID:        'badge-paid',
    IN_PROGRESS: 'badge-progress',
    COMPLETED:   'badge-completed',
    CANCELLED:   'badge-cancelled',
    REJECTED:    'badge-rejected',
  }
  const statusLabels: Record<string, string> = {
    PENDING: 'Ausstehend', CONFIRMED: 'Bestätigt', PAID: 'Bezahlt',
    IN_PROGRESS: 'In Arbeit', COMPLETED: 'Fertig', CANCELLED: 'Storniert', REJECTED: 'Abgelehnt',
  }

  return (
    <div className="min-h-screen bg-anthrazit-50">
      {/* Admin Nav */}
      <div className="bg-anthrazit-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center gap-6 overflow-x-auto text-sm">
            <span className="font-bold text-brand-400 whitespace-nowrap">Admin</span>
            {[
              { href: '/admin/dashboard', label: '📊 Dashboard' },
              { href: '/admin/workshops', label: '🔧 Werkstätten' },
              { href: '/admin/orders', label: '📋 Aufträge' },
              { href: '/admin/users', label: '👥 Nutzer' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="whitespace-nowrap text-anthrazit-300 hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-anthrazit-900">Admin Dashboard</h1>
          <p className="text-anthrazit-500 mt-1">Übersicht aller Aktivitäten</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Gesamtumsatz', value: `${(totalRevenue / 100).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`, sub: `${paidOrders} bezahlte Aufträge`, color: 'text-green-600' },
            { label: 'Aufträge gesamt', value: totalOrders, sub: `${pendingOrders} ausstehend`, color: 'text-brand-600' },
            { label: 'Kunden', value: totalUsers, sub: 'registrierte Nutzer', color: 'text-purple-600' },
            { label: 'Werkstätten', value: `${activeWorkshops}/${totalWorkshops}`, sub: 'aktiv / gesamt', color: 'text-orange-600' },
          ].map(s => (
            <div key={s.label} className="card">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-sm font-medium text-anthrazit-900 mt-1">{s.label}</div>
              <div className="text-xs text-anthrazit-500 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Letzte Aufträge */}
          <div className="lg:col-span-2 card p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-anthrazit-100 flex justify-between items-center">
              <h2 className="font-semibold text-anthrazit-900">Letzte Aufträge</h2>
              <Link href="/admin/orders" className="text-sm text-brand-600 hover:text-brand-700">Alle →</Link>
            </div>
            <div className="divide-y divide-anthrazit-100">
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <div className="text-sm font-medium text-anthrazit-900">{order.orderNumber}</div>
                    <div className="text-xs text-anthrazit-500">
                      {order.customer.name || order.customer.email}
                      {order.workshop && ` · ${order.workshop.name}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-anthrazit-400">
                      {new Date(order.createdAt).toLocaleDateString('de-DE')}
                    </span>
                    <span className={statusColors[order.status] || 'badge'}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wartende Werkstätten */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-anthrazit-900">Freizugebende Werkstätten</h2>
              <Link href="/admin/workshops" className="text-xs text-brand-600">Alle →</Link>
            </div>
            {pendingWorkshops.length === 0 ? (
              <p className="text-sm text-anthrazit-400">Alle Werkstätten sind freigegeben ✓</p>
            ) : (
              <div className="space-y-3">
                {pendingWorkshops.map(ws => (
                  <div key={ws.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-anthrazit-900">{ws.name}</div>
                    <div className="text-xs text-anthrazit-500">{ws.city} · {ws.user.email}</div>
                    <Link href="/admin/workshops" className="text-xs text-brand-600 mt-1 inline-block">
                      Freigeben →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
