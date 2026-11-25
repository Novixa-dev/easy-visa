import type { CollectionConfig } from 'payload'
import { anyone, isOwner } from '@/access'
import { L, sortOrderField } from '@/fields/common'
import { audited } from '@/hooks/audit'

export const Destinations: CollectionConfig = {
  slug: 'destinations',
  labels: { singular: L('وجهة', 'Destination'), plural: L('الوجهات', 'Destinations') },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'code', 'active'], group: L('الخدمات', 'Services') },
  defaultSort: 'sortOrder',
  access: { read: anyone, create: ({ req }) => isOwner(req), update: ({ req }) => isOwner(req), delete: ({ req }) => isOwner(req) },
  hooks: audited,
  fields: [
    { name: 'name', type: 'text', required: true, localized: true, label: L('اسم الدولة', 'Country name') },
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      label: L('رمز الدولة', 'Country code'),
      admin: { description: L('رمز من حرفين، مثل SA أو OM', 'Two letters, e.g. SA or OM') },
      validate: (v: unknown) => (typeof v === 'string' && /^[A-Z]{2}$/.test(v) ? true : 'Two capital letters'),
    },
    { name: 'active', type: 'checkbox', defaultValue: true, label: L('يظهر في النماذج', 'Show in forms') },
    sortOrderField,
  ],
}
