// lib/email.ts
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ionos.de',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const FROM = process.env.SMTP_FROM || 'InseratCheck <info@inseratcheck.de>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; background: #f8fafc; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #1d4ed8; padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: #bfdbfe; margin-top: 6px; font-size: 14px; }
    .body { padding: 36px; }
    .body p { line-height: 1.7; color: #475569; margin-bottom: 16px; font-size: 15px; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 8px 0; }
    .highlight { background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }
    .highlight p { margin: 0; color: #1e40af; }
    .footer { padding: 24px 36px; border-top: 1px solid #e2e8f0; }
    .footer p { font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.6; }
    .status-badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    .status-confirmed { background: #dbeafe; color: #1d4ed8; }
    .status-paid { background: #dcfce7; color: #15803d; }
    .status-completed { background: #d1fae5; color: #065f46; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>✓ InseratCheck</h1>
        <p>Sicher. Legal. Geprüft.</p>
      </div>
      <div class="body">${content}</div>
      <div class="footer">
        <p>
          InseratCheck · Schlachthofstraße 61 · 67433 Neustadt an der Weinstraße<br>
          <a href="${APP_URL}" style="color: #94a3b8;">inseratcheck.de</a> · 
          <a href="mailto:info@inseratcheck.de" style="color: #94a3b8;">info@inseratcheck.de</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`
}

export async function sendWelcomeEmail(to: string, name: string) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Willkommen bei InseratCheck!',
    html: baseTemplate(`
      <p>Hallo ${name || 'dort'},</p>
      <p>willkommen bei <strong>InseratCheck</strong>! Dein Konto wurde erfolgreich erstellt.</p>
      <div class="highlight">
        <p>Du kannst jetzt Inserate prüfen lassen und Werkstattchecks buchen – bevor du beim Gebrauchtwagenkauf Geld verlierst.</p>
      </div>
      <p><a href="${APP_URL}/dashboard" class="btn">Zum Dashboard →</a></p>
      <p>Bei Fragen erreichst du uns jederzeit unter <a href="mailto:info@inseratcheck.de">info@inseratcheck.de</a>.</p>
    `),
  })
}

export async function sendOrderConfirmationToCustomer(
  to: string, name: string, orderNumber: string, workshopName: string, confirmedDate: Date
) {
  const dateStr = confirmedDate.toLocaleDateString('de-DE', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  })
  const timeStr = confirmedDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Termin bestätigt – Auftrag ${orderNumber}`,
    html: baseTemplate(`
      <p>Hallo ${name || 'dort'},</p>
      <p>deine Werkstattprüfung wurde bestätigt! <span class="status-badge status-confirmed">Bestätigt</span></p>
      <div class="highlight">
        <p><strong>Werkstatt:</strong> ${workshopName}<br>
        <strong>Termin:</strong> ${dateStr} um ${timeStr} Uhr<br>
        <strong>Auftrag:</strong> ${orderNumber}</p>
      </div>
      <p>Du kannst jetzt sicher bezahlen (118,00 € via PayPal). Nach Zahlungseingang wird die Prüfung durchgeführt.</p>
      <p><a href="${APP_URL}/dashboard/orders/${orderNumber}" class="btn">Jetzt bezahlen →</a></p>
    `),
  })
}

export async function sendNewOrderToWorkshop(
  to: string, workshopName: string, orderNumber: string, 
  customerName: string, vehicleInfo: string, vehicleZip: string
) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Neue Prüfanfrage – ${orderNumber}`,
    html: baseTemplate(`
      <p>Hallo ${workshopName},</p>
      <p>du hast eine <strong>neue Prüfanfrage</strong> erhalten!</p>
      <div class="highlight">
        <p><strong>Auftrag:</strong> ${orderNumber}<br>
        <strong>Fahrzeug:</strong> ${vehicleInfo}<br>
        <strong>Fahrzeugstandort PLZ:</strong> ${vehicleZip}<br>
        <strong>Kunde:</strong> ${customerName}</p>
      </div>
      <p>Bitte prüfe die Anfrage und bestätige oder lehne sie ab.</p>
      <p><a href="${APP_URL}/werkstatt/orders/${orderNumber}" class="btn">Anfrage ansehen →</a></p>
    `),
  })
}

export async function sendPaymentConfirmation(
  to: string, name: string, orderNumber: string, amount: number
) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Zahlung eingegangen – ${orderNumber}`,
    html: baseTemplate(`
      <p>Hallo ${name || 'dort'},</p>
      <p>deine Zahlung ist eingegangen! <span class="status-badge status-paid">Bezahlt</span></p>
      <div class="highlight">
        <p><strong>Auftrag:</strong> ${orderNumber}<br>
        <strong>Betrag:</strong> ${(amount / 100).toFixed(2).replace('.', ',')} €<br>
        <strong>Status:</strong> Aktiv – Prüfung wird durchgeführt</p>
      </div>
      <p>Die Werkstatt wurde benachrichtigt. Du erhältst deinen Bericht per E-Mail, sobald die Prüfung abgeschlossen ist.</p>
      <p><a href="${APP_URL}/dashboard/orders/${orderNumber}" class="btn">Auftrag ansehen →</a></p>
    `),
  })
}

export async function sendReportReady(
  to: string, name: string, orderNumber: string, result: string
) {
  const resultEmoji = result === 'GUT' ? '✅' : result === 'MITTEL' ? '⚠️' : '❌'
  const resultText = result === 'GUT' ? 'Gut' : result === 'MITTEL' ? 'Mittel' : 'Schlecht'

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Dein Prüfbericht ist fertig – ${orderNumber}`,
    html: baseTemplate(`
      <p>Hallo ${name || 'dort'},</p>
      <p>dein Fahrzeugprüfbericht ist fertig! <span class="status-badge status-completed">Abgeschlossen</span></p>
      <div class="highlight">
        <p><strong>Auftrag:</strong> ${orderNumber}<br>
        <strong>Gesamturteil:</strong> ${resultEmoji} ${resultText}</p>
      </div>
      <p>Den vollständigen Bericht findest du in deinem Dashboard. Du kannst ihn dort auch als PDF herunterladen.</p>
      <p><a href="${APP_URL}/dashboard/orders/${orderNumber}" class="btn">Bericht ansehen →</a></p>
    `),
  })
}

export async function sendPasswordReset(to: string, name: string, resetToken: string) {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${resetToken}`
  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Passwort zurücksetzen – InseratCheck',
    html: baseTemplate(`
      <p>Hallo ${name || 'dort'},</p>
      <p>du hast eine Passwort-Zurücksetzung angefordert.</p>
      <p><a href="${resetUrl}" class="btn">Passwort zurücksetzen →</a></p>
      <p style="font-size: 13px; color: #94a3b8;">Dieser Link ist 1 Stunde gültig. Falls du diese Anfrage nicht gestellt hast, ignoriere diese E-Mail.</p>
    `),
  })
}
