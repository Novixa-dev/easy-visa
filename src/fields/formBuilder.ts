import type { Field } from 'payload'
import { L } from './common'

/**
 * Lets the owner configure each service's request form from the dashboard:
 * labels, required status, options, conditions and document slots.
 */
export const formFieldsField: Field = {
  name: 'formFields',
  type: 'array',
  label: L('حقول نموذج الطلب', 'Request form fields'),
  labels: { singular: L('حقل', 'Field'), plural: L('حقول', 'Fields') },
  admin: {
    description: L(
      'الاسم ورقم الهاتف والموافقة موجودة دائماً. أضف هنا الحقول الخاصة بهذه الخدمة.',
      'Name, phone and consent are always included. Add the fields specific to this service here.',
    ),
    initCollapsed: true,
    components: { RowLabel: '@/components/admin/FieldRowLabel#FieldRowLabel' },
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: L('المعرّف (إنجليزي)', 'Key (English)'),
          admin: { width: '30%', description: L('مثال: travelDate', 'e.g. travelDate') },
          validate: (v: unknown) => (typeof v === 'string' && /^[a-zA-Z][a-zA-Z0-9_]{1,40}$/.test(v) ? true : 'Letters, numbers and _ only'),
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'text',
          label: L('النوع', 'Type'),
          admin: { width: '30%' },
          options: [
            { label: L('نص قصير', 'Short text'), value: 'text' },
            { label: L('نص طويل', 'Long text'), value: 'textarea' },
            { label: L('رقم', 'Number'), value: 'number' },
            { label: L('تاريخ', 'Date'), value: 'date' },
            { label: L('قائمة منسدلة', 'Dropdown'), value: 'select' },
            { label: L('اختيار من خيارات', 'Choice buttons'), value: 'radio' },
            { label: L('دولة الوجهة', 'Destination country'), value: 'destination' },
            { label: L('رقم هاتف', 'Phone number'), value: 'tel' },
            { label: L('بريد إلكتروني', 'Email'), value: 'email' },
            { label: L('مربع تأكيد', 'Checkbox'), value: 'checkbox' },
          ],
        },
        {
          name: 'width',
          type: 'select',
          defaultValue: 'full',
          label: L('العرض', 'Width'),
          admin: { width: '20%' },
          options: [
            { label: L('كامل', 'Full'), value: 'full' },
            { label: L('نصف', 'Half'), value: 'half' },
          ],
        },
        { name: 'required', type: 'checkbox', label: L('مطلوب', 'Required'), admin: { width: '20%' } },
      ],
    },
    { name: 'label', type: 'text', required: true, localized: true, label: L('العنوان', 'Label') },
    {
      type: 'row',
      fields: [
        { name: 'placeholder', type: 'text', localized: true, label: L('نص توضيحي داخل الحقل', 'Placeholder') },
        { name: 'help', type: 'text', localized: true, label: L('مساعدة تحت الحقل', 'Help text') },
      ],
    },
    {
      type: 'row',
      admin: { condition: (_, s) => s?.type === 'number' },
      fields: [
        { name: 'min', type: 'number', label: L('أقل قيمة', 'Min') },
        { name: 'max', type: 'number', label: L('أكبر قيمة', 'Max') },
      ],
    },
    {
      type: 'row',
      admin: { condition: (_, s) => s?.type === 'date' },
      fields: [
        { name: 'futureOnly', type: 'checkbox', defaultValue: true, label: L('اليوم أو بعده فقط', 'Today or later only') },
        { name: 'showHijri', type: 'checkbox', label: L('عرض التاريخ الهجري', 'Show Hijri date') },
        { name: 'afterField', type: 'text', label: L('بعد تاريخ الحقل', 'After date in field (key)') },
      ],
    },
    {
      name: 'options',
      type: 'array',
      label: L('الخيارات', 'Options'),
      admin: { condition: (_, s) => s?.type === 'select' || s?.type === 'radio' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'value', type: 'text', required: true, label: L('القيمة (إنجليزي)', 'Value') },
            { name: 'label', type: 'text', required: true, localized: true, label: L('النص الظاهر', 'Label') },
          ],
        },
      ],
    },
    {
      name: 'showWhen',
      type: 'group',
      label: L('إظهار الحقل فقط عندما', 'Only show this field when'),
      admin: { hideGutter: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'field', type: 'text', label: L('الحقل (المعرّف)', 'Field key') },
            { name: 'equals', type: 'text', label: L('يساوي', 'Equals') },
          ],
        },
      ],
    },
  ],
}

export const documentSlotsField: Field = {
  name: 'documentSlots',
  type: 'array',
  label: L('المستندات المطلوب رفعها', 'Documents to upload'),
  admin: {
    description: L(
      'اتركها فارغة إذا لم تكن هذه الخدمة تحتاج رفع مستندات. لا تطلب إلا الضروري.',
      'Leave empty if this service needs no uploads. Only ask for what is necessary.',
    ),
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'key', type: 'text', required: true, label: L('المعرّف', 'Key'), admin: { width: '30%' } },
        { name: 'label', type: 'text', required: true, localized: true, label: L('اسم المستند', 'Document name') },
        { name: 'required', type: 'checkbox', label: L('مطلوب', 'Required'), admin: { width: '15%' } },
      ],
    },
    { name: 'help', type: 'text', localized: true, label: L('توضيح', 'Help text') },
  ],
}
