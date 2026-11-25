import type { CollectionConfig } from 'payload'
import { anyone, isOwner } from '@/access'
import { L, seoField, slugField, sortOrderField } from '@/fields/common'
import { audited } from '@/hooks/audit'

export const ServiceCategories: CollectionConfig = {
  slug: 'service-categories',
  labels: { singular: L('فئة', 'Category'), plural: L('فئات الخدمات', 'Service categories') },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', 'sortOrder'], group: L('الخدمات', 'Services') },
  defaultSort: 'sortOrder',
  access: { read: anyone, create: ({ req }) => isOwner(req), update: ({ req }) => isOwner(req), delete: ({ req }) => isOwner(req) },
  hooks: audited,
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: L('الاسم', 'Name') },
    { name: 'intro', type: 'textarea', localized: true, label: L('مقدمة', 'Introduction') },
    slugField(),
    sortOrderField,
    seoField,
  ],
}
