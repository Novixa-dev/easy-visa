import type { CollectionConfig } from 'payload'
import { isOwner, staffOnly } from '@/access'
import { L } from '@/fields/common'
import { audited } from '@/hooks/audit'
import { normalizePhone } from '@/lib/phone'

export const Customers: CollectionConfig = {
  slug: 'customers',
  labels: { singular: L('عميل', 'Customer'), plural: L('العملاء', 'Customers') },
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'phone', 'preferredLocale', 'createdAt'],
    group: L('العمليات', 'Operations'),
    listSearchableFields: ['fullName', 'phone', 'whatsapp'],
  },
  access: { read: staffOnly, create: staffOnly, update: staffOnly, delete: ({ req }) => isOwner(req) },
  hooks: audited,
  fields: [
    { name: 'fullName', type: 'text', required: true, label: L('الاسم الكامل', 'Full name') },
    {
      name: 'phone',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: L('الهاتف', 'Phone'),
      hooks: { beforeValidate: [({ value }) => { const p = normalizePhone(String(value ?? '')); return p.ok ? p.e164 : value }] },
      validate: (v: unknown) => (normalizePhone(String(v ?? '')).ok ? true : 'Invalid phone number'),
    },
    {
      name: 'whatsapp',
      type: 'text',
      label: L('واتساب (إن كان مختلفاً)', 'WhatsApp (if different)'),
      hooks: { beforeValidate: [({ value }) => { if (!value) return value; const p = normalizePhone(String(value)); return p.ok ? p.e164 : value }] },
    },
    {
      name: 'preferredLocale',
      type: 'select',
      defaultValue: 'ar',
      label: L('لغة التواصل', 'Preferred language'),
      options: [
        { label: 'العربية', value: 'ar' },
        { label: 'English', value: 'en' },
      ],
    },
    { name: 'notes', type: 'textarea', label: L('ملاحظات داخلية', 'Internal notes') },
    {
      name: 'requests',
      type: 'join',
      collection: 'requests',
      on: 'customer',
      label: L('الطلبات', 'Requests'),
      admin: { defaultColumns: ['reference', 'service', 'status', 'createdAt'] },
    },
  ],
}
