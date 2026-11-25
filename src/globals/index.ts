import type { GlobalConfig } from 'payload'
import { anyone, isOwner } from '@/access'
import { L } from '@/fields/common'
import { normalizePhone } from '@/lib/phone'

const ownerUpdate = { read: anyone, update: ({ req }: { req: Parameters<typeof isOwner>[0] }) => isOwner(req) }

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: L('إعدادات الموقع والتواصل', 'Site & contact settings'),
  admin: { group: L('الإعدادات', 'Settings') },
  access: ownerUpdate,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: L('التواصل', 'Contact'),
          fields: [
            {
              name: 'primaryWhatsapp',
              type: 'text',
              required: true,
              label: L('رقم واتساب الرئيسي', 'Main WhatsApp number'),
              admin: { description: L('يُستخدم لأزرار واتساب في الموقع. بالصيغة الدولية.', 'Used by WhatsApp buttons across the site. International format.') },
              validate: (v: unknown) => (normalizePhone(String(v ?? '')).ok ? true : 'Invalid phone number'),
            },
            {
              name: 'contacts',
              type: 'array',
              label: L('أرقام التواصل', 'Contact numbers'),
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', localized: true, label: L('الوصف', 'Label'), admin: { description: L('مثال: التأشيرات، الحجوزات', 'e.g. Visas, Bookings') } },
                    { name: 'phone', type: 'text', required: true, label: L('الرقم', 'Number'), validate: (v: unknown) => (normalizePhone(String(v ?? '')).ok ? true : 'Invalid phone number') },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'whatsapp', type: 'checkbox', defaultValue: true, label: L('عليه واتساب', 'Has WhatsApp') },
                    { name: 'calls', type: 'checkbox', defaultValue: true, label: L('يستقبل مكالمات', 'Takes calls') },
                  ],
                },
              ],
            },
            { name: 'email', type: 'email', label: L('البريد الإلكتروني العام', 'Public email') },
            { name: 'city', type: 'text', localized: true, label: L('المدينة / المنطقة', 'City / region') },
            { name: 'address', type: 'text', localized: true, label: L('العنوان التفصيلي (اختياري)', 'Street address (optional)') },
            { name: 'mapUrl', type: 'text', label: L('رابط الخريطة (اختياري)', 'Map link (optional)') },
            { name: 'hours', type: 'textarea', localized: true, label: L('ساعات العمل (بعد التأكيد فقط)', 'Opening hours (only once confirmed)') },
          ],
        },
        {
          label: L('التواصل الاجتماعي', 'Social'),
          fields: [
            { name: 'instagram', type: 'text', label: 'Instagram URL' },
            { name: 'facebook', type: 'text', label: 'Facebook URL' },
            { name: 'tiktok', type: 'text', label: 'TikTok URL' },
            { name: 'snapchat', type: 'text', label: 'Snapchat URL' },
          ],
        },
        {
          label: L('الدفع', 'Payments'),
          description: L(
            'تظهر الحسابات للعميل فقط عند وجود مبلغ مطلوب على طلبه. الدفع بالبطاقة يتم عبر رابط آمن من بوابة الدفع تضعه في الطلب.',
            'Accounts are shown to a customer only when their request has an amount due. Card payments use a secure gateway link you add to the request.',
          ),
          fields: [
            {
              name: 'bankAccounts',
              type: 'array',
              label: L('الحسابات البنكية', 'Bank accounts'),
              labels: { singular: L('حساب', 'Account'), plural: L('حسابات', 'Accounts') },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'bankName', type: 'text', required: true, localized: true, label: L('اسم البنك / شركة الصرافة', 'Bank / exchange name') },
                    { name: 'accountName', type: 'text', required: true, label: L('اسم صاحب الحساب', 'Account holder') },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'accountNumber', type: 'text', required: true, label: L('رقم الحساب', 'Account number') },
                    { name: 'iban', type: 'text', label: 'IBAN' },
                    { name: 'currency', type: 'select', options: ['SAR', 'YER', 'USD'].map((c) => ({ label: c, value: c })), label: L('العملة', 'Currency') },
                  ],
                },
                { name: 'note', type: 'text', localized: true, label: L('ملاحظة للعميل', 'Note for the customer') },
                { name: 'active', type: 'checkbox', defaultValue: true, label: L('يظهر للعملاء', 'Shown to customers') },
              ],
            },
            { name: 'paymentInstructions', type: 'textarea', localized: true, label: L('تعليمات الدفع', 'Payment instructions') },
          ],
        },
        {
          label: L('الإشعارات', 'Notifications'),
          fields: [
            {
              name: 'notifyEmails',
              type: 'array',
              label: L('بريد استقبال إشعارات الطلبات الجديدة', 'Emails notified of new requests'),
              fields: [{ name: 'email', type: 'email', required: true }],
            },
            {
              name: 'whatsappTemplates',
              type: 'group',
              label: L('نصوص رسائل واتساب الجاهزة', 'WhatsApp message templates'),
              admin: { description: L('المتغيرات: {name} {reference} {service} {status} {message} {trackUrl}', 'Variables: {name} {reference} {service} {status} {message} {trackUrl}') },
              fields: [
                { name: 'afterSubmit', type: 'textarea', localized: true, label: L('بعد إرسال الطلب (من العميل)', 'After submitting (from the customer)') },
                { name: 'statusUpdate', type: 'textarea', localized: true, label: L('إشعار تحديث الحالة (من الموظف)', 'Status update (from staff)') },
              ],
            },
          ],
        },
        {
          label: L('عام', 'General'),
          fields: [
            { name: 'siteName', type: 'text', localized: true, required: true, label: L('اسم الموقع', 'Site name') },
            { name: 'tagline', type: 'text', localized: true, label: L('الشعار النصي', 'Tagline') },
            { name: 'footerAbout', type: 'textarea', localized: true, label: L('نبذة التذييل', 'Footer description') },
            { name: 'consentText', type: 'textarea', localized: true, label: L('نص الموافقة في النماذج', 'Form consent text') },
            {
              name: 'announcement',
              type: 'group',
              label: L('شريط إعلان أعلى الموقع', 'Top announcement bar'),
              fields: [
                { name: 'enabled', type: 'checkbox', label: L('مفعّل', 'Enabled') },
                { name: 'text', type: 'text', localized: true, label: L('النص', 'Text') },
                { name: 'link', type: 'text', label: L('الرابط', 'Link') },
              ],
            },
          ],
        },
      ],
    },
  ],
}

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: L('الصفحة الرئيسية', 'Homepage'),
  admin: { group: L('المحتوى', 'Content') },
  access: ownerUpdate,
  fields: [
    {
      name: 'hero',
      type: 'group',
      label: L('الواجهة', 'Hero'),
      fields: [
        { name: 'title', type: 'text', required: true, localized: true, label: L('العنوان', 'Headline') },
        { name: 'subtitle', type: 'textarea', localized: true, label: L('الوصف', 'Subheading') },
      ],
    },
    {
      name: 'pillars',
      type: 'array',
      maxRows: 6,
      label: L('ما نقدمه (الأعمدة)', 'What we do (pillars)'),
      fields: [
        { name: 'title', type: 'text', required: true, localized: true, label: L('العنوان', 'Title') },
        { name: 'text', type: 'textarea', localized: true, label: L('النص', 'Text') },
        {
          name: 'icon',
          type: 'select',
          defaultValue: 'passport',
          options: ['passport', 'chat', 'ticket', 'checklist'].map((v) => ({ label: v, value: v })),
        },
      ],
    },
    {
      name: 'steps',
      type: 'array',
      maxRows: 5,
      label: L('كيف تعمل الخدمة', 'How it works'),
      fields: [
        { name: 'title', type: 'text', required: true, localized: true, label: L('الخطوة', 'Step') },
        { name: 'text', type: 'textarea', localized: true, label: L('التوضيح', 'Text') },
      ],
    },
    {
      name: 'promises',
      type: 'array',
      label: L('لماذا Easy Visa (عبارات صادقة فقط)', 'Why Easy Visa (truthful statements only)'),
      fields: [
        { name: 'title', type: 'text', required: true, localized: true, label: L('العنوان', 'Title') },
        { name: 'text', type: 'textarea', localized: true, label: L('النص', 'Text') },
      ],
    },
    { name: 'aboutTeaser', type: 'textarea', localized: true, label: L('نبذة عنا', 'About teaser') },
  ],
}

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: L('صفحة من نحن', 'About page'),
  admin: { group: L('المحتوى', 'Content') },
  access: ownerUpdate,
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: L('العنوان', 'Title') },
    { name: 'intro', type: 'textarea', localized: true, label: L('المقدمة', 'Introduction') },
    {
      name: 'sections',
      type: 'array',
      label: L('الأقسام', 'Sections'),
      fields: [
        { name: 'heading', type: 'text', required: true, localized: true, label: L('العنوان', 'Heading') },
        { name: 'body', type: 'textarea', required: true, localized: true, label: L('النص', 'Text') },
      ],
    },
  ],
}

export const LegalPages: GlobalConfig = {
  slug: 'legal-pages',
  label: L('الخصوصية والشروط', 'Privacy & terms'),
  admin: { group: L('المحتوى', 'Content') },
  access: ownerUpdate,
  fields: [
    { name: 'privacy', type: 'richText', localized: true, label: L('سياسة الخصوصية', 'Privacy policy') },
    { name: 'terms', type: 'richText', localized: true, label: L('شروط الخدمة', 'Terms of service') },
    { name: 'updatedOn', type: 'date', label: L('آخر تحديث', 'Last updated'), admin: { date: { pickerAppearance: 'dayOnly' } } },
  ],
}
