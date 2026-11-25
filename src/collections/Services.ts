import type { CollectionConfig } from 'payload'
import { isOwner, publishedOrStaff } from '@/access'
import { L, priceField, publishStatusField, seoField, slugField, sortOrderField } from '@/fields/common'
import { documentSlotsField, formFieldsField } from '@/fields/formBuilder'
import { audited } from '@/hooks/audit'

export const SERVICE_ICONS = ['kaaba', 'family', 'passport', 'globe', 'plane', 'bus', 'hotel', 'chat'] as const

export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: L('خدمة', 'Service'), plural: L('الخدمات', 'Services') },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'available', 'featured', 'sortOrder'],
    group: L('الخدمات', 'Services'),
    listSearchableFields: ['title', 'slug'],
  },
  defaultSort: 'sortOrder',
  access: {
    read: publishedOrStaff,
    create: ({ req }) => isOwner(req),
    update: ({ req }) => isOwner(req),
    delete: ({ req }) => isOwner(req),
  },
  hooks: audited,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: L('المحتوى', 'Content'),
          fields: [
            { name: 'title', type: 'text', required: true, localized: true, label: L('اسم الخدمة', 'Service name') },
            {
              name: 'summary',
              type: 'textarea',
              required: true,
              localized: true,
              maxLength: 220,
              label: L('وصف مختصر', 'Short description'),
              admin: { description: L('يظهر في قائمة الخدمات. جملة أو جملتان.', 'Shown in service lists. One or two sentences.') },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'icon',
                  type: 'select',
                  defaultValue: 'passport',
                  label: L('الأيقونة', 'Icon'),
                  options: [
                    { label: L('الكعبة / عمرة', 'Kaaba / Umrah'), value: 'kaaba' },
                    { label: L('عائلة', 'Family'), value: 'family' },
                    { label: L('جواز سفر', 'Passport'), value: 'passport' },
                    { label: L('كرة أرضية', 'Globe'), value: 'globe' },
                    { label: L('طائرة', 'Plane'), value: 'plane' },
                    { label: L('حافلة', 'Bus'), value: 'bus' },
                    { label: L('فندق', 'Hotel'), value: 'hotel' },
                    { label: L('استشارة', 'Consultation'), value: 'chat' },
                  ],
                },
                { name: 'image', type: 'upload', relationTo: 'media', label: L('صورة (اختياري)', 'Image (optional)') },
              ],
            },
            { name: 'body', type: 'richText', localized: true, label: L('الوصف الكامل', 'Full description') },
            { name: 'audience', type: 'textarea', localized: true, label: L('لمن هذه الخدمة؟', 'Who is this for?') },
            {
              name: 'requirements',
              type: 'array',
              label: L('المتطلبات والمستندات', 'Requirements & documents'),
              admin: { description: L('انشرها فقط بعد التأكد منها؛ الإجراءات الرسمية قد تتغير.', 'Publish only verified requirements; official procedures can change.') },
              fields: [
                { name: 'item', type: 'text', required: true, localized: true, label: L('المتطلب', 'Requirement') },
                { name: 'note', type: 'text', localized: true, label: L('ملاحظة', 'Note') },
              ],
            },
            { name: 'notes', type: 'textarea', localized: true, label: L('ملاحظات مهمة', 'Important notes') },
            {
              name: 'faqs',
              type: 'array',
              label: L('أسئلة شائعة لهذه الخدمة', 'FAQs for this service'),
              fields: [
                { name: 'question', type: 'text', required: true, localized: true, label: L('السؤال', 'Question') },
                { name: 'answer', type: 'textarea', required: true, localized: true, label: L('الإجابة', 'Answer') },
              ],
            },
          ],
        },
        {
          label: L('السعر والتوفر', 'Price & availability'),
          fields: [
            priceField,
            {
              name: 'available',
              type: 'checkbox',
              defaultValue: true,
              label: L('الخدمة متاحة حالياً لاستقبال الطلبات', 'Currently accepting requests'),
            },
            {
              name: 'unavailableNote',
              type: 'text',
              localized: true,
              label: L('رسالة عند عدم التوفر', 'Message when unavailable'),
              admin: { condition: (d) => d?.available === false },
            },
          ],
        },
        {
          label: L('نموذج الطلب', 'Request form'),
          fields: [formFieldsField, documentSlotsField],
        },
        {
          label: L('التواصل و SEO', 'Contact & SEO'),
          fields: [
            {
              name: 'whatsappNumber',
              type: 'text',
              label: L('رقم واتساب لهذه الخدمة', 'WhatsApp number for this service'),
              admin: { description: L('اتركه فارغاً لاستخدام الرقم الرئيسي من الإعدادات. مثال: ‎+967780007578', 'Leave empty to use the main number from Settings. e.g. +967780007578') },
            },
            { name: 'related', type: 'relationship', relationTo: 'services', hasMany: true, label: L('خدمات ذات صلة', 'Related services') },
            seoField,
          ],
        },
      ],
    },
    { name: 'category', type: 'relationship', relationTo: 'service-categories', required: true, index: true, label: L('الفئة', 'Category'), admin: { position: 'sidebar' } },
    slugField(),
    publishStatusField,
    { name: 'featured', type: 'checkbox', label: L('مميزة في الرئيسية', 'Featured on homepage'), admin: { position: 'sidebar' } },
    sortOrderField,
  ],
}
