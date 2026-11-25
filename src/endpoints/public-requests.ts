import { randomBytes } from 'node:crypto'
import { fileTypeFromBuffer } from 'file-type'
import type { Endpoint, Payload, PayloadRequest } from 'payload'
import { DOCUMENT_MIME_TYPES, MAX_DOCUMENT_BYTES, STATUS_HINTS, STATUS_LABELS, type Locale, type RequestStatus } from '@/lib/constants'
import { contactSchema } from '@/lib/form-schema'
import { lastFour, normalizePhone } from '@/lib/phone'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { normalizeReference } from '@/lib/reference'
import { toLatinDigits } from '@/lib/digits'
import { formatDate } from '@/lib/format'
import { tripAvailability } from '@/collections/Trips'
import type { Request as RequestDoc } from '@/payload-types'

export const json = (body: unknown, status = 200, headers?: Record<string, string>) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } })
export const asLocale = (v: unknown): Locale => (v === 'en' ? 'en' : 'ar')
export const tr = (locale: Locale, ar: string, en: string) => (locale === 'ar' ? ar : en)

export async function upsertCustomer(payload: Payload, name: string, phone: string, whatsapp: string | undefined, locale: Locale) {
  const existing = await payload.find({ collection: 'customers', where: { phone: { equals: phone } }, limit: 1, depth: 0, overrideAccess: true })
  const wa = whatsapp && whatsapp !== phone ? whatsapp : undefined
  if (existing.docs[0])
    return payload.update({
      collection: 'customers',
      id: existing.docs[0].id,
      data: { fullName: name, whatsapp: wa ?? existing.docs[0].whatsapp, preferredLocale: locale },
      overrideAccess: true,
      context: { skipAudit: true },
    })
  return payload.create({ collection: 'customers', data: { fullName: name, phone, whatsapp: wa, preferredLocale: locale }, overrideAccess: true })
}

/** Looks a request up by reference + last 4 phone digits. Returns null on any mismatch. */
async function findVerified(payload: Payload, rawRef: unknown, rawPhone: unknown, locale: Locale) {
  const reference = normalizeReference(String(rawRef ?? ''))
  const last4 = toLatinDigits(String(rawPhone ?? '')).replace(/\D/g, '').slice(-4)
  if (!reference || last4.length !== 4) return null
  const res = await payload.find({ collection: 'requests', where: { reference: { equals: reference } }, limit: 1, depth: 1, locale, overrideAccess: true })
  const doc = res.docs[0]
  if (!doc || lastFour(doc.phone) !== last4) return null
  return doc
}

/** The only shape of a request that ever leaves the server for customers. */
async function publicView(payload: Payload, doc: RequestDoc, locale: Locale) {
  const status = doc.status as RequestStatus
  const service = typeof doc.service === 'object' && doc.service ? { title: doc.service.title, slug: doc.service.slug } : null
  const trip =
    typeof doc.trip === 'object' && doc.trip
      ? { title: doc.trip.title, slug: doc.trip.slug, departureAt: doc.trip.departureAt, from: doc.trip.from, to: doc.trip.to, seats: doc.seats ?? 1 }
      : null

  let invoice = null
  if (doc.invoice?.amount && doc.invoice.amount > 0 && !['rejected', 'cancelled'].includes(status)) {
    const [settings, payments] = await Promise.all([
      payload.findGlobal({ slug: 'site-settings', locale, depth: 0, overrideAccess: true }),
      payload.find({ collection: 'payments', where: { request: { equals: doc.id } }, limit: 50, depth: 0, overrideAccess: true, sort: '-createdAt' }),
    ])
    invoice = {
      amount: doc.invoice.amount,
      currency: doc.invoice.currency ?? 'SAR',
      description: doc.invoice.description ?? null,
      dueDate: doc.invoice.dueDate ?? null,
      paid: doc.paidAmount ?? 0,
      status: doc.paymentStatus ?? 'unpaid',
      cardUrl: doc.invoice.cardPaymentUrl || null,
      allowBankTransfer: doc.invoice.allowBankTransfer !== false,
      allowCash: doc.invoice.allowCash !== false,
      bankAccounts:
        doc.invoice.allowBankTransfer !== false
          ? (settings.bankAccounts ?? [])
              .filter((a) => a.active !== false)
              .map((a) => ({ bank: a.bankName, holder: a.accountName, number: a.accountNumber, iban: a.iban ?? null, currency: a.currency ?? null, note: a.note ?? null }))
          : [],
      instructions: settings.paymentInstructions ?? null,
      payments: payments.docs.map((p) => ({
        reference: p.reference,
        amount: p.amount,
        currency: p.currency,
        method: p.method,
        status: p.status,
        at: p.createdAt,
        note: p.customerNote ?? null,
      })),
    }
  }

  return {
    reference: doc.reference,
    service,
    trip,
    submittedAt: doc.createdAt,
    updatedAt: doc.lastStatusAt ?? doc.updatedAt,
    status,
    statusLabel: STATUS_LABELS[status][locale],
    message: doc.customerMessage || STATUS_HINTS[status][locale],
    invoice,
    timeline: (doc.statusHistory ?? []).map((h) => ({
      status: h.to,
      label: h.to ? STATUS_LABELS[h.to as RequestStatus][locale] : '',
      at: h.at,
      message: h.customerMessage || null,
    })),
  }
}

const notFoundMsg = (locale: Locale) =>
  tr(locale, 'لم نجد طلباً بهذه البيانات. تأكد من رقم المرجع وآخر 4 أرقام من هاتفك.', 'No request matches these details. Check the reference and the last 4 digits of your phone.')

/** POST /api/requests/track — reference + last 4 digits of the phone. */
export const trackRequestEndpoint: Endpoint = {
  path: '/track',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    let body: { reference?: string; phone?: string; locale?: string } = {}
    try {
      body = await (req as unknown as Request).json()
    } catch {
      return json({ error: 'bad_request' }, 400)
    }
    const locale = asLocale(body.locale)
    const ip = clientIp(req.headers)
    const ref = normalizeReference(body.reference ?? '')
    const byIp = rateLimit(`track:${ip}`, 15, 10 * 60_000)
    const byRef = ref ? rateLimit(`track-ref:${ref}`, 10, 60 * 60_000) : { ok: true, retryAfter: 0 }
    if (!byIp.ok || !byRef.ok)
      return json({ error: 'rate_limited', message: tr(locale, 'محاولات كثيرة. حاول بعد قليل.', 'Too many attempts. Please try again shortly.') }, 429, {
        'Retry-After': String(Math.max(byIp.retryAfter, byRef.retryAfter)),
      })
    const doc = await findVerified(req.payload, body.reference, body.phone, locale)
    if (!doc) return json({ error: 'not_found', message: notFoundMsg(locale) }, 404)
    return json(await publicView(req.payload, doc, locale))
  },
}

/** POST /api/requests/track-many — up to 10 saved requests for the "My requests" page. */
export const trackManyEndpoint: Endpoint = {
  path: '/track-many',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    let body: { items?: { reference?: string; phone?: string }[]; locale?: string } = {}
    try {
      body = await (req as unknown as Request).json()
    } catch {
      return json({ error: 'bad_request' }, 400)
    }
    const locale = asLocale(body.locale)
    if (!rateLimit(`track-many:${clientIp(req.headers)}`, 20, 10 * 60_000).ok) return json({ error: 'rate_limited' }, 429)
    const items = (body.items ?? []).slice(0, 10)
    const results = await Promise.all(
      items.map(async (i) => {
        const doc = await findVerified(req.payload, i.reference, i.phone, locale)
        if (!doc) return { reference: normalizeReference(i.reference ?? ''), found: false as const }
        const v = await publicView(req.payload, doc, locale)
        return {
          found: true as const,
          reference: v.reference,
          title: v.trip?.title ?? v.service?.title ?? '',
          status: v.status,
          statusLabel: v.statusLabel,
          message: v.message,
          updatedAt: v.updatedAt,
          submittedAt: v.submittedAt,
          due: v.invoice && v.invoice.status !== 'paid' ? { amount: v.invoice.amount - v.invoice.paid, currency: v.invoice.currency } : null,
        }
      }),
    )
    return json({ results })
  },
}

/** POST /api/requests/book-trip — book seats on a scheduled trip. */
export const bookTripEndpoint: Endpoint = {
  path: '/book-trip',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    if (!rateLimit(`book:${clientIp(req.headers)}`, 8, 10 * 60_000).ok) return json({ error: 'rate_limited' }, 429)
    let body: { tripSlug?: string; seats?: unknown; locale?: string; idempotencyKey?: string; contact?: Record<string, unknown>; website?: string } = {}
    try {
      body = await (req as unknown as Request).json()
    } catch {
      return json({ error: 'bad_request' }, 400)
    }
    const locale = asLocale(body.locale)
    if (body.website) return json({ reference: 'EV-00-000000', ignored: true })
    const { payload } = req

    const idem = String(body.idempotencyKey ?? '').slice(0, 64)
    if (idem) {
      const dupe = await payload.find({ collection: 'requests', where: { idempotencyKey: { equals: idem } }, limit: 1, depth: 0, overrideAccess: true })
      if (dupe.docs[0]) return json({ reference: dupe.docs[0].reference, duplicate: true })
    }

    const found = await payload.find({
      collection: 'trips',
      where: { slug: { equals: String(body.tripSlug ?? '') }, status: { equals: 'published' } },
      locale,
      limit: 1,
      depth: 1,
      overrideAccess: true,
    })
    const trip = found.docs[0]
    if (!trip) return json({ error: 'not_found', message: tr(locale, 'الرحلة غير موجودة.', 'Trip not found.') }, 404)

    const errors: Record<string, string> = {}
    const contact = contactSchema(locale).safeParse(body.contact ?? {})
    if (!contact.success) for (const i of contact.error.issues) errors[`contact.${i.path.join('.')}`] = i.message
    const seats = Number(toLatinDigits(String(body.seats ?? '')))
    const max = trip.maxSeatsPerBooking ?? 10
    const avail = tripAvailability(trip)
    if (!Number.isInteger(seats) || seats < 1 || seats > max) errors.seats = tr(locale, `اختر من 1 إلى ${max} مقاعد`, `Choose 1 to ${max} seats`)
    if (['full', 'closed', 'departed'].includes(avail.state))
      return json({ error: 'unavailable', message: tr(locale, 'الحجز غير متاح لهذه الرحلة حالياً.', 'Booking is not available for this trip right now.') }, 409)
    if (avail.seatsLeft != null && seats > avail.seatsLeft)
      errors.seats = tr(locale, `المتبقي ${avail.seatsLeft} مقاعد فقط`, `Only ${avail.seatsLeft} seats left`)
    if (Object.keys(errors).length || !contact.success) return json({ error: 'validation', message: tr(locale, 'راجع الحقول المحددة.', 'Please check the highlighted fields.'), errors }, 422)

    const c = contact.data
    const phone = normalizePhone(c.phone)
    const wa = c.sameWhatsapp ? phone : normalizePhone(c.whatsapp ?? '')
    if (!phone.ok) return json({ error: 'validation', errors: { 'contact.phone': 'invalid' } }, 422)
    const customer = await upsertCustomer(payload, c.fullName, phone.e164, wa.ok ? wa.e164 : undefined, locale)
    const service = typeof trip.service === 'object' && trip.service ? trip.service.id : undefined

    const created = await payload.create({
      collection: 'requests',
      data: {
        contactName: c.fullName,
        phone: phone.e164,
        whatsapp: wa.ok ? wa.e164 : undefined,
        trip: trip.id,
        service,
        seats,
        customer: customer.id,
        answers: [
          { key: 'trip', label: tr(locale, 'الرحلة', 'Trip'), value: trip.title },
          { key: 'route', label: tr(locale, 'المسار', 'Route'), value: `${trip.from} ← ${trip.to}` },
          { key: 'departure', label: tr(locale, 'الانطلاق', 'Departure'), value: formatDate(trip.departureAt, locale, true) },
          { key: 'seats', label: tr(locale, 'المقاعد', 'Seats'), value: String(seats) },
        ],
        data: { tripSlug: trip.slug, seats },
        customerNotes: c.notes?.trim() || undefined,
        source: 'website',
        status: 'new',
        customerLocale: locale,
        travelDate: trip.departureAt.slice(0, 10),
        idempotencyKey: idem || undefined,
        // Pre-fill the amount from the trip price so staff only confirm it.
        invoice:
          trip.price?.mode && ['fixed', 'from'].includes(trip.price.mode) && trip.price.amount
            ? { amount: trip.price.amount * seats, currency: trip.price.currency ?? 'SAR', allowBankTransfer: true, allowCash: true }
            : undefined,
      },
      overrideAccess: true,
    })
    return json({ reference: created.reference }, 201)
  },
}

/** POST /api/requests/pay — customer reports a bank transfer and uploads the receipt. */
export const payRequestEndpoint: Endpoint = {
  path: '/pay',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    if (!rateLimit(`pay:${clientIp(req.headers)}`, 6, 10 * 60_000).ok) return json({ error: 'rate_limited' }, 429)
    let form: FormData
    try {
      form = await (req as unknown as Request).formData()
    } catch {
      return json({ error: 'bad_request' }, 400)
    }
    const locale = asLocale(form.get('locale'))
    const doc = await findVerified(req.payload, form.get('reference'), form.get('phone'), locale)
    if (!doc) return json({ error: 'not_found', message: notFoundMsg(locale) }, 404)
    if (!doc.invoice?.amount) return json({ error: 'no_invoice', message: tr(locale, 'لا يوجد مبلغ مطلوب لهذا الطلب بعد.', 'There is no amount due on this request yet.') }, 409)

    const errors: Record<string, string> = {}
    const method = form.get('method') === 'remittance' ? 'remittance' : 'bank_transfer'
    const amount = Number(toLatinDigits(String(form.get('amount') ?? '')).replace(/[^\d.]/g, ''))
    const payerName = String(form.get('payerName') ?? '').trim().slice(0, 120)
    const transferReference = String(form.get('transferReference') ?? '').trim().slice(0, 80)
    const toAccount = String(form.get('toAccount') ?? '').trim().slice(0, 120)
    if (!amount || amount <= 0) errors.amount = tr(locale, 'أدخل المبلغ المحوَّل', 'Enter the amount you sent')
    if (payerName.length < 2) errors.payerName = tr(locale, 'اكتب اسم المحوِّل', 'Enter the sender name')
    const file = form.get('receipt')
    let buf: Buffer | null = null
    let mime = ''
    if (!(file && typeof file === 'object' && 'arrayBuffer' in file && file.size > 0)) errors.receipt = tr(locale, 'ارفع صورة الإيصال', 'Upload the receipt')
    else if (file.size > MAX_DOCUMENT_BYTES) errors.receipt = tr(locale, 'الملف أكبر من 8 ميجابايت', 'File is larger than 8 MB')
    else {
      buf = Buffer.from(await file.arrayBuffer())
      const type = await fileTypeFromBuffer(buf)
      if (!type || !DOCUMENT_MIME_TYPES.includes(type.mime)) errors.receipt = tr(locale, 'ارفع صورة JPG أو PNG أو PDF', 'Upload a JPG, PNG or PDF')
      else mime = type.mime
    }
    if (Object.keys(errors).length) return json({ error: 'validation', errors }, 422)

    const ext = mime === 'application/pdf' ? 'pdf' : mime.split('/')[1].replace('jpeg', 'jpg')
    let receiptId: number | undefined
    try {
      const receipt = await req.payload.create({
        collection: 'request-documents',
        data: { request: doc.id, slot: 'payment_receipt', slotLabel: tr(locale, 'إيصال دفع', 'Payment receipt'), originalName: (file as File).name.slice(0, 120) },
        file: { data: buf!, mimetype: mime, name: `${doc.reference}-receipt-${randomBytes(6).toString('hex')}.${ext}`, size: buf!.length },
        overrideAccess: true,
      })
      receiptId = receipt.id as number
    } catch {
      return json({ error: 'validation', errors: { receipt: tr(locale, 'تعذّرت قراءة الملف. جرّب صورة أخرى.', 'We could not read this file. Try another photo.') } }, 422)
    }
    const payment = await req.payload.create({
      collection: 'payments',
      data: {
        request: doc.id,
        amount,
        currency: doc.invoice.currency ?? 'SAR',
        method,
        status: 'pending_review',
        payerName,
        transferReference: transferReference || undefined,
        toAccount: toAccount || undefined,
        receipt: receiptId,
        source: 'customer',
      },
      overrideAccess: true,
    })
    return json({ ok: true, paymentReference: payment.reference }, 201)
  },
}

export { STATUS_LABELS }
