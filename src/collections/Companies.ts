import type { CollectionConfig } from 'payload'
import { isOwner, isStaff } from '@/access'
import { L, sortOrderField } from '@/fields/common'
import { audited } from '@/hooks/audit'

/** Airlines, bus operators, hotels and agents that Easy Visa works with. */
export const Companies: CollectionConfig = {
  slug: 'companies',
  labels: { singular: L('شركة', 'Company'), plural: L('الشركات والمزودون', 'Companies & providers') },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'type', 'active', 'phone'], group: L('الرحلات', 'Trips') },
  defaultSort: 'sortOrder',
  access: {
    read: ({ req }) => (isStaff(req) ? true : { active: { equals: true } }),
    create: ({ req }) => isOwner(req),
    update: ({ req }) => isOwner(req),
    delete: ({ req }) => isOwner(req),
  },
  hooks: audited,
  fields: [
    { name: 'name', type: 'text', required: true, localized: true, label: L('الاسم', 'Name') },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'bus',
      label: L('النوع', 'Type'),
      options: [
        { label: L('شركة طيران', 'Airline'), value: 'airline' },
        { label: L('شركة نقل بري', 'Bus operator'), value: 'bus' },
        { label: L('فندق', 'Hotel'), value: 'hotel' },
        { label: L('وكيل تأشيرات / عمرة', 'Visa / Umrah agent'), value: 'agent' },
        { label: L('أخرى', 'Other'), value: 'other' },
      ],
    },
    { name: 'logo', type: 'upload', relationTo: 'media', label: L('الشعار', 'Logo') },
    { name: 'description', type: 'textarea', localized: true, label: L('نبذة تظهر للعملاء', 'Public description') },
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', label: L('هاتف الشركة (داخلي)', 'Company phone (internal)'), access: { read: ({ req }) => isStaff(req) } },
        { name: 'website', type: 'text', label: L('الموقع', 'Website') },
      ],
    },
    { name: 'internalNotes', type: 'textarea', label: L('ملاحظات داخلية (العمولة، جهة الاتصال…)', 'Internal notes (commission, contact person…)'), access: { read: ({ req }) => isStaff(req) } },
    { name: 'active', type: 'checkbox', defaultValue: true, label: L('نشطة', 'Active'), admin: { position: 'sidebar' } },
    sortOrderField,
  ],
}
