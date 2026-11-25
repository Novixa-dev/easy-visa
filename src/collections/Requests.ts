import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { isOwner, staffOnly } from '@/access'
import { L } from '@/fields/common'
import { audited } from '@/hooks/audit'
import { REQUEST_SOURCES, REQUEST_STATUSES, STATUS_LABELS } from '@/lib/constants'
import { generateReference } from '@/lib/reference'
import { normalizePhone } from '@/lib/phone'
import { notifyNewRequest } from '@/hooks/notify'
import { bookTripEndpoint, payRequestEndpoint, submitRequestEndpoint, trackManyEndpoint, trackRequestEndpoint } from '@/endpoints/requests'
import { recountTripSeats } from './Trips'
import { exportEndpoint } from '@/endpoints/export'

const statusOptions = REQUEST_STATUSES.map((s) => ({ label: STATUS_LABELS[s], value: s }))

const beforeChange: CollectionBeforeChangeHook = async ({ data, originalDoc, operation, req }) => {
  const now = new Date().toISOString()
  const userId = req.user && req.user.collection === 'users' ? req.user.id : undefined

  if (operation === 'create') {
    if (!data.reference) {
      // Retry on the (very unlikely) collision.
      for (let i = 0; i < 5; i++) {
        const ref = generateReference()
        const exists = await req.payload.count({ collection: 'requests', where: { reference: { equals: ref } }, overrideAccess: true, req })
        if (exists.totalDocs === 0) {
          data.reference = ref
          break
        }
      }
    }
    data.status ??= 'new'
    data.statusHistory = [{ to: data.status, at: now, by: userId, customerMessage: data.customerMessage }]
    data.lastStatusAt = now
  }

  if (operation === 'update' && originalDoc && data.status && data.status !== originalDoc.status) {
    data.statusHistory = [
      ...(originalDoc.statusHistory ?? []),
      { from: originalDoc.status, to: data.status, at: now, by: userId, customerMessage: data.customerMessage || undefined },
    ]
    data.lastStatusAt = now
  }

  // Stamp author and time on newly added internal notes / contact attempts.
  for (const key of ['internalNotes', 'contactLog'] as const) {
    if (Array.isArray(data[key])) {
      data[key] = data[key].map((row: Record<string, unknown>) => ({ ...row, at: row.at || now, by: row.by || userId }))
    }
  }

  for (const key of ['phone', 'whatsapp'] as const) {
    if (data[key]) {
      const p = normalizePhone(String(data[key]))
      if (p.ok) data[key] = p.e164
    }
  }
  return data
}

export const Requests: CollectionConfig = {
  slug: 'requests',
  labels: { singular: L('طلب', 'Request'), plural: L('الطلبات', 'Requests') },
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'contactName', 'service', 'trip', 'status', 'paymentStatus', 'assignedTo', 'createdAt'],
    group: L('العمليات', 'Operations'),
    listSearchableFields: ['reference', 'contactName', 'phone'],
    pagination: { defaultLimit: 25 },
  },
  defaultSort: '-createdAt',
  access: { read: staffOnly, create: staffOnly, update: staffOnly, delete: ({ req }) => isOwner(req) },
  endpoints: [submitRequestEndpoint, trackRequestEndpoint, trackManyEndpoint, bookTripEndpoint, payRequestEndpoint, exportEndpoint],
  hooks: {
    beforeChange: [beforeChange],
    afterChange: [
      ...audited.afterChange,
      notifyNewRequest,
      // Keep trip seat counts accurate when a booking is created, cancelled or moved.
      async ({ doc, previousDoc, req }) => {
        const ids = new Set<string | number>()
        const id = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number | undefined))
        if (id(doc.trip)) ids.add(id(doc.trip)!)
        if (id(previousDoc?.trip)) ids.add(id(previousDoc.trip)!)
        const changed = !previousDoc || previousDoc.status !== doc.status || previousDoc.seats !== doc.seats || id(previousDoc.trip) !== id(doc.trip)
        if (changed) for (const t of ids) await recountTripSeats(req.payload, t, req).catch((err) => req.payload.logger.error({ err, msg: 'seat recount failed' }))
        // Amount changed: refresh payment summary.
        if (previousDoc && previousDoc.invoice?.amount !== doc.invoice?.amount && !req.context?.skipPaymentSync) {
          const due = doc.invoice?.amount ?? 0
          const paid = doc.paidAmount ?? 0
          const paymentStatus = due > 0 && paid >= due ? 'paid' : paid > 0 ? 'partial' : due > 0 ? 'unpaid' : 'none'
          if (paymentStatus !== doc.paymentStatus)
            await req.payload.update({ collection: 'requests', id: doc.id, data: { paymentStatus }, overrideAccess: true, req, context: { skipAudit: true, skipPaymentSync: true } })
        }
        return doc
      },
    ],
    afterDelete: audited.afterDelete,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: L('الطلب', 'Request'),
          fields: [
            { name: 'whatsappActions', type: 'ui', admin: { components: { Field: '@/components/admin/WhatsAppActions#WhatsAppActions' } } },
            {
              type: 'row',
              fields: [
                { name: 'contactName', type: 'text', required: true, label: L('اسم العميل', 'Customer name') },
                { name: 'phone', type: 'text', required: true, index: true, label: L('الهاتف', 'Phone'), validate: (v: unknown) => (normalizePhone(String(v ?? '')).ok ? true : 'Invalid phone number') },
                { name: 'whatsapp', type: 'text', label: L('واتساب', 'WhatsApp') },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'service', type: 'relationship', relationTo: 'services', index: true, label: L('الخدمة', 'Service') },
                {
                  name: 'trip',
                  type: 'relationship',
                  relationTo: 'trips',
                  index: true,
                  label: L('الرحلة', 'Trip'),
                  admin: { description: L('لحجوزات الرحلات المجدولة فقط', 'For scheduled trip bookings only') },
                },
                { name: 'seats', type: 'number', min: 1, label: L('عدد المقاعد', 'Seats'), admin: { condition: (d) => Boolean(d?.trip) } },
              ],
            },
            {
              name: 'answers',
              type: 'array',
              label: L('تفاصيل الطلب', 'Request details'),
              labels: { singular: L('بند', 'Item'), plural: L('بنود', 'Items') },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', label: L('السؤال', 'Question') },
                    { name: 'value', type: 'text', label: L('الإجابة', 'Answer') },
                  ],
                },
                { name: 'key', type: 'text', admin: { hidden: true } },
              ],
            },
            { name: 'customerNotes', type: 'textarea', label: L('ملاحظات العميل', 'Customer notes') },
            {
              name: 'documents',
              type: 'join',
              collection: 'request-documents',
              on: 'request',
              label: L('المستندات المرفوعة', 'Uploaded documents'),
            },
            { name: 'data', type: 'json', label: L('البيانات الخام', 'Raw data'), admin: { readOnly: true, condition: () => false } },
          ],
        },
        {
          label: L('المتابعة', 'Follow-up'),
          fields: [
            {
              name: 'customerMessage',
              type: 'textarea',
              label: L('رسالة تظهر للعميل في صفحة التتبع', 'Message the customer sees on the tracking page'),
              admin: { description: L('اكتبها بلغة العميل. تُحفظ مع تغيير الحالة.', "Write it in the customer's language. Saved with the status change.") },
            },
            {
              name: 'internalNotes',
              type: 'array',
              label: L('ملاحظات داخلية (لا يراها العميل)', 'Internal notes (never shown to the customer)'),
              labels: { singular: L('ملاحظة', 'Note'), plural: L('ملاحظات', 'Notes') },
              fields: [
                { name: 'note', type: 'textarea', required: true, label: L('الملاحظة', 'Note') },
                { type: 'row', fields: [
                  { name: 'by', type: 'relationship', relationTo: 'users', label: L('بواسطة', 'By'), admin: { readOnly: true } },
                  { name: 'at', type: 'date', label: L('التاريخ', 'Date'), admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
                ] },
              ],
            },
            {
              name: 'contactLog',
              type: 'array',
              label: L('محاولات التواصل', 'Contact attempts'),
              labels: { singular: L('محاولة', 'Attempt'), plural: L('محاولات', 'Attempts') },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'channel',
                      type: 'select',
                      required: true,
                      defaultValue: 'whatsapp',
                      label: L('الوسيلة', 'Channel'),
                      options: [
                        { label: L('واتساب', 'WhatsApp'), value: 'whatsapp' },
                        { label: L('اتصال', 'Phone call'), value: 'call' },
                        { label: L('حضوري', 'In person'), value: 'in_person' },
                        { label: L('بريد', 'Email'), value: 'email' },
                      ],
                    },
                    {
                      name: 'outcome',
                      type: 'select',
                      required: true,
                      defaultValue: 'reached',
                      label: L('النتيجة', 'Outcome'),
                      options: [
                        { label: L('تم التواصل', 'Reached'), value: 'reached' },
                        { label: L('لم يرد', 'No answer'), value: 'no_answer' },
                        { label: L('ترك رسالة', 'Left a message'), value: 'left_message' },
                      ],
                    },
                  ],
                },
                { name: 'note', type: 'text', label: L('ملاحظة', 'Note') },
                { type: 'row', fields: [
                  { name: 'by', type: 'relationship', relationTo: 'users', label: L('بواسطة', 'By'), admin: { readOnly: true } },
                  { name: 'at', type: 'date', label: L('التاريخ', 'Date'), admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
                ] },
              ],
            },
          ],
        },
        {
          label: L('الفاتورة والدفع', 'Invoice & payment'),
          description: L(
            'أدخل المبلغ المطلوب بعد الاتفاق مع العميل؛ سيظهر له في صفحة التتبع مع طرق الدفع.',
            'Enter the amount once agreed with the customer; they will see it on the tracking page with the payment options.',
          ),
          fields: [
            {
              name: 'invoice',
              type: 'group',
              label: L('المبلغ المطلوب', 'Amount due'),
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'amount', type: 'number', min: 0, label: L('المبلغ', 'Amount') },
                    { name: 'currency', type: 'select', defaultValue: 'SAR', options: ['SAR', 'YER', 'USD'].map((c) => ({ label: c, value: c })), label: L('العملة', 'Currency') },
                    { name: 'dueDate', type: 'date', label: L('آخر موعد للدفع', 'Pay by'), admin: { date: { pickerAppearance: 'dayOnly' } } },
                  ],
                },
                { name: 'description', type: 'textarea', label: L('وصف ما يشمله المبلغ (يراه العميل)', 'What the amount covers (customer sees this)') },
                {
                  type: 'row',
                  fields: [
                    { name: 'allowBankTransfer', type: 'checkbox', defaultValue: true, label: L('السماح بالتحويل البنكي', 'Allow bank transfer') },
                    { name: 'allowCash', type: 'checkbox', defaultValue: true, label: L('السماح بالدفع في المكتب', 'Allow paying at the office') },
                  ],
                },
                {
                  name: 'cardPaymentUrl',
                  type: 'text',
                  label: L('رابط الدفع بالبطاقة', 'Card payment link'),
                  admin: {
                    description: L(
                      'رابط دفع آمن من بوابة الدفع أو البنك (فيزا/ماستركارد). لا يدخل العميل بيانات بطاقته في هذا الموقع.',
                      'A secure checkout link from your payment gateway or bank (Visa/Mastercard). Customers never enter card details on this site.',
                    ),
                  },
                  validate: (v: unknown) => (!v || /^https:\/\/\S+$/.test(String(v)) ? true : 'Must start with https://'),
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'paidAmount', type: 'number', defaultValue: 0, label: L('المدفوع (مؤكد)', 'Paid (confirmed)'), admin: { readOnly: true } },
                {
                  name: 'paymentStatus',
                  type: 'select',
                  defaultValue: 'none',
                  index: true,
                  label: L('حالة الدفع', 'Payment status'),
                  admin: { readOnly: true },
                  options: [
                    { label: L('لا يوجد مبلغ', 'No amount'), value: 'none' },
                    { label: L('غير مدفوع', 'Unpaid'), value: 'unpaid' },
                    { label: L('دفعة بانتظار التحقق', 'Payment awaiting check'), value: 'pending_review' },
                    { label: L('مدفوع جزئياً', 'Partly paid'), value: 'partial' },
                    { label: L('مدفوع بالكامل', 'Paid in full'), value: 'paid' },
                  ],
                },
              ],
            },
            { name: 'payments', type: 'join', collection: 'payments', on: 'request', label: L('الدفعات', 'Payments'), admin: { defaultColumns: ['amount', 'currency', 'method', 'status', 'createdAt'] } },
          ],
        },
        {
          label: L('سجل الحالات', 'Status history'),
          fields: [
            {
              name: 'statusHistory',
              type: 'array',
              label: L('سجل الحالات', 'Status history'),
              admin: { readOnly: true },
              access: { create: () => false, update: () => false },
              fields: [
                { type: 'row', fields: [
                  { name: 'from', type: 'select', options: statusOptions, label: L('من', 'From') },
                  { name: 'to', type: 'select', options: statusOptions, label: L('إلى', 'To') },
                  { name: 'at', type: 'date', label: L('التاريخ', 'Date'), admin: { date: { pickerAppearance: 'dayAndTime' } } },
                  { name: 'by', type: 'relationship', relationTo: 'users', label: L('بواسطة', 'By') },
                ] },
                { name: 'customerMessage', type: 'textarea', label: L('رسالة للعميل', 'Customer message') },
              ],
            },
          ],
        },
      ],
    },
    // Sidebar
    {
      name: 'reference',
      type: 'text',
      unique: true,
      index: true,
      label: L('رقم المرجع', 'Reference'),
      admin: { position: 'sidebar', readOnly: true, description: L('يُنشأ تلقائياً', 'Generated automatically') },
    },
    { name: 'status', type: 'select', required: true, defaultValue: 'new', index: true, options: statusOptions, label: L('الحالة', 'Status'), admin: { position: 'sidebar' } },
    { name: 'assignedTo', type: 'relationship', relationTo: 'users', index: true, label: L('الموظف المسؤول', 'Assigned to'), admin: { position: 'sidebar' } },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'website',
      index: true,
      label: L('المصدر', 'Source'),
      options: REQUEST_SOURCES.map((s) => ({
        value: s,
        label: { website: L('الموقع', 'Website'), whatsapp: L('واتساب (يدوي)', 'WhatsApp (manual)'), phone: L('اتصال هاتفي', 'Phone call'), walk_in: L('حضوري', 'Walk-in') }[s],
      })),
      admin: { position: 'sidebar' },
    },
    { name: 'customer', type: 'relationship', relationTo: 'customers', index: true, label: L('ملف العميل', 'Customer record'), admin: { position: 'sidebar' } },
    { name: 'travelDate', type: 'date', index: true, label: L('تاريخ السفر', 'Travel date'), admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } } },
    {
      name: 'customerLocale',
      type: 'select',
      defaultValue: 'ar',
      label: L('لغة العميل', 'Customer language'),
      options: [
        { label: 'العربية', value: 'ar' },
        { label: 'English', value: 'en' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'lastStatusAt', type: 'date', label: L('آخر تحديث للحالة', 'Last status change'), admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'idempotencyKey', type: 'text', unique: true, admin: { hidden: true } },
  ],
}
