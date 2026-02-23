// app/admin/workshops/page.tsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Workshop {
  id: string; name: string; city: string; zip: string;
  isActive: boolean; isVerified: boolean;
  user: { email: string; createdAt: string }
  _count: { orders: number }
}

const ADMIN_NAV = [
  { href: '/admin/dashboard', label: '📊 Dashboard' },
  { href: '/admin/workshops', label: '🔧 Werkstätten' },
  { href: '/admin/orders', label: '📋 Aufträge' },
  { href: '/admin/users', label: '👥 Nutzer' },
]

export default function AdminWorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/workshops').then(r => r.json())
      .then(d => d.success && setWorkshops(d.data.workshops))
      .finally(() => setLoading(false))
  }, [])

  async function toggleStatus(id: string, field: 'isActive' | 'isVerified', current: boolean) {
    setUpdating(id)
    await fetch('/api/admin/workshops', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, [field]: !current }),
    })
    setWorkshops(prev => prev.map(ws => ws.id === id ? { ...ws, [field]: !current } : ws))
    setUpdating(null)
  }

  return (
    <div className="min-h-screen bg-anthrazit-50">
      <div className="bg-anthrazit-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center gap-6 text-sm overflow-x-auto">
            <span className="font-bold text-brand-400 whitespace-nowrap">Admin</span>
            {ADMIN_NAV.map(l => <Link key={l.href} href={l.href} className="text-anthrazit-300 hover:text-white whitespace-nowrap">{l.label}</Link>)}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-anthrazit-900">Werkstätten verwalten</h1>
          <p className="text-anthrazit-500 mt-1">{workshops.length} gesamt · {workshops.filter(w => w.isActive).length} aktiv · {workshops.filter(w => !w.isActive).length} warten auf Freigabe</p>
        </div>

        {loading ? <div className="text-center py-12 text-anthrazit-500">Lädt...</div> : (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-anthrazit-100 bg-anthrazit-50">
                    {['Werkstatt', 'Standort', 'Aufträge', 'Registriert', 'Status', 'Aktionen'].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-anthrazit-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-anthrazit-100">
                  {workshops.map(ws => (
                    <tr key={ws.id} className="hover:bg-anthrazit-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-anthrazit-900">{ws.name}</div>
                        <div className="text-xs text-anthrazit-500">{ws.user.email}</div>
                      </td>
                      <td className="px-6 py-4 text-anthrazit-600">{ws.zip} {ws.city}</td>
                      <td className="px-6 py-4 font-medium text-anthrazit-900">{ws._count.orders}</td>
                      <td className="px-6 py-4 text-xs text-anthrazit-500">{new Date(ws.user.createdAt).toLocaleDateString('de-DE')}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5 flex-wrap">
                          <span className={`badge ${ws.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {ws.isActive ? 'Aktiv' : 'Inaktiv'}
                          </span>
                          {ws.isVerified && <span className="badge bg-blue-100 text-blue-700">✓ Verifiziert</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap">
                          <button onClick={() => toggleStatus(ws.id, 'isActive', ws.isActive)} disabled={updating === ws.id}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${ws.isActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                            {updating === ws.id ? '...' : ws.isActive ? 'Deaktivieren' : '✓ Freigeben'}
                          </button>
                          {!ws.isVerified && (
                            <button onClick={() => toggleStatus(ws.id, 'isVerified', ws.isVerified)} disabled={updating === ws.id}
                              className="text-xs px-3 py-1.5 rounded-lg font-medium bg-blue-100 text-blue-700 hover:bg-blue-200">
                              Verifizieren
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
