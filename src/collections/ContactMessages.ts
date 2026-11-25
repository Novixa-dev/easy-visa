import type { CollectionConfig, Endpoint } from 'payload'
import { isOwner, staffOnly } from '@/access'
import { L } from '@/fields/common'
import { audited } from '@/hooks/audit'
import { normalizePhone } from '@/lib/phone'
import { clientIp, rateLimit } from '@/lib/rate-limit'

const SUBJECTS = ['general', 'visa', 'booking', 'trip', 'payment', 'complaint', 'other'] as const

const submit: Endpoint = {
  path: '/submit',
  method: 'post',
  handler: async (req) => {
    const ip = clientIp(req.headers)
    if (!rateLimit(`contact:${ip}`, 5, 10 * 60_000).ok) return Response.json({ error: 'rate_limited' }, { status: 429 })
    let b: Record<string, unknown> = {}
    try {
      b = await (req as unknown as Request).json()
    } catch {
      return Response.json({ error: 'bad_request' }, { status: 400 })
    }
    const locale = b.locale === 'en' ? 'en' : 'ar'
    if (b.website) return Response.json({ ok: true })
    const errors: Record<string, string> = {}
    const ar = locale === 'ar'
    const name = String(b.name ?? '').trim()
    const message = String(b.message ?? '').trim()
    const phone = normalizePhone(String(b.phone ?? ''))
    const email = String(b.email ?? '').trim()
    if (name.length < 2 || name.length > 120) errors.name = ar ? 'اكتب اسمك' : 'Enter your name'
    if (!phone.ok) errors.phone = ar ? 'أدخل رقم هاتف صحيح' : 'Enter a valid phone number'
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = ar ? 'بريد غير صحيح' : 'Invalid email'
    if (message.length < 5 || message.length > 3000) errors.message = ar ? 'اكتب رسالتك (5 أحرف على الأقل)' : 'Write your message (at least 5 characters)'
    if (b.consent !== true) errors.consent = ar ? 'يلزم الموافقة' : 'Consent is required'
    if (Object.keys(errors).length) return Response.json({ error: 'validation', errors }, { status: 422 })
    const subject = SUBJECTS.includes(b.subject as (typeof SUBJECTS)[number]) ? (b.subject as (typeof SUBJECTS)[number]) : 'general'
    await req.payload.create({
      collection: 'contact-messages',
      data: { name, phone: phone.ok ? phone.e164 : '', email: email || undefined, subject, message, locale, status: 'new', pageUrl: String(b.pageUrl ?? '').slice(0, 300) },
      overrideAccess: true,
    })
    return Response.json({ ok: true }, { status: 201 })
  },
}

export const ContactMessages: CollectionConfig = {
  slug: 'contact-messages',
  labels: { singular: L('رسالة', 'Message'), plural: L('رسائل التواصل', 'Contact messages') },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'phone', 'subject', 'status', 'createdAt'], group: L('العمليات', 'Operations'), listSearchableFields: ['name', 'phone', 'message'] },
  defaultSort: '-createdAt',
  access: { read: staffOnly, create: staffOnly, update: staffOnly, delete: ({ req }) => isOwner(req) },
  endpoints: [submit],
  hooks: audited,
  fields: [
    { name: 'whatsappActions', type: 'ui', admin: { components: { Field: '@/components/admin/MessageActions#MessageActions' } } },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, label: L('الاسم', 'Name') },
        { name: 'phone', type: 'text', required: true, label: L('الهاتف', 'Phone') },
        { name: 'email', type: 'email', label: L('البريد', 'Email') },
      ],
    },
    {
      name: 'subject',
      type: 'select',
      defaultValue: 'general',
      label: L('الموضوع', 'Subject'),
      options: [
        { label: L('استفسار عام', 'General question'), value: 'general' },
        { label: L('تأشيرة', 'Visa'), value: 'visa' },
        { label: L('حجز', 'Booking'), value: 'booking' },
        { label: L('رحلة', 'Trip'), value: 'trip' },
        { label: L('دفع', 'Payment'), value: 'payment' },
        { label: L('شكوى أو ملاحظة', 'Complaint or feedback'), value: 'complaint' },
        { label: L('أخرى', 'Other'), value: 'other' },
      ],
    },
    { name: 'message', type: 'textarea', required: true, label: L('الرسالة', 'Message') },
    { name: 'reply', type: 'textarea', label: L('الرد / ملاحظة المتابعة', 'Reply / follow-up note') },
    { name: 'pageUrl', type: 'text', label: L('أُرسلت من صفحة', 'Sent from page'), admin: { readOnly: true } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      index: true,
      label: L('الحالة', 'Status'),
      options: [
        { label: L('جديدة', 'New'), value: 'new' },
        { label: L('تم الرد', 'Replied'), value: 'replied' },
        { label: L('مغلقة', 'Closed'), value: 'closed' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'handledBy', type: 'relationship', relationTo: 'users', label: L('المسؤول', 'Handled by'), admin: { position: 'sidebar' } },
    { name: 'locale', type: 'select', defaultValue: 'ar', options: [{ label: 'العربية', value: 'ar' }, { label: 'English', value: 'en' }], label: L('اللغة', 'Language'), admin: { position: 'sidebar' } },
  ],
}
