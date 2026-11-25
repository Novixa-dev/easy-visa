export const LOCALES = ['ar', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export const REQUEST_STATUSES = [
  'new',
  'under_review',
  'awaiting_customer',
  'in_progress',
  'completed',
  'rejected',
  'cancelled',
] as const
export type RequestStatus = (typeof REQUEST_STATUSES)[number]

export const STATUS_LABELS: Record<RequestStatus, { ar: string; en: string }> = {
  new: { ar: 'جديد', en: 'New' },
  under_review: { ar: 'قيد المراجعة', en: 'Under review' },
  awaiting_customer: { ar: 'بانتظار معلومات منك', en: 'Awaiting your information' },
  in_progress: { ar: 'قيد التنفيذ', en: 'In progress' },
  completed: { ar: 'مكتمل', en: 'Completed' },
  rejected: { ar: 'تعذّر إكماله', en: 'Could not proceed' },
  cancelled: { ar: 'ملغي', en: 'Cancelled' },
}

/** Default customer-facing explanation per status, used when staff leave the message empty. */
export const STATUS_HINTS: Record<RequestStatus, { ar: string; en: string }> = {
  new: { ar: 'استلمنا طلبك وسيراجعه أحد موظفينا قريباً.', en: 'We received your request. A member of our team will review it soon.' },
  under_review: { ar: 'نراجع بيانات طلبك الآن.', en: 'We are reviewing the details of your request.' },
  awaiting_customer: { ar: 'نحتاج منك معلومات أو مستندات إضافية. تواصل معنا عبر واتساب.', en: 'We need more information or documents from you. Please contact us on WhatsApp.' },
  in_progress: { ar: 'نعمل على تنفيذ طلبك.', en: 'We are working on your request.' },
  completed: { ar: 'اكتمل طلبك. شكراً لثقتك بنا.', en: 'Your request is complete. Thank you for choosing us.' },
  rejected: { ar: 'تعذّر إكمال الطلب. تواصل معنا لمعرفة التفاصيل.', en: 'We could not proceed with this request. Contact us for details.' },
  cancelled: { ar: 'أُلغي هذا الطلب.', en: 'This request was cancelled.' },
}

export const REQUEST_SOURCES = ['website', 'whatsapp', 'phone', 'walk_in'] as const

export const CURRENCIES = ['SAR', 'YER', 'USD'] as const
export type Currency = (typeof CURRENCIES)[number]

export const DOCUMENT_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
export const MAX_DOCUMENT_BYTES = 8 * 1024 * 1024
export const MAX_DOCUMENTS = 6
