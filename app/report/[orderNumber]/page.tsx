// app/report/[orderNumber]/page.tsx
// Server Component – A4-formatierter Report-View (auch Basis für Puppeteer PDF)
import { notFound } from 'next/navigation'
import { getReportData } from '@/lib/report-data'
import { getSession } from '@/lib/auth'

const RESULT_COLOR: Record<string, string> = {
  GUT: '#16a34a', MITTEL: '#d97706', SCHLECHT: '#dc2626',
}
const RESULT_BG: Record<string, string> = {
  GUT: '#f0fdf4', MITTEL: '#fffbeb', SCHLECHT: '#fef2f2',
}
const RESULT_BORDER: Record<string, string> = {
  GUT: '#bbf7d0', MITTEL: '#fde68a', SCHLECHT: '#fecaca',
}
const RESULT_ICON: Record<string, string> = {
  GUT: '✅', MITTEL: '⚠️', SCHLECHT: '❌',
}

function bool(v: boolean | null | undefined): string {
  if (v === null || v === undefined) return '–'
  return v ? 'Ja' : 'Nein'
}

function boolColor(v: boolean | null | undefined, invertGood = false): string {
  if (v === null || v === undefined) return '#9ca3af'
  const isGood = invertGood ? !v : v
  return isGood ? '#16a34a' : '#dc2626'
}

export default async function ReportPage({ params }: { params: { orderNumber: string } }) {
  const order = await getReportData(params.orderNumber)
  if (!order) notFound()

  // Auth: Kunde, zugehörige Werkstatt, oder Admin
  const session = await getSession()
  if (!session) notFound()

  const isOwner    = order.customerId === session.id
  const isWorkshop = order.workshop?.userId === session.id
  const isAdmin    = session.role === 'ADMIN'
  if (!isOwner && !isWorkshop && !isAdmin) notFound()

  const cl = order.checklist
  const vinPhotos = order.uploads.filter(u => u.uploadType === 'VIN_PHOTO')
  const otherUploads = order.uploads.filter(u => u.uploadType !== 'VIN_PHOTO')

  const vehicleLabel = [order.make, order.model, order.year].filter(Boolean).join(' ') || 'Unbekannt'
  const checkedAt = cl?.completedAt
    ? new Date(cl.completedAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <html lang="de">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>InseratCheck Prüfbericht – {order.orderNumber}</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; color: #1a1a2e; background: #f8f8f8; }
          .page { width: 210mm; min-height: 297mm; margin: 0 auto; background: white; padding: 16mm 16mm 12mm; }
          @media print {
            body { background: white; }
            .page { width: 100%; margin: 0; padding: 12mm 14mm; box-shadow: none; }
            .no-print { display: none !important; }
          }
          @media screen { .page { box-shadow: 0 4px 32px rgba(0,0,0,0.12); margin: 24px auto; } }
          h1 { font-size: 20px; font-weight: 700; }
          h2 { font-size: 14px; font-weight: 700; margin-bottom: 8px; color: #1e293b; }
          h3 { font-size: 12px; font-weight: 600; margin-bottom: 6px; color: #475569; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px; }
          .logo { font-size: 20px; font-weight: 800; color: #1e3a5f; letter-spacing: -0.5px; }
          .logo span { color: #2563eb; }
          .meta { text-align: right; font-size: 11px; color: #64748b; }
          .section { margin-bottom: 14px; }
          .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px; }
          .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; }
          .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px 16px; }
          .field { display: flex; gap: 4px; font-size: 12px; }
          .field-label { color: #64748b; white-space: nowrap; }
          .field-value { font-weight: 600; color: #1e293b; }
          .verdict-box { border-radius: 10px; padding: 16px; text-align: center; margin-bottom: 14px; }
          .verdict-title { font-size: 22px; font-weight: 800; }
          .verdict-comment { font-size: 12px; margin-top: 6px; color: #374151; max-width: 400px; margin-left: auto; margin-right: auto; }
          .check-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
          .check-label { color: #475569; }
          .check-value { font-weight: 600; }
          .vin-photo-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 8px; }
          .vin-photo { border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
          .vin-photo img { width: 100%; height: 120px; object-fit: cover; }
          .footer { border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 20px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
          .no-print-bar { background: #1e3a5f; padding: 10px 24px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 10; }
          .print-btn { background: #2563eb; color: white; border: none; padding: 8px 20px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
          .dl-btn { background: white; color: #1e3a5f; border: none; padding: 8px 20px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; }
          .note-box { background: #f8fafc; border-left: 3px solid #cbd5e1; padding: 6px 10px; border-radius: 0 6px 6px 0; font-size: 12px; color: #475569; margin-top: 4px; }
          table.tires { width: 100%; border-collapse: collapse; font-size: 12px; }
          table.tires th { text-align: left; font-weight: 600; color: #64748b; padding: 4px 0; border-bottom: 1px solid #e2e8f0; }
          table.tires td { padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
        `}</style>
      </head>
      <body>

        {/* Druckleiste (kein PDF) */}
        <div className="no-print-bar no-print">
          <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>InseratCheck Prüfbericht</span>
          <div style={{ display: 'flex', gap: 12 }}>
            <a href={`/api/orders/${order.orderNumber}/report.pdf`} className="dl-btn">⬇️ PDF herunterladen</a>
            <button className="print-btn" onClick={() => window.print()}>🖨️ Drucken</button>
          </div>
        </div>

        <div className="page">

          {/* Header */}
          <div className="header">
            <div>
              <div className="logo">Inserat<span>Check</span></div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Professioneller Gebrauchtwagen-Prüfbericht</div>
            </div>
            <div className="meta">
              <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>Auftrag {order.orderNumber}</div>
              <div>Prüfdatum: {checkedAt}</div>
              <div>Erstellt: {new Date().toLocaleDateString('de-DE')}</div>
              <div style={{ marginTop: 4 }}>
                <span className="badge" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                  Offizieller Prüfbericht
                </span>
              </div>
            </div>
          </div>

          {/* Gesamturteil */}
          {cl?.overallResult && (
            <div className="verdict-box" style={{
              background: RESULT_BG[cl.overallResult],
              border: `2px solid ${RESULT_BORDER[cl.overallResult]}`,
            }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{RESULT_ICON[cl.overallResult]}</div>
              <div className="verdict-title" style={{ color: RESULT_COLOR[cl.overallResult] }}>
                Gesamturteil: {cl.overallResult}
              </div>
              {cl.overallComment && <div className="verdict-comment">{cl.overallComment}</div>}
            </div>
          )}

          {/* Fahrzeugdaten */}
          <div className="section">
            <div className="section-title">Fahrzeug</div>
            <div className="grid2">
              <div className="field"><span className="field-label">Fahrzeug:</span><span className="field-value">{vehicleLabel}</span></div>
              <div className="field"><span className="field-label">VIN (Auftrag):</span><span className="field-value" style={{ fontFamily: 'monospace' }}>{order.vin || '–'}</span></div>
              <div className="field"><span className="field-label">VIN (geprüft):</span><span className="field-value" style={{ fontFamily: 'monospace', color: cl?.vinConfirmed === order.vin ? '#16a34a' : '#dc2626' }}>{cl?.vinConfirmed || '–'}</span></div>
              <div className="field"><span className="field-label">Km-Stand (geprüft):</span><span className="field-value">{cl?.mileageConfirmed ? `${cl.mileageConfirmed.toLocaleString('de-DE')} km` : '–'}</span></div>
              <div className="field"><span className="field-label">Erstzulassung:</span><span className="field-value">{cl?.firstRegistration ? new Date(cl.firstRegistration).toLocaleDateString('de-DE') : '–'}</span></div>
              <div className="field"><span className="field-label">HU gültig bis:</span><span className="field-value">{cl?.huValid ? new Date(cl.huValid).toLocaleDateString('de-DE') : '–'}</span></div>
            </div>
          </div>

          {/* Werkstatt */}
          {order.workshop && (
            <div className="section">
              <div className="section-title">Prüfende Werkstatt</div>
              <div className="grid2">
                <div className="field"><span className="field-label">Name:</span><span className="field-value">{order.workshop.name}</span></div>
                <div className="field"><span className="field-label">Standort:</span><span className="field-value">{order.workshop.zip} {order.workshop.city}</span></div>
                <div className="field"><span className="field-label">Adresse:</span><span className="field-value">{order.workshop.street}</span></div>
                {order.workshop.phone && <div className="field"><span className="field-label">Telefon:</span><span className="field-value">{order.workshop.phone}</span></div>}
              </div>
            </div>
          )}

          {/* VIN-Fotos prominent */}
          {vinPhotos.length > 0 && (
            <div className="section">
              <div className="section-title">VIN-Nachweis (Pflichtfoto)</div>
              <div className="vin-photo-grid">
                {vinPhotos.map(u => (
                  <div key={u.id} className="vin-photo">
                    <img src={`/uploads/${u.filename}`} alt="VIN-Foto" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OBD */}
          <div className="section">
            <div className="section-title">OBD-Diagnose</div>
            <div className="check-row">
              <span className="check-label">Fehlerspeicher Einträge vorhanden</span>
              <span className="check-value" style={{ color: boolColor(cl?.obdErrors, true) }}>{bool(cl?.obdErrors)}</span>
            </div>
            {cl?.obdNote && <div className="note-box">{cl.obdNote}</div>}
          </div>

          {/* Bremsen */}
          <div className="section">
            <div className="section-title">Bremsen</div>
            <div className="check-row">
              <span className="check-label">Bremsen vorne</span>
              <span className="check-value" style={{ color: cl?.brakeFrontStatus ? RESULT_COLOR[cl.brakeFrontStatus] : '#9ca3af' }}>
                {cl?.brakeFrontStatus ? `${RESULT_ICON[cl.brakeFrontStatus]} ${cl.brakeFrontStatus}` : '–'}
              </span>
            </div>
            <div className="check-row">
              <span className="check-label">Bremsen hinten</span>
              <span className="check-value" style={{ color: cl?.brakeRearStatus ? RESULT_COLOR[cl.brakeRearStatus] : '#9ca3af' }}>
                {cl?.brakeRearStatus ? `${RESULT_ICON[cl.brakeRearStatus]} ${cl.brakeRearStatus}` : '–'}
              </span>
            </div>
            <div className="check-row">
              <span className="check-label">Bremsflüssigkeit OK</span>
              <span className="check-value" style={{ color: boolColor(cl?.brakeFluidOk) }}>{bool(cl?.brakeFluidOk)}</span>
            </div>
            {cl?.brakeNote && <div className="note-box">{cl.brakeNote}</div>}
          </div>

          {/* Reifen */}
          <div className="section">
            <div className="section-title">Reifen</div>
            <table className="tires">
              <thead>
                <tr>
                  <th></th><th>Vorne</th><th>Hinten</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="field-label">Profiltiefe</td>
                  <td className="field-value">{cl?.tireFrontDepth ? `${cl.tireFrontDepth} mm` : '–'}</td>
                  <td className="field-value">{cl?.tireRearDepth ? `${cl.tireRearDepth} mm` : '–'}</td>
                </tr>
                <tr>
                  <td className="field-label">DOT</td>
                  <td className="field-value">{cl?.tireFrontDot || '–'}</td>
                  <td className="field-value">{cl?.tireRearDot || '–'}</td>
                </tr>
              </tbody>
            </table>
            <div className="check-row" style={{ marginTop: 4 }}>
              <span className="check-label">Ungleichmäßige Abnutzung</span>
              <span className="check-value" style={{ color: boolColor(cl?.tireUneven, true) }}>{bool(cl?.tireUneven)}</span>
            </div>
            {cl?.tireNote && <div className="note-box">{cl.tireNote}</div>}
          </div>

          {/* Fahrwerk + Motorraum */}
          <div className="grid2" style={{ marginBottom: 14, gap: 14 }}>
            <div className="section">
              <div className="section-title">Fahrwerk &amp; Lenkung</div>
              <div className="check-row">
                <span className="check-label">Geräusche</span>
                <span className="check-value" style={{ color: boolColor(cl?.suspensionNoises, true) }}>{bool(cl?.suspensionNoises)}</span>
              </div>
              <div className="check-row">
                <span className="check-label">Lenkungsspiel</span>
                <span className="check-value" style={{ color: boolColor(cl?.steeringPlay, true) }}>{bool(cl?.steeringPlay)}</span>
              </div>
              {cl?.suspensionNote && <div className="note-box">{cl.suspensionNote}</div>}
            </div>
            <div className="section">
              <div className="section-title">Motorraum</div>
              <div className="check-row">
                <span className="check-label">Öl-/Kühlmittellecks</span>
                <span className="check-value" style={{ color: boolColor(cl?.engineLeaks, true) }}>{bool(cl?.engineLeaks)}</span>
              </div>
              {cl?.engineNote && <div className="note-box">{cl.engineNote}</div>}
            </div>
          </div>

          {/* Karosserie */}
          <div className="section">
            <div className="section-title">Karosserie &amp; Lack</div>
            <div className="check-row">
              <span className="check-label">Unfallschaden-Verdacht</span>
              <span className="check-value" style={{ color: boolColor(cl?.accidentSuspect, true) }}>{bool(cl?.accidentSuspect)}</span>
            </div>
            {cl?.paintValues && (() => {
              try {
                const pv = JSON.parse(cl.paintValues)
                return (
                  <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap', fontSize: 11 }}>
                    {Object.entries(pv).map(([k, v]) => (
                      <div key={k} style={{ textAlign: 'center' }}>
                        <div style={{ color: '#64748b' }}>{k.toUpperCase()}</div>
                        <div style={{ fontWeight: 700 }}>{String(v)} µm</div>
                      </div>
                    ))}
                  </div>
                )
              } catch { return null }
            })()}
            {cl?.bodyNote && <div className="note-box">{cl.bodyNote}</div>}
          </div>

          {/* Probefahrt */}
          <div className="section">
            <div className="section-title">Probefahrt</div>
            <div className="check-row">
              <span className="check-label">Auffälligkeiten bei Probefahrt</span>
              <span className="check-value" style={{ color: boolColor(cl?.testDriveIssues, true) }}>{bool(cl?.testDriveIssues)}</span>
            </div>
            {cl?.testDriveNote && <div className="note-box">{cl.testDriveNote}</div>}
          </div>

          {/* Weitere Fotos */}
          {otherUploads.length > 0 && (
            <div className="section">
              <div className="section-title">Weitere Dokumentation</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {otherUploads.map(u => (
                  <span key={u.id} style={{ fontSize: 11, color: '#64748b', background: '#f1f5f9', padding: '3px 8px', borderRadius: 4 }}>
                    {u.uploadType}: {u.originalName}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="footer">
            <div>
              <div style={{ fontWeight: 600, color: '#475569' }}>InseratCheck</div>
              <div>Schlachthofstraße 61 · 67433 Neustadt a.d.W. · info@inseratcheck.de</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div>Bericht-Nr.: {order.orderNumber}</div>
              <div>Dieser Bericht wurde digital erstellt und ist ohne Unterschrift gültig.</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
