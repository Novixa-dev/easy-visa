import type { CollectionConfig } from 'payload'
import { isOwner, isStaff } from '@/access'
import { L, priceField, publishStatusField, slugField, sortOrderField } from '@/fields/common'
import { audited } from '@/hooks/audit'

export type OfferLifecycle = 'draft' | 'scheduled' | 'active' | 'expired' | 'archived'

export function offerLifecycle(o: { status?: string | null; startDate?: string | null; endDate?: string | null }, now = new Date()): OfferLifecycle {
  if (o.status === 'archived') return 'archived'
  if (o.status !== 'published') return 'draft'
  if (o.startDate && new Date(o.startDate) > now) return 'scheduled'
  if (o.endDate && new Date(o.endDate) < now) return 'expired'
  return 'active'
}

export const Offers: CollectionConfig = {
  slug: 'offers',
  labels: { singular: L('عرض', 'Offer'), plural: L('العروض', 'Offers') },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'lifecycle', 'startDate', 'endDate', 'status'],
    group: L('المحتوى', 'Content'),
  },
  defaultSort: '-startDate',
  access: {
    // Public sees published offers (active and past); staff see everything.
    read: ({ req }) => (isStaff(req) ? true : { status: { equals: 'published' } }),
    create: ({ req }) => isOwner(req),
    update: ({ req }) => isOwner(req),
    delete: ({ req }) => isOwner(req),
  },
  hooks: audited,
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: L('عنوان العرض', 'Offer title') },
    { name: 'summary', type: 'textarea', required: true, localized: true, maxLength: 240, label: L('وصف مختصر', 'Short description') },
    { name: 'image', type: 'upload', relationTo: 'media', label: L('صورة', 'Image') },
    { name: 'body', type: 'richText', localized: true, label: L('التفاصيل', 'Details') },
    {
      name: 'includes',
      type: 'array',
      label: L('يشمل العرض', 'What is included'),
      fields: [{ name: 'item', type: 'text', required: true, localized: true, label: L('البند', 'Item') }],
    },
    priceField,
    { name: 'terms', type: 'textarea', localized: true, label: L('الشروط والأحكام', 'Terms and conditions') },
    { name: 'service', type: 'relationship', relationTo: 'services', label: L('الخدمة المرتبطة (لزر الطلب)', 'Linked service (for the request button)') },
    {
      type: 'row',
      fields: [
        { name: 'startDate', type: 'date', required: true, label: L('يبدأ في', 'Starts'), admin: { date: { pickerAppearance: 'dayOnly' } } },
        { name: 'endDate', type: 'date', label: L('ينتهي في', 'Ends'), admin: { date: { pickerAppearance: 'dayOnly' }, description: L('بعده يختفي العرض من العروض النشطة تلقائياً', 'After this date it leaves the active offers automatically') } },
      ],
    },
    {
      name: 'lifecycle',
      type: 'text',
      virtual: true,
      label: L('الحالة الفعلية', 'Current state'),
      admin: { readOnly: true, position: 'sidebar' },
      hooks: { afterRead: [({ siblingData }) => offerLifecycle(siblingData)] },
    },
    slugField(),
    publishStatusField,
    { name: 'featured', type: 'checkbox', label: L('يظهر في الرئيسية', 'Show on homepage'), admin: { position: 'sidebar' } },
    sortOrderField,
  ],
}
