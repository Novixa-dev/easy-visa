import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'
import { isOwner, staffOnly } from '@/access'
import { L } from '@/fields/common'
import { audited } from '@/hooks/audit'
import { CURRENCIES } from '@/lib/constants'

export const PAYMENT_STATUSES = ['pending_review', 'paid', 'rejected', 'refunded'] as const

/** Keep the request's payment summary in sync whenever a payment changes. */
const syncRequest: CollectionAfterChangeHook = async ({ doc, req }) => {
  const requestId = typeof doc.request === 'object' ? doc.request?.id : doc.request
  if (!requestId) return doc
  const all = await req.payload.find({ collection: 'payments', where: { request: { equals: requestId } }, limit: 200, depth: 0, overrideAccess: true, req })
  const paid = all.docs.filter((p) => p.status === 'paid').reduce((a, p) => a + (p.amount ?? 0), 0)
  const pending = all.docs.some((p) => p.status === 'pending_review')
  const r = await req.payload.findByID({ collection: 'requests', id: requestId, depth: 0, overrideAccess: true, req })
  const due = r.invoice?.amount ?? 0
  const paymentStatus = due > 0 && paid >= due ? 'paid' : paid > 0 ? 'partial' : pending ? 'pending_review' : due > 0 ? 'unpaid' : 'none'
  await req.payload.update({ collection: 'requests', id: requestId, data: { paidAmount: paid, paymentStatus }, overrideAccess: true, req, context: { skipAudit: true } })
  return doc
}

export const Payments: CollectionConfig = {
  slug: 'payments',
  labels: { singular: L('دفعة', 'Payment'), plural: L('المدفوعات', 'Payments') },
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'request', 'amount', 'currency', 'method', 'status', 'createdAt'],
    group: L('العمليات', 'Operations'),
    description: L(
      'تحقّق من وصول التحويل في حسابك البنكي قبل تحويل الحالة إلى «مدفوع».',
      'Confirm the transfer reached your bank account before marking a payment as paid.',
    ),
  },
  defaultSort: '-createdAt',
  access: { read: staffOnly, create: staffOnly, update: staffOnly, delete: ({ req }) => isOwner(req) },
  hooks: {
    beforeChange: [
      ({ data, originalDoc, req }) => {
        if (data.status === 'paid' && originalDoc?.status !== 'paid') {
          data.paidAt ??= new Date().toISOString()
          if (req.user?.collection === 'users') data.reviewedBy = req.user.id
        }
        data.reference ??= `PAY-${Date.now().toString(36).toUpperCase()}`
        return data
      },
    ],
    afterChange: [...audited.afterChange, syncRequest],
    afterDelete: audited.afterDelete,
  },
  fields: [
    { name: 'request', type: 'relationship', relationTo: 'requests', required: true, index: true, label: L('الطلب', 'Request') },
    {
      type: 'row',
      fields: [
        { name: 'amount', type: 'number', required: true, min: 0, label: L('المبلغ', 'Amount') },
        { name: 'currency', type: 'select', required: true, defaultValue: 'SAR', options: CURRENCIES.map((c) => ({ label: c, value: c })), label: L('العملة', 'Currency') },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'method',
          type: 'select',
          required: true,
          defaultValue: 'bank_transfer',
          label: L('طريقة الدفع', 'Method'),
          options: [
            { label: L('تحويل بنكي', 'Bank transfer'), value: 'bank_transfer' },
            { label: L('بطاقة (فيزا/ماستركارد)', 'Card (Visa/Mastercard)'), value: 'card' },
            { label: L('حوالة / صرافة', 'Money transfer / exchange'), value: 'remittance' },
            { label: L('نقداً في المكتب', 'Cash at the office'), value: 'cash' },
          ],
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'pending_review',
          index: true,
          label: L('الحالة', 'Status'),
          options: [
            { label: L('بانتظار التحقق', 'Awaiting check'), value: 'pending_review' },
            { label: L('مدفوع', 'Paid'), value: 'paid' },
            { label: L('مرفوض', 'Rejected'), value: 'rejected' },
            { label: L('مسترد', 'Refunded'), value: 'refunded' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'payerName', type: 'text', label: L('اسم المحوِّل', 'Payer name') },
        { name: 'transferReference', type: 'text', label: L('رقم العملية / الحوالة', 'Transfer / transaction number') },
        { name: 'toAccount', type: 'text', label: L('إلى حساب', 'To account') },
      ],
    },
    { name: 'receipt', type: 'relationship', relationTo: 'request-documents', label: L('صورة الإيصال', 'Receipt') },
    { name: 'note', type: 'textarea', label: L('ملاحظة داخلية', 'Internal note') },
    { name: 'customerNote', type: 'text', label: L('رسالة للعميل', 'Message to customer'), admin: { description: L('تظهر في صفحة التتبع، مثل سبب الرفض', 'Shown on the tracking page, e.g. why it was rejected') } },
    { name: 'reference', type: 'text', unique: true, label: L('مرجع الدفعة', 'Payment reference'), admin: { position: 'sidebar', readOnly: true } },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'staff',
      label: L('أُضيفت بواسطة', 'Added by'),
      options: [
        { label: L('العميل (من الموقع)', 'Customer (website)'), value: 'customer' },
        { label: L('الموظف', 'Staff'), value: 'staff' },
      ],
      admin: { position: 'sidebar', readOnly: true },
    },
    { name: 'paidAt', type: 'date', label: L('تاريخ التأكيد', 'Confirmed on'), admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'reviewedBy', type: 'relationship', relationTo: 'users', label: L('أكدها', 'Confirmed by'), admin: { position: 'sidebar', readOnly: true } },
  ],
}
