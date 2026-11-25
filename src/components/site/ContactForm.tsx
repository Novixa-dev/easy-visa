'use client'
import { useLocale, useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { usePathname } from '@/i18n/routing'
import { CheckIcon } from '../icons'

const SUBJECTS = ['general', 'visa', 'booking', 'trip', 'payment', 'complaint', 'other'] as const

export function ContactForm({ defaultSubject = 'general' }: { defaultSubject?: (typeof SUBJECTS)[number] }) {
  const t = useTranslations('contactForm')
  const locale = useLocale()
  const pathname = usePathname()
  const [v, setV] = useState({ name: '', phone: '', email: '', subject: defaultSubject as string, message: '', consent: false })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const honeypot = useRef<HTMLInputElement>(null)

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    setState('sending')
    try {
      const res = await fetch('/api/contact-messages/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...v, locale, pageUrl: pathname, website: honeypot.current?.value || '' }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setState('sent')
        setErrors({})
        return
      }
      setErrors(data.errors ?? {})
      setState(data.errors ? 'idle' : 'error')
      requestAnimationFrame(() => (document.querySelector('#contact-form [aria-invalid="true"]') as HTMLElement | null)?.focus())
    } catch {
      setState('error')
    }
  }

  if (state === 'sent')
    return (
      <div role="status" className="rounded-[var(--radius-ticket)] border border-wa/30 bg-wa/5 p-6 text-center">
        <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-wa text-white">
          <CheckIcon size={26} />
        </span>
        <p className="mt-3 text-lg font-semibold text-navy-900">{t('sent')}</p>
        <button
          type="button"
          className="btn-ghost mt-3"
          onClick={() => {
            setV((s) => ({ ...s, message: '' }))
            setState('idle')
          }}
        >
          {t('another')}
        </button>
      </div>
    )

  const field = (k: 'name' | 'phone' | 'email', label: string, type = 'text', opt = false) => (
    <div>
      <label htmlFor={`c-${k}`} className="field-label">
        {label}
        {opt && <span className="ms-1.5 text-sm font-normal text-muted">({locale === 'ar' ? 'اختياري' : 'optional'})</span>}
      </label>
      <input
        id={`c-${k}`}
        type={type}
        value={v[k]}
        dir={k === 'name' ? undefined : 'ltr'}
        inputMode={k === 'phone' ? 'tel' : k === 'email' ? 'email' : undefined}
        autoComplete={k === 'name' ? 'name' : k === 'phone' ? 'tel' : 'email'}
        onChange={(e) => setV((s) => ({ ...s, [k]: e.target.value }))}
        aria-invalid={errors[k] ? true : undefined}
        aria-describedby={errors[k] ? `c-${k}-err` : undefined}
        className="field-input text-start"
      />
      {errors[k] && (
        <p id={`c-${k}-err`} className="field-error">
          {errors[k]}
        </p>
      )}
    </div>
  )

  return (
    <form id="contact-form" onSubmit={send} noValidate className="grid gap-4 sm:grid-cols-2">
      <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -start-[9999px] size-px opacity-0" />
      {field('name', t('name'))}
      {field('phone', t('phone'), 'tel')}
      {field('email', t('email'), 'email', true)}
      <div>
        <label htmlFor="c-subject" className="field-label">
          {t('subject')}
        </label>
        <select id="c-subject" value={v.subject} onChange={(e) => setV((s) => ({ ...s, subject: e.target.value }))} className="field-input">
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {t(`s_${s}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="c-message" className="field-label">
          {t('message')}
        </label>
        <textarea
          id="c-message"
          rows={5}
          value={v.message}
          onChange={(e) => setV((s) => ({ ...s, message: e.target.value }))}
          aria-invalid={errors.message ? true : undefined}
          className="field-input py-3"
        />
        {errors.message && <p className="field-error">{errors.message}</p>}
      </div>
      <label className="flex cursor-pointer items-start gap-3 sm:col-span-2">
        <input type="checkbox" checked={v.consent} onChange={(e) => setV((s) => ({ ...s, consent: e.target.checked }))} aria-invalid={errors.consent ? true : undefined} className="mt-1 size-5 shrink-0 accent-navy-800" />
        <span className="text-sm leading-6">{t('consent')}</span>
      </label>
      {errors.consent && <p className="field-error sm:col-span-2">{errors.consent}</p>}
      {state === 'error' && (
        <p role="alert" className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-danger sm:col-span-2">
          {t('error')}
        </p>
      )}
      <div className="sm:col-span-2">
        <button type="submit" className="btn-primary w-full sm:w-auto sm:min-w-48" disabled={state === 'sending'} aria-busy={state === 'sending'}>
          {state === 'sending' ? t('sending') : t('send')}
        </button>
      </div>
    </form>
  )
}
