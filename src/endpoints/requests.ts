import { randomBytes } from 'node:crypto'
import { fileTypeFromBuffer } from 'file-type'
import type { Endpoint, PayloadRequest } from 'payload'
import { DOCUMENT_MIME_TYPES, MAX_DOCUMENTS, MAX_DOCUMENT_BYTES, type Locale } from '@/lib/constants'
import { contactSchema, sanitizeValues, validateAll, type FormFieldDef } from '@/lib/form-schema'
import { normalizePhone } from '@/lib/phone'
import { clientIp, rateLimit } from '@/lib/rate-limit'

const json = (body: unknown, status = 200, headers?: Record<string, string>) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } })

const asLocale = (v: unknown): Locale => (v === 'en' ? 'en' : 'ar')

const t = (locale: Locale, ar: string, en: string) => (locale === 'ar' ? ar : en)

/** POST /api/requests/submit — multipart form from the public request wizard. */
export const submitRequestEndpoint: Endpoint = {
  path: '/submit',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    const ip = clientIp(req.headers)
    const limited = rateLimit(`submit:${ip}`, 8, 10 * 60_000)
    if (!limited.ok)
      return json({ error: 'rate_limited', message: 'Too many requests. Please wait a few minutes.' }, 429, { 'Retry-After': String(limited.retryAfter) })

    let form: FormData
    try {
      form = await (req as unknown as Request).formData()
    } catch {
      return json({ error: 'bad_request' }, 400)
    }

    let body: {
      serviceSlug?: string
      locale?: string
      idempotencyKey?: string
      contact?: Record<string, unknown>
      values?: Record<string, unknown>
      website?: string // honeypot
    }
    try {
      body = JSON.parse(String(form.get('payload') ?? '{}'))
    } catch {
      return json({ error: 'bad_request' }, 400)
    }
    const locale = asLocale(body.locale)

    // Bots fill hidden fields; pretend success without storing anything.
    if (body.website) return json({ reference: 'EV-00-000000', ignored: true })

    const { payload } = req
    const svc = await payload.find({
      collection: 'services',
      where: { slug: { equals: String(body.serviceSlug ?? '') }, status: { equals: 'published' } },
      locale,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const service = svc.docs[0]
    if (!service) return json({ error: 'service_not_found', message: t(locale, 'الخدمة غير موجودة.', 'Service not found.') }, 404)
    if (service.available === false)
      return json({ error: 'service_unavailable', message: t(locale, 'هذه الخدمة لا تستقبل طلبات حالياً.', 'This service is not accepting requests right now.') }, 409)

    // Duplicate-submission protection (double taps, retries on bad connections).
    const idem = String(body.idempotencyKey ?? '').slice(0, 64)
    if (idem) {
      const dupe = await payload.find({ collection: 'requests', where: { idempotencyKey: { equals: idem } }, limit: 1, depth: 0, overrideAccess: true })
      if (dupe.docs[0]) return json({ reference: dupe.docs[0].reference, duplicate: true })
    }

    const contact = contactSchema(locale).safeParse(body.contact ?? {})
    const fields = (service.formFields ?? []) as unknown as FormFieldDef[]
    const values = (body.values ?? {}) as Record<string, unknown>
    const fieldErrors = validateAll(fields, values, locale)
    const errors: Record<string, string> = { ...fieldErrors }
    if (!contact.success) for (const i of contact.error.issues) errors[`contact.${i.path.join('.')}`] = i.message

    // Documents
    const slots = (service.documentSlots ?? []) as { key: string; label: string; required?: boolean | null }[]
    const files: { slot: (typeof slots)[number]; file: File; buf: Buffer; mime: string }[] = []
    let count = 0
    for (const slot of slots) {
      const entries = form.getAll(`doc_${slot.key}`).filter((f): f is File => typeof f === 'object' && f !== null && 'arrayBuffer' in f && f.size > 0)
      if (slot.required && entries.length === 0) errors[`doc.${slot.key}`] = t(locale, 'هذا المستند مطلوب', 'This document is required')
      for (const file of entries) {
        if (++count > MAX_DOCUMENTS) {
          errors[`doc.${slot.key}`] = t(locale, `الحد الأقصى ${MAX_DOCUMENTS} ملفات`, `Maximum ${MAX_DOCUMENTS} files`)
          break
        }
        if (file.size > MAX_DOCUMENT_BYTES) {
          errors[`doc.${slot.key}`] = t(locale, 'حجم الملف أكبر من 8 ميجابايت', 'File is larger than 8 MB')
          continue
        }
        const buf = Buffer.from(await file.arrayBuffer())
        const type = await fileTypeFromBuffer(buf) // real type from file contents, not the name
        if (!type || !DOCUMENT_MIME_TYPES.includes(type.mime)) {
          errors[`doc.${slot.key}`] = t(locale, 'نوع الملف غير مسموح. ارفع صورة JPG أو PNG أو ملف PDF.', 'File type not allowed. Upload a JPG, PNG or PDF.')
          continue
        }
        files.push({ slot, file, buf, mime: type.mime })
      }
    }

    if (Object.keys(errors).length || !contact.success)
      return json({ error: 'validation', message: t(locale, 'راجع الحقول المحددة.', 'Please check the highlighted fields.'), errors }, 422)

    const c = contact.data
    const phone = normalizePhone(c.phone)
    const whatsapp = c.sameWhatsapp ? phone : normalizePhone(c.whatsapp ?? '')
    if (!phone.ok) return json({ error: 'validation', errors: { 'contact.phone': 'invalid' } }, 422)

    const clean = sanitizeValues(fields, values)

    // Human-readable answers snapshot for staff, in the customer's language.
    const destinationIds = fields.filter((f) => f.type === 'destination').map((f) => clean[f.name]).filter(Boolean)
    const destNames = new Map<string, string>()
    if (destinationIds.length) {
      const d = await payload.find({ collection: 'destinations', where: { code: { in: destinationIds.map(String) } }, locale, limit: 50, depth: 0, overrideAccess: true })
      d.docs.forEach((x) => destNames.set(x.code, x.name))
    }
    const answers = fields
      .filter((f) => clean[f.name] !== undefined)
      .map((f) => {
        const raw = clean[f.name]
        let value = String(raw)
        if (f.type === 'select' || f.type === 'radio') value = f.options?.find((o) => o.value === raw)?.label ?? value
        if (f.type === 'destination') value = destNames.get(String(raw)) ?? value
        if (f.type === 'checkbox') value = raw ? t(locale, 'نعم', 'Yes') : t(locale, 'لا', 'No')
        return { key: f.name, label: f.label, value }
      })

    const travelKey = ['travelDate', 'departureDate', 'checkIn'].find((k) => typeof clean[k] === 'string')

    // Customer record keyed by phone number.
    const existing = await payload.find({ collection: 'customers', where: { phone: { equals: phone.e164 } }, limit: 1, depth: 0, overrideAccess: true })
    const customer = existing.docs[0]
      ? await payload.update({
          collection: 'customers',
          id: existing.docs[0].id,
          data: { fullName: c.fullName, whatsapp: whatsapp.ok && whatsapp.e164 !== phone.e164 ? whatsapp.e164 : existing.docs[0].whatsapp, preferredLocale: locale },
          overrideAccess: true,
          context: { skipAudit: true },
        })
      : await payload.create({
          collection: 'customers',
          data: { fullName: c.fullName, phone: phone.e164, whatsapp: whatsapp.ok && whatsapp.e164 !== phone.e164 ? whatsapp.e164 : undefined, preferredLocale: locale },
          overrideAccess: true,
        })

    const created = await payload.create({
      collection: 'requests',
      data: {
        contactName: c.fullName,
        phone: phone.e164,
        whatsapp: whatsapp.ok ? whatsapp.e164 : undefined,
        service: service.id,
        customer: customer.id,
        answers,
        data: clean,
        customerNotes: c.notes?.trim() || undefined,
        source: 'website',
        status: 'new',
        customerLocale: locale,
        travelDate: travelKey ? String(clean[travelKey]) : undefined,
        idempotencyKey: idem || undefined,
      },
      overrideAccess: true,
    })

    // A broken file must not lose the whole request: keep the request, flag the file.
    const failedDocs: string[] = []
    for (const f of files) {
      const ext = f.mime === 'application/pdf' ? 'pdf' : f.mime.split('/')[1].replace('jpeg', 'jpg')
      try {
        await payload.create({
          collection: 'request-documents',
          data: { request: created.id, slot: f.slot.key, slotLabel: f.slot.label, originalName: f.file.name.slice(0, 120) },
          file: { data: f.buf, mimetype: f.mime, name: `${created.reference}-${f.slot.key}-${randomBytes(6).toString('hex')}.${ext}`, size: f.buf.length },
          overrideAccess: true,
        })
      } catch (err) {
        payload.logger.warn({ err, msg: `document rejected for ${created.reference}` })
        failedDocs.push(f.slot.label)
      }
    }
    if (failedDocs.length) {
      await payload.update({
        collection: 'requests',
        id: created.id,
        data: { internalNotes: [{ note: `تعذّر حفظ ملفات: ${failedDocs.join('، ')}. اطلبها من العميل عبر واتساب.` }] },
        overrideAccess: true,
        context: { skipAudit: true },
      })
    }

    return json({ reference: created.reference, failedDocuments: failedDocs }, 201)
  },
}


export { trackRequestEndpoint, trackManyEndpoint, bookTripEndpoint, payRequestEndpoint } from './public-requests'
