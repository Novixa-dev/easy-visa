'use client'
import { useDocumentInfo, useFormFields, useTranslation } from '@payloadcms/ui'

const digits = (s?: string) => (s ?? '').replace(/\D/g, '')

/** Reply to a contact-form message on WhatsApp or by phone. */
export function MessageActions() {
  const { id } = useDocumentInfo()
  const { i18n } = useTranslation()
  const ar = i18n.language !== 'en'
  const v = useFormFields(([f]) => ({
    name: f.name?.value as string | undefined,
    phone: f.phone?.value as string | undefined,
    email: f.email?.value as string | undefined,
    locale: (f.locale?.value as string | undefined) ?? 'ar',
  }))
  if (!id || !v.phone) return null
  const hello = v.locale === 'en' ? `Hello ${v.name ?? ''}, this is Easy Visa replying to your message.` : `مرحباً ${v.name ?? ''}، معك Easy Visa بخصوص رسالتك.`
  const btn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 14px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    textDecoration: 'none',
    border: '1px solid var(--theme-elevation-150)',
    color: 'var(--theme-text)',
    background: 'var(--theme-elevation-50)',
  }
  return (
    <div className="ev-actions">
      <a href={`https://wa.me/${digits(v.phone)}?text=${encodeURIComponent(hello)}`} target="_blank" rel="noopener noreferrer" style={{ ...btn, background: '#1f8f4e', color: '#fff', borderColor: '#1f8f4e' }}>
        {ar ? 'الرد عبر واتساب' : 'Reply on WhatsApp'}
      </a>
      <a href={`tel:+${digits(v.phone)}`} style={btn}>
        {ar ? 'اتصال' : 'Call'}
      </a>
      {v.email && (
        <a href={`mailto:${v.email}`} style={btn}>
          {ar ? 'بريد' : 'Email'}
        </a>
      )}
    </div>
  )
}
