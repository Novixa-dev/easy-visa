import { z } from 'zod'
import { toLatinDigits } from './digits'
import { normalizePhone } from './phone'
import type { Locale } from './constants'

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'select'
  | 'radio'
  | 'destination'
  | 'tel'
  | 'email'
  | 'checkbox'

export type Option = { value: string; label: string }

/** Field definition as stored on a Service (localized values already resolved). */
export type FormFieldDef = {
  name: string
  type: FieldType
  label: string
  placeholder?: string | null
  help?: string | null
  required?: boolean | null
  width?: 'full' | 'half' | null
  min?: number | null
  max?: number | null
  options?: Option[] | null
  showWhen?: { field?: string | null; equals?: string | null } | null
  /** For date fields: also show the Hijri date under the input. */
  showHijri?: boolean | null
  /** For date fields: must be today or later. */
  futureOnly?: boolean | null
  /** For date fields: must be on/after the date in this field (e.g. return date). */
  afterField?: string | null
}

export type DocumentSlotDef = {
  key: string
  label: string
  help?: string | null
  required?: boolean | null
}

const msg = (locale: Locale) =>
  locale === 'ar'
    ? {
        required: 'هذا الحقل مطلوب',
        phone: 'أدخل رقم هاتف صحيح، مثل 777123456 أو ‎+967777123456',
        email: 'أدخل بريداً إلكترونياً صحيحاً',
        number: 'أدخل رقماً صحيحاً',
        min: (n: number) => `أقل قيمة مسموحة ${n}`,
        max: (n: number) => `أكبر قيمة مسموحة ${n}`,
        date: 'أدخل تاريخاً صحيحاً',
        future: 'اختر تاريخاً من اليوم فصاعداً',
        after: 'يجب أن يكون بعد التاريخ السابق',
        option: 'اختر من القائمة',
        name: 'اكتب الاسم الكامل (حرفان على الأقل)',
        consent: 'يلزم الموافقة لإرسال الطلب',
        tooLong: 'النص أطول من المسموح',
      }
    : {
        required: 'This field is required',
        phone: 'Enter a valid phone number, e.g. 777123456 or +967777123456',
        email: 'Enter a valid email address',
        number: 'Enter a whole number',
        min: (n: number) => `Minimum is ${n}`,
        max: (n: number) => `Maximum is ${n}`,
        date: 'Enter a valid date',
        future: 'Choose today or a later date',
        after: 'Must be after the previous date',
        option: 'Choose an option from the list',
        name: 'Enter your full name (at least 2 letters)',
        consent: 'You need to agree before sending',
        tooLong: 'This text is too long',
      }

export const isVisible = (f: FormFieldDef, values: Record<string, unknown>) =>
  !f.showWhen?.field || String(values[f.showWhen.field] ?? '') === String(f.showWhen.equals ?? '')

const todayISO = () => new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 10) // Asia/Aden

/** Validates one dynamic value. Returns an error message or null. */
export function validateField(f: FormFieldDef, raw: unknown, values: Record<string, unknown>, locale: Locale): string | null {
  const m = msg(locale)
  if (!isVisible(f, values)) return null
  const v = typeof raw === 'string' ? toLatinDigits(raw).trim() : raw
  const empty = v === undefined || v === null || v === '' || v === false
  if (empty) return f.required ? m.required : null
  switch (f.type) {
    case 'text':
      return String(v).length > 200 ? m.tooLong : null
    case 'textarea':
      return String(v).length > 2000 ? m.tooLong : null
    case 'tel':
      return normalizePhone(String(v)).ok ? null : m.phone
    case 'email':
      return z.email().safeParse(v).success ? null : m.email
    case 'number': {
      const n = Number(v)
      if (!Number.isInteger(n)) return m.number
      if (f.min != null && n < f.min) return m.min(f.min)
      if (f.max != null && n > f.max) return m.max(f.max)
      return null
    }
    case 'date': {
      const s = String(v)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(Date.parse(s))) return m.date
      if (f.futureOnly && s < todayISO()) return m.future
      if (f.afterField) {
        const other = values[f.afterField]
        if (typeof other === 'string' && other && s < other) return m.after
      }
      return null
    }
    case 'select':
    case 'radio':
      return f.options?.some((o) => o.value === v) ? null : m.option
    case 'destination':
      return String(v).length <= 100 ? null : m.option
    case 'checkbox':
      return null
  }
}

/** Contact fields that every request form has. */
export const contactSchema = (locale: Locale) => {
  const m = msg(locale)
  return z.object({
    fullName: z
      .string()
      .trim()
      .min(2, m.name)
      .max(120, m.tooLong),
    phone: z.string().refine((v) => normalizePhone(v).ok, m.phone),
    sameWhatsapp: z.boolean().default(true),
    whatsapp: z.string().optional(),
    consent: z.literal(true, { error: m.consent }),
    notes: z.string().max(2000, m.tooLong).optional(),
  }).superRefine((d, ctx) => {
    if (!d.sameWhatsapp && !(d.whatsapp && normalizePhone(d.whatsapp).ok)) {
      ctx.addIssue({ code: 'custom', path: ['whatsapp'], message: m.phone })
    }
  })
}

export type ContactInput = z.infer<ReturnType<typeof contactSchema>>

/** Validate all dynamic fields. Returns a map of field name → message. */
export function validateAll(fields: FormFieldDef[], values: Record<string, unknown>, locale: Locale) {
  const errors: Record<string, string> = {}
  for (const f of fields) {
    const e = validateField(f, values[f.name], values, locale)
    if (e) errors[f.name] = e
  }
  return errors
}

/** Keep only known, visible fields and coerce them, so stored data stays clean. */
export function sanitizeValues(fields: FormFieldDef[], values: Record<string, unknown>) {
  const out: Record<string, string | number | boolean> = {}
  for (const f of fields) {
    if (!isVisible(f, values)) continue
    const raw = values[f.name]
    if (raw === undefined || raw === null || raw === '') continue
    if (f.type === 'number') out[f.name] = Number(toLatinDigits(String(raw)))
    else if (f.type === 'checkbox') out[f.name] = raw === true || raw === 'true' || raw === 'on'
    else if (f.type === 'tel') {
      const p = normalizePhone(String(raw))
      out[f.name] = p.ok ? p.e164 : String(raw)
    } else out[f.name] = toLatinDigits(String(raw)).trim().slice(0, 2000)
  }
  return out
}
