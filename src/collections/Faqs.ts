import type { CollectionConfig } from 'payload'
import { isOwner, publishedOrStaff } from '@/access'
import { L, publishStatusField, sortOrderField } from '@/fields/common'
import { audited } from '@/hooks/audit'

export const Faqs: CollectionConfig = {
  slug: 'faqs',
  labels: { singular: L('سؤال شائع', 'FAQ'), plural: L('الأسئلة الشائعة', 'FAQs') },
  admin: { useAsTitle: 'question', defaultColumns: ['question', 'topic', 'status'], group: L('المحتوى', 'Content') },
  defaultSort: 'sortOrder',
  access: { read: publishedOrStaff, create: ({ req }) => isOwner(req), update: ({ req }) => isOwner(req), delete: ({ req }) => isOwner(req) },
  hooks: audited,
  fields: [
    { name: 'question', type: 'text', required: true, localized: true, label: L('السؤال', 'Question') },
    { name: 'answer', type: 'textarea', required: true, localized: true, label: L('الإجابة', 'Answer') },
    {
      name: 'topic',
      type: 'select',
      defaultValue: 'general',
      label: L('الموضوع', 'Topic'),
      options: [
        { label: L('عام', 'General'), value: 'general' },
        { label: L('الطلبات والتتبع', 'Requests & tracking'), value: 'requests' },
        { label: L('المستندات والخصوصية', 'Documents & privacy'), value: 'documents' },
        { label: L('الأسعار', 'Prices'), value: 'prices' },
      ],
    },
    publishStatusField,
    sortOrderField,
  ],
}
