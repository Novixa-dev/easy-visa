/**
 * Seeds Easy Visa with bilingual starter content and (optionally) demo requests.
 *   npm run seed            → content + team accounts + demo requests (development)
 *   npm run seed -- --no-demo  → content only
 * Refuses to wipe data in production unless --force is passed.
 */
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import { about, categories, companies, demoMessages, destinations, faqs, homepage, legal, offers, services, settings, trips } from './data'
import { pick, withIds } from './helpers'

const args = process.argv.slice(2)
const withDemo = !args.includes('--no-demo')

type Coll = Parameters<Payload['create']>[0]['collection']

async function bilingualCreate(payload: Payload, collection: Coll, data: Record<string, unknown>) {
  const arDoc = await payload.create({ collection, data: pick(data, 'ar') as never, locale: 'ar', overrideAccess: true, context: { skipAudit: true } })
  await payload.update({
    collection,
    id: arDoc.id,
    data: withIds(pick(data, 'en'), arDoc) as never,
    locale: 'en',
    overrideAccess: true,
    context: { skipAudit: true },
  })
  return arDoc
}

async function bilingualGlobal(payload: Payload, slug: 'site-settings' | 'homepage' | 'about-page' | 'legal-pages', data: Record<string, unknown>) {
  const arDoc = await payload.updateGlobal({ slug, data: pick(data, 'ar') as never, locale: 'ar', overrideAccess: true })
  await payload.updateGlobal({ slug, data: withIds(pick(data, 'en'), arDoc) as never, locale: 'en', overrideAccess: true })
}

async function wipe(payload: Payload) {
  const order: Coll[] = [
    'audit-logs',
    'page-views',
    'contact-messages',
    'payments',
    'request-documents',
    'requests',
    'customers',
    'trips',
    'companies',
    'offers',
    'services',
    'service-categories',
    'destinations',
    'faqs',
  ]
  for (const c of order) await payload.delete({ collection: c, where: { id: { exists: true } }, overrideAccess: true, context: { skipAudit: true } })
}

async function main() {
  const payload = await getPayload({ config })
  if (process.env.NODE_ENV === 'production' && !args.includes('--force')) {
    payload.logger.error('Refusing to seed in production without --force')
    process.exit(1)
  }

  const isProd = process.env.NODE_ENV === 'production'
  if (isProd) {
    // The wipe below deletes requests, customers and payments: never let it touch real customers.
    const demoPhones = demoRequests().map((d) => d.phone)
    const real = await payload.count({ collection: 'requests', where: { phone: { not_in: demoPhones } }, overrideAccess: true })
    const realMessages = await payload.count({
      collection: 'contact-messages',
      where: { phone: { not_in: demoMessages.map((m) => m.phone) } },
      overrideAccess: true,
    })
    if (real.totalDocs > 0 || realMessages.totalDocs > 0) {
      payload.logger.error(
        `Refusing to seed: ${real.totalDocs} real request(s) and ${realMessages.totalDocs} real message(s) exist and would be deleted`,
      )
      process.exit(1)
    }
  }

  payload.logger.info('Wiping content…')
  await wipe(payload)

  const users: Record<string, number | undefined> = {}
  if (isProd) {
    // No accounts with the well-known seed passwords in production: the owner signs up at /admin.
    // Demo requests are assigned to the first existing account, if there is one.
    const first = await payload.find({ collection: 'users', limit: 1, sort: 'createdAt', depth: 0, overrideAccess: true })
    users.staff = first.docs[0]?.id as number | undefined
  } else await seedTeam(payload, users)

  payload.logger.info('Globals…')
  await bilingualGlobal(payload, 'site-settings', settings)
  await bilingualGlobal(payload, 'homepage', homepage)
  await bilingualGlobal(payload, 'about-page', about)
  await bilingualGlobal(payload, 'legal-pages', { ...legal, updatedOn: new Date().toISOString() })

  payload.logger.info('Destinations…')
  for (const [i, [code, ar, en]] of destinations.entries())
    await bilingualCreate(payload, 'destinations', { code, name: { ar, en }, active: true, sortOrder: i })

  payload.logger.info('Categories & services…')
  const catIds: Record<string, number> = {}
  for (const c of categories) catIds[c.slug] = (await bilingualCreate(payload, 'service-categories', c)).id as number

  const svcIds: Record<string, number> = {}
  for (const [i, s] of services.entries()) {
    const { category, ...rest } = s
    const doc = await bilingualCreate(payload, 'services', {
      ...rest,
      category: catIds[category],
      status: 'published',
      available: true,
      sortOrder: i,
      price: { mode: 'quote' },
    })
    svcIds[s.slug] = doc.id as number
  }

  payload.logger.info('Offers & FAQs…')
  for (const [i, o] of offers().entries()) {
    const { service, ...rest } = o
    await bilingualCreate(payload, 'offers', { ...rest, service: svcIds[service], status: 'published', sortOrder: i, price: { mode: 'quote' } })
  }
  for (const [i, q] of faqs.entries()) await bilingualCreate(payload, 'faqs', { ...q, status: 'published', sortOrder: i })

  payload.logger.info('Companies & trips…')
  const companyIds: Record<string, number> = {}
  for (const [i, c] of companies.entries()) {
    const { key, ...rest } = c
    companyIds[key] = (await bilingualCreate(payload, 'companies', { ...rest, active: true, sortOrder: i })).id as number
  }
  for (const tr of trips()) {
    const { company, service, ...rest } = tr
    await bilingualCreate(payload, 'trips', {
      ...rest,
      company: companyIds[company],
      service: svcIds[service],
      status: 'published',
      bookingOpen: true,
      showSeatsLeft: true,
      price: { mode: 'quote' },
    })
  }

  if (withDemo) {
    payload.logger.info('Demo requests, payments, messages, visits…')
    await seedDemoRequests(payload, svcIds, users)
    await seedDemoExtras(payload)
  }

  payload.logger.info('✓ Seed complete')
  if (!isProd) {
    payload.logger.info(`  Owner login: ${process.env.SEED_OWNER_EMAIL || 'owner@easyvisa.test'} / ${process.env.SEED_OWNER_PASSWORD || 'ChangeMe!2026'}`)
    payload.logger.info('  Staff login: staff@easyvisa.test / Staff!2026')
  }
  process.exit(0)
}

const inDays = (d: number) => new Date(Date.now() + d * 86400_000).toISOString().slice(0, 10)

/** The demo customers. Phones are also used to tell demo requests from real ones. */
function demoRequests() {
  return [
    { name: 'سالم عوض باوزير', phone: '+967771234501', service: 'umrah-visa', status: 'new', travel: 40, answers: [['الجنسية', 'اليمن'], ['عدد المسافرين', '4'], ['تاريخ السفر المتوقع', inDays(40)]] },
    { name: 'فاطمة سعيد بن طالب', phone: '+967733334502', service: 'family-visit-visa', status: 'under_review', travel: 25, answers: [['الدولة المراد زيارتها', 'المملكة العربية السعودية'], ['عدد المتقدمين', '2']] },
    { name: 'عبدالله أحمد الكثيري', phone: '+967712224503', service: 'flight-booking', status: 'awaiting_customer', travel: 9, msg: 'نحتاج صورة واضحة من الجواز لإكمال الحجز. أرسلها على واتساب.', answers: [['من', 'المكلا – الريان'], ['إلى', 'جدة'], ['تاريخ الذهاب', inDays(9)]] },
    { name: 'Omar Bin Shamlan', phone: '+966501234504', service: 'hotel-booking', status: 'in_progress', travel: 12, locale: 'en', msg: 'We are confirming room availability with the hotel.', answers: [['City', 'Makkah'], ['Check-in', inDays(12)], ['Rooms', '2']] },
    { name: 'محمد صالح العمودي', phone: '+967775554505', service: 'oman-visa', status: 'completed', travel: 5, msg: 'اكتمل طلبك. نتمنى لك رحلة موفقة.', answers: [['الجنسية', 'اليمن'], ['الغرض من السفر', 'زيارة عائلية']] },
    { name: 'خالد مبارك الجابري', phone: '+967736664506', service: 'land-transport', status: 'new', travel: 3, answers: [['نوع الرحلة', 'داخلية'], ['من', 'المكلا'], ['إلى', 'سيئون'], ['عدد الركاب', '3']] },
    { name: 'نورة عبدالله باعشن', phone: '+967770004507', service: 'travel-consultation', status: 'rejected', msg: 'للأسف لا يمكن تقديم هذا النوع من التأشيرات حالياً. تواصل معنا لمعرفة البدائل.', answers: [['موضوع الاستشارة', 'تأشيرة'], ['سؤالك', 'هل يمكن التقديم على تأشيرة عمل؟']] },
    { name: 'أحمد علي بامطرف', phone: '+967711114508', service: 'umrah-visa', status: 'cancelled', source: 'whatsapp', answers: [['عدد المسافرين', '1']] },
  ]
}

async function seedTeam(payload: Payload, users: Record<string, number | undefined>) {
  const ownerEmail = process.env.SEED_OWNER_EMAIL || 'owner@easyvisa.test'
  const ownerPass = process.env.SEED_OWNER_PASSWORD || 'ChangeMe!2026'
  const team = [
    { email: ownerEmail, password: ownerPass, name: 'مالك Easy Visa', role: 'owner' as const },
    { email: 'staff@easyvisa.test', password: 'Staff!2026', name: 'موظف الاستقبال', role: 'staff' as const },
  ]
  for (const u of team) {
    const found = await payload.find({ collection: 'users', where: { email: { equals: u.email } }, limit: 1, overrideAccess: true })
    const doc = found.docs[0]
      ? await payload.update({ collection: 'users', id: found.docs[0].id, data: { ...u, active: true }, overrideAccess: true, context: { skipAudit: true } })
      : await payload.create({ collection: 'users', data: { ...u, active: true }, overrideAccess: true, context: { skipAudit: true } })
    users[u.role] = doc.id as number
  }
}

async function seedDemoRequests(payload: Payload, svc: Record<string, number>, users: Record<string, number | undefined>) {
  const demo = demoRequests()

  const flow = ['new', 'under_review', 'awaiting_customer', 'in_progress', 'completed']
  for (const d of demo) {
    const customer = await payload.create({ collection: 'customers', data: { fullName: d.name, phone: d.phone, preferredLocale: (d.locale as 'en') ?? 'ar' }, overrideAccess: true, context: { skipAudit: true } })
    const req = await payload.create({
      collection: 'requests',
      data: {
        contactName: d.name,
        phone: d.phone,
        whatsapp: d.phone,
        service: svc[d.service],
        customer: customer.id,
        source: (d.source as 'whatsapp') ?? 'website',
        status: 'new',
        customerLocale: (d.locale as 'en') ?? 'ar',
        travelDate: d.travel ? inDays(d.travel) : undefined,
        answers: d.answers.map(([label, value], i) => ({ key: `f${i}`, label, value })),
        data: {},
      },
      overrideAccess: true,
      context: { skipAudit: true, skipNotify: true },
    })
    // Walk the status forward so the history looks like real work.
    const target = d.status
    const path = ['rejected', 'cancelled'].includes(target) ? ['under_review', target] : flow.slice(1, flow.indexOf(target) + 1)
    for (const s of path) {
      await payload.update({
        collection: 'requests',
        id: req.id,
        data: { status: s as never, customerMessage: s === target ? d.msg ?? '' : '', assignedTo: users.staff },
        overrideAccess: true,
        user: (users.staff ? { id: users.staff, collection: 'users' } : undefined) as never,
        context: { skipAudit: true },
      })
    }
    if (target !== 'new') {
      await payload.update({
        collection: 'requests',
        id: req.id,
        data: {
          internalNotes: [{ note: 'تم التواصل مع العميل وتأكيد البيانات الأساسية.' }],
          contactLog: [{ channel: 'whatsapp', outcome: 'reached', note: 'أُرسل تحديث الحالة' }],
        },
        overrideAccess: true,
        user: (users.staff ? { id: users.staff, collection: 'users' } : undefined) as never,
        context: { skipAudit: true },
      })
    }
  }
}

async function seedDemoExtras(payload: Payload) {
  const find = async (name: string) =>
    (await payload.find({ collection: 'requests', where: { contactName: { equals: name } }, limit: 1, depth: 0, overrideAccess: true })).docs[0]

  // Hotel request: amount due, customer reported a transfer (awaiting check).
  const hotel = await find('Omar Bin Shamlan')
  if (hotel) {
    await payload.update({
      collection: 'requests',
      id: hotel.id,
      data: { invoice: { amount: 1200, currency: 'SAR', description: 'Hotel in Makkah, 2 rooms, 4 nights (confirmed rate).', allowBankTransfer: true, allowCash: true } },
      overrideAccess: true,
      context: { skipAudit: true },
    })
    await payload.create({
      collection: 'payments',
      data: { request: hotel.id, amount: 600, currency: 'SAR', method: 'bank_transfer', status: 'pending_review', payerName: 'Omar Bin Shamlan', transferReference: 'TRX-55821', source: 'customer' },
      overrideAccess: true,
      context: { skipAudit: true },
    })
  }
  // Completed Oman visa: fully paid in cash.
  const oman = await find('محمد صالح العمودي')
  if (oman) {
    await payload.update({ collection: 'requests', id: oman.id, data: { invoice: { amount: 45000, currency: 'YER', allowCash: true } }, overrideAccess: true, context: { skipAudit: true } })
    await payload.create({ collection: 'payments', data: { request: oman.id, amount: 45000, currency: 'YER', method: 'cash', status: 'paid', source: 'staff' }, overrideAccess: true, context: { skipAudit: true } })
  }

  for (const m of demoMessages) await payload.create({ collection: 'contact-messages', data: { ...m, locale: (m.locale as 'en') ?? 'ar' } as never, overrideAccess: true, context: { skipAudit: true } })

  // ~5 weeks of synthetic visits so the reports have something to show.
  const paths = ['/ar', '/ar/services/umrah-visa', '/ar/trips', '/ar/track', '/ar/services/flight-booking', '/en', '/ar/offers', '/ar/contact', '/ar/trips/umrah-package-10-days', '/en/services/oman-visa']
  const devices = ['mobile', 'mobile', 'mobile', 'mobile', 'desktop', 'tablet']
  const refs = [undefined, undefined, 'google.com', 'instagram.com', 'facebook.com', 'l.facebook.com', undefined]
  const rows: Record<string, unknown>[] = []
  for (let d = 34; d >= 0; d--) {
    const day = new Date(Date.now() + 3 * 3600_000 - d * 86400_000).toISOString().slice(0, 10)
    const visitors = 15 + Math.round(20 * Math.sin((34 - d) / 6) ** 2) + (34 - d)
    for (let v = 0; v < visitors; v++) {
      const pages = 1 + (v % 3)
      for (let p = 0; p < pages; p++)
        rows.push({ day, visitor: `${day}-${v}`, path: paths[(v * 7 + p * 3 + d) % paths.length], locale: (v + d) % 9 === 0 ? 'en' : 'ar', device: devices[(v + p) % devices.length], referrer: p === 0 ? refs[(v + d) % refs.length] : undefined, country: v % 6 === 0 ? 'SA' : 'YE' })
    }
  }
  for (let i = 0; i < rows.length; i += 50)
    await Promise.all(rows.slice(i, i + 50).map((data) => payload.create({ collection: 'page-views', data: data as never, overrideAccess: true })))
  payload.logger.info(`  ${rows.length} demo visits`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
