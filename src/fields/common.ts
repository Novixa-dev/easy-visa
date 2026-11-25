import type { Field } from 'payload'
import { CURRENCIES } from '@/lib/constants'

const L = (ar: string, en: string) => ({ ar, en })

/** URL slug, auto-filled from the English title if empty. */
export const slugField = (from = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  label: L('الرابط المختصر', 'Slug'),
  admin: { position: 'sidebar', description: L('يظهر في رابط الصفحة. أحرف إنجليزية صغيرة وشرطات فقط.', 'Used in the page URL. Lowercase letters and dashes.') },
  hooks: {
    beforeValidate: [
      ({ value, data, req }) => {
        const src = value || (req.locale === 'en' ? data?.[from] : undefined)
        if (!src || typeof src !== 'string') return value
        return src
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
      },
    ],
  },
  validate: (v: unknown) =>
    typeof v === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v) ? true : 'Use lowercase letters, numbers and dashes only.',
})

export const publishStatusField: Field = {
  name: 'status',
  type: 'select',
  required: true,
  defaultValue: 'draft',
  index: true,
  label: L('الحالة', 'Status'),
  options: [
    { label: L('مسودة', 'Draft'), value: 'draft' },
    { label: L('منشور', 'Published'), value: 'published' },
    { label: L('مؤرشف', 'Archived'), value: 'archived' },
  ],
  admin: { position: 'sidebar' },
}

export const sortOrderField: Field = {
  name: 'sortOrder',
  type: 'number',
  defaultValue: 0,
  label: L('الترتيب', 'Order'),
  admin: { position: 'sidebar', description: L('الأصغر يظهر أولاً', 'Lower numbers appear first') },
}

export const priceField: Field = {
  name: 'price',
  type: 'group',
  label: L('السعر', 'Price'),
  admin: { description: L('لا يُنشر السعر إلا بعد اعتماده.', 'Only publish prices that are approved.') },
  fields: [
    {
      name: 'mode',
      type: 'select',
      defaultValue: 'quote',
      label: L('طريقة العرض', 'Display'),
      options: [
        { label: L('لا تعرض سعراً', 'Do not show a price'), value: 'hidden' },
        { label: L('السعر عند الطلب', 'Price on request'), value: 'quote' },
        { label: L('سعر ثابت', 'Fixed price'), value: 'fixed' },
        { label: L('ابتداءً من', 'Starting from'), value: 'from' },
        { label: L('نطاق سعري', 'Price range'), value: 'range' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'amount', type: 'number', min: 0, label: L('المبلغ', 'Amount'), admin: { condition: (_, s) => ['fixed', 'from', 'range'].includes(s?.mode) } },
        { name: 'amountMax', type: 'number', min: 0, label: L('الحد الأعلى', 'Up to'), admin: { condition: (_, s) => s?.mode === 'range' } },
        {
          name: 'currency',
          type: 'select',
          defaultValue: 'SAR',
          label: L('العملة', 'Currency'),
          options: CURRENCIES.map((c) => ({ label: c, value: c })),
          admin: { condition: (_, s) => ['fixed', 'from', 'range'].includes(s?.mode) },
        },
      ],
    },
    {
      name: 'indicative',
      type: 'checkbox',
      defaultValue: true,
      label: L('سعر تقديري ويخضع للتأكيد', 'Indicative, subject to confirmation'),
      admin: { condition: (_, s) => ['fixed', 'from', 'range'].includes(s?.mode) },
    },
  ],
}

export const seoField: Field = {
  name: 'seo',
  type: 'group',
  label: L('محركات البحث', 'SEO'),
  fields: [
    { name: 'title', type: 'text', localized: true, maxLength: 70, label: L('عنوان الصفحة', 'Meta title') },
    { name: 'description', type: 'textarea', localized: true, maxLength: 170, label: L('الوصف', 'Meta description') },
  ],
}

export { L }
