// scripts/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function seed() {
  console.log('🌱 Starte Seed...')

  // 1. Admin
  const adminHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'Admin123!Sicher', 12)
  const admin = await prisma.user.upsert({
    where: { email: process.env.SEED_ADMIN_EMAIL || 'admin@inseratcheck.de' },
    update: {},
    create: {
      email: process.env.SEED_ADMIN_EMAIL || 'admin@inseratcheck.de',
      name: 'Firat Kilic',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin erstellt:', admin.email)

  // 2. Beispiel-Werkstatt
  const wsHash = await bcrypt.hash('Werkstatt123!', 12)
  const wsUser = await prisma.user.upsert({
    where: { email: 'werkstatt@demo.de' },
    update: {},
    create: {
      email: 'werkstatt@demo.de',
      name: 'Auto-Service Demo',
      passwordHash: wsHash,
      role: 'WERKSTATT',
    },
  })

  const workshop = await prisma.workshop.upsert({
    where: { userId: wsUser.id },
    update: {},
    create: {
      userId: wsUser.id,
      name: 'Auto-Service Mustermann GmbH',
      street: 'Hauptstraße 42',
      zip: '67433',
      city: 'Neustadt an der Weinstraße',
      lat: 49.354,
      lng: 8.161,
      phone: '+49 6321 123456',
      description: 'Zertifizierte Kfz-Meisterwerkstatt mit 20 Jahren Erfahrung.',
      openingHours: JSON.stringify({ Mo: '08:00–18:00', Di: '08:00–18:00', Mi: '08:00–18:00', Do: '08:00–18:00', Fr: '08:00–17:00' }),
      capacity: 5,
      isActive: true,
      isVerified: true,
      coverZips: ['67433', '67435', '67454', '67459'],
    },
  })
  console.log('✅ Werkstatt erstellt:', workshop.name)

  // 3. Beispiel-Kunden
  const kundeHash = await bcrypt.hash('Kunde123!', 12)
  const kunde = await prisma.user.upsert({
    where: { email: 'kunde@demo.de' },
    update: {},
    create: {
      email: 'kunde@demo.de',
      name: 'Max Mustermann',
      passwordHash: kundeHash,
      role: 'KUNDE',
      phone: '+49 151 12345678',
      street: 'Teststraße 1',
      zip: '67433',
      city: 'Neustadt an der Weinstraße',
    },
  })
  console.log('✅ Kunde erstellt:', kunde.email)

  // 4. Beispiel-Aufträge
  const order1 = await prisma.order.upsert({
    where: { orderNumber: 'IC-2602-DEMO1' },
    update: {},
    create: {
      orderNumber: 'IC-2602-DEMO1',
      customerId: kunde.id,
      workshopId: workshop.id,
      status: 'COMPLETED',
      make: 'BMW',
      model: '3er',
      year: 2018,
      mileage: 87450,
      vehicleZip: '67433',
      vehicleCity: 'Neustadt an der Weinstraße',
      vehicleAddress: 'Musterstraße 15',
      preferredDate1: new Date('2026-03-01T09:00:00'),
      confirmedDate: new Date('2026-03-01T09:00:00'),
      totalAmount: 11800,
      workshopAmount: 7900,
      platformAmount: 3900,
      paypalOrderId: 'PAYPAL-DEMO-001',
      paidAt: new Date('2026-02-20'),
      payoutStatus: 'PAID',
      payoutAt: new Date('2026-02-25'),
    },
  })

  // Checkliste für abgeschlossenen Auftrag
  await prisma.checklist.upsert({
    where: { orderId: order1.id },
    update: {},
    create: {
      orderId: order1.id,
      vinConfirmed: 'WBA12345678901234',
      mileageConfirmed: 87450,
      firstRegistration: new Date('2018-03-15'),
      obdErrors: false,
      brakeFrontStatus: 'GUT',
      brakeRearStatus: 'MITTEL',
      brakeFluidOk: true,
      tireFrontDepth: 5.5,
      tireRearDepth: 4.2,
      tireFrontDot: '2421',
      tireRearDot: '2320',
      tireUneven: false,
      suspensionNoises: false,
      steeringPlay: false,
      engineLeaks: false,
      accidentSuspect: false,
      huValid: new Date('2027-03-01'),
      testDriveIssues: false,
      overallResult: 'GUT',
      overallComment: 'Fahrzeug befindet sich in einem sehr guten Zustand. Keine wesentlichen Mängel festgestellt. Kleiner Hinweis: Hinterradbremsen sollten in 12–15.000 km erneuert werden.',
      completedAt: new Date('2026-03-01T15:30:00'),
    },
  })

  // Offener Auftrag
  await prisma.order.upsert({
    where: { orderNumber: 'IC-2602-DEMO2' },
    update: {},
    create: {
      orderNumber: 'IC-2602-DEMO2',
      customerId: kunde.id,
      workshopId: workshop.id,
      status: 'PENDING',
      make: 'VW',
      model: 'Golf',
      year: 2020,
      mileage: 45000,
      vehicleZip: '67433',
      vehicleCity: 'Neustadt an der Weinstraße',
      preferredDate1: new Date('2026-03-05T10:00:00'),
      preferredDate2: new Date('2026-03-06T14:00:00'),
      customerNote: 'Bitte besonders auf Getriebe achten.',
    },
  })

  // 5. FAQ
  const faqs = [
    { question: 'Was ist InseratCheck?', answer: 'InseratCheck ist eine Plattform, auf der du Gebrauchtwagen vor dem Kauf professionell durch eine Partnerwerkstatt prüfen lassen kannst.', order: 1 },
    { question: 'Wie läuft ein Werkstattcheck ab?', answer: 'Du gibst deine PLZ ein, wählst eine Werkstatt, schickst eine Terminanfrage. Die Werkstatt bestätigt den Termin. Danach bezahlst du (118 €) und die Prüfung findet statt.', order: 2 },
    { question: 'Ist der Basischeck wirklich kostenlos?', answer: 'Ja, die Inserats-Analyse ist komplett kostenlos. Nur der Werkstattcheck vor Ort kostet 118 €.', order: 3 },
    { question: 'Wie sicher ist meine Zahlung?', answer: 'Zahlungen laufen über PayPal ab. Deine Zahlungsdaten werden nicht auf unseren Servern gespeichert.', order: 4 },
    { question: 'Kann ich den Auftrag stornieren?', answer: 'Ja, du kannst vor Durchführung der Prüfung stornieren. Es gilt ein 14-tägiges Widerrufsrecht.', order: 5 },
  ]

  for (const faq of faqs) {
    await prisma.faqItem.upsert({
      where: { id: `faq-${faq.order}` },
      update: {},
      create: { id: `faq-${faq.order}`, ...faq },
    })
  }

  // 6. VehicleHistory Eintrag
  await prisma.vehicleHistory.upsert({
    where: { orderId: order1.id },
    update: {},
    create: {
      vin: 'WBA12345678901234',
      orderId: order1.id,
      checkedAt: new Date('2026-03-01'),
      mileage: 87450,
      overallResult: 'GUT',
      make: 'BMW',
      model: '3er',
      year: 2018,
      workshopCity: 'Neustadt an der Weinstraße',
    },
  })

  console.log('✅ FAQ & Historien-Daten erstellt')
  console.log('')
  console.log('🎉 Seed abgeschlossen!')
  console.log('')
  console.log('Test-Zugangsdaten:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Admin:     ${process.env.SEED_ADMIN_EMAIL || 'admin@inseratcheck.de'} / ${process.env.SEED_ADMIN_PASSWORD || 'Admin123!Sicher'}`)
  console.log('Werkstatt: werkstatt@demo.de / Werkstatt123!')
  console.log('Kunde:     kunde@demo.de / Kunde123!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

seed().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
