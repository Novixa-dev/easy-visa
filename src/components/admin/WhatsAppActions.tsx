'use client'
import { useDocumentInfo, useFormFields, useTranslation } from '@payloadcms/ui'
import { useEffect, useState } from 'react'
import { STATUS_HINTS, STATUS_LABELS, type RequestStatus } from '@/lib/constants'

const DEFAULT_TEMPLATES = {
  ar: 'مرحباً {name}،\nتحديث طلبك رقم {reference} ({service}):\nالحالة: {status}\n{message}\n\nتتبع طلبك: {trackUrl}\nEasy Visa',
  en: 'Hello {name},\nUpdate on your request {reference} ({service}):\nStatus: {status}\n{message}\n\nTrack it here: {trackUrl}\nEasy Visa',
}

const digits = (s?: string) => (s ?? '').replace(/\D/g, '')

/**
 * Prepares a WhatsApp message to the customer with the current status.
 * It opens WhatsApp with the text ready to send; nothing is sent automatically.
 */
export function WhatsAppActions() {
  const { id } = useDocumentInfo()
  const { i18n } = useTranslation()
  const ar = i18n.language !== 'en'
  const get = useFormFields(([fields]) => ({
    name: fields.contactName?.value as string | undefined,
    phone: fields.phone?.value as string | undefined,
    whatsapp: fields.whatsapp?.value as string | undefined,
    reference: fields.reference?.value as string | undefined,
    status: fields.status?.value as RequestStatus | undefined,
    message: fields.customerMessage?.value as string | undefined,
    locale: (fields.customerLocale?.value as 'ar' | 'en' | undefined) ?? 'ar',
    service: fields.service?.value as number | string | undefined,
  }))
  const [serviceTitle, setServiceTitle] = useState('')
  const [template, setTemplate] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!get.service) return
    const sid = typeof get.service === 'object' ? (get.service as { id: number }).id : get.service
    fetch(`/api/services/${sid}?locale=${get.locale}&depth=0&select[title]=true`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setServiceTitle(d.title))
      .catch(() => {})
  }, [get.service, get.locale])

  useEffect(() => {
    fetch(`/api/globals/site-settings?locale=${get.locale}&depth=0`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setTemplate(d?.whatsappTemplates?.statusUpdate || ''))
      .catch(() => {})
  }, [get.locale])

  if (!id) return null
  const to = digits(get.whatsapp || get.phone)
  if (!to) return null

  const status = get.status ?? 'new'
  // Rendered on the server first, where `window` does not exist.
  const origin = typeof window === 'undefined' ? process.env.NEXT_PUBLIC_SITE_URL || '' : window.location.origin
  const trackUrl = `${origin}/${get.locale}/track?ref=${encodeURIComponent(get.reference ?? '')}`
  const text = (template || DEFAULT_TEMPLATES[get.locale])
    .replaceAll('{name}', get.name ?? '')
    .replaceAll('{reference}', get.reference ?? '')
    .replaceAll('{service}', serviceTitle)
    .replaceAll('{status}', STATUS_LABELS[status][get.locale])
    .replaceAll('{message}', get.message || STATUS_HINTS[status][get.locale])
    .replaceAll('{trackUrl}', trackUrl)

  const btn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 14px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    textDecoration: 'none',
    border: '1px solid var(--theme-elevation-150)',
    color: 'var(--theme-text)',
    background: 'var(--theme-elevation-50)',
    cursor: 'pointer',
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        alignItems: 'center',
        padding: 14,
        marginBottom: 24,
        borderRadius: 10,
        border: '1px solid var(--theme-elevation-100)',
        background: 'var(--theme-elevation-25)',
      }}
    >
      <a href={`https://wa.me/${to}?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" style={{ ...btn, background: '#1f8f4e', color: '#fff', borderColor: '#1f8f4e' }}>
        {ar ? 'إرسال تحديث الحالة عبر واتساب' : 'Send status on WhatsApp'}
      </a>
      <a href={`tel:+${digits(get.phone)}`} style={btn}>
        {ar ? 'اتصال' : 'Call'}
      </a>
      <button
        type="button"
        style={btn}
        onClick={() => {
          navigator.clipboard.writeText(trackUrl).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 1800)
          })
        }}
      >
        {copied ? (ar ? 'تم النسخ' : 'Copied') : ar ? 'نسخ رابط التتبع' : 'Copy tracking link'}
      </button>
      <span style={{ fontSize: 12, opacity: 0.7, flexBasis: '100%' }}>
        {ar
          ? 'يفتح واتساب برسالة جاهزة بلغة العميل؛ لا يُرسل شيء تلقائياً. احفظ الحالة أولاً ثم أرسل، وسجّل المحاولة في تبويب المتابعة.'
          : 'Opens WhatsApp with a ready message in the customer’s language; nothing is sent automatically. Save the status first, then send, and log the attempt in the Follow-up tab.'}
      </span>
    </div>
  )
}
