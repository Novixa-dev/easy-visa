'use client'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useRouter } from '@/i18n/routing'
import { contactSchema, isVisible, validateField, type DocumentSlotDef, type FormFieldDef, type Option } from '@/lib/form-schema'
import { formatHijri } from '@/lib/format'
import { formatPhone, lastFour, normalizePhone } from '@/lib/phone'
import { saveMyRequest } from '@/lib/my-requests'
import { cn } from '@/lib/misc'
import type { Locale } from '@/lib/constants'
import { CheckIcon, LockIcon } from '../icons'
import { DocumentInput } from './DocumentInput'
import { FieldInput } from './FieldInput'

type Contact = { fullName: string; phone: string; sameWhatsapp: boolean; whatsapp: string; notes: string; consent: boolean }
type Step = 'contact' | 'details' | 'docs' | 'review'

type Props = {
  serviceSlug: string
  serviceTitle: string
  fields: FormFieldDef[]
  slots: DocumentSlotDef[]
  destinations: Option[]
  consentText?: string | null
}

const emptyContact: Contact = { fullName: '', phone: '', sameWhatsapp: true, whatsapp: '', notes: '', consent: false }
const newKey = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()) + Math.random())

export function RequestWizard({ serviceSlug, serviceTitle, fields, slots, destinations, consentText }: Props) {
  const t = useTranslations('request')
  const locale = useLocale() as Locale
  const router = useRouter()
  const steps = useMemo<Step[]>(() => ['contact', ...(fields.length ? (['details'] as const) : []), ...(slots.length ? (['docs'] as const) : []), 'review'], [fields.length, slots.length])
  const [step, setStep] = useState<Step>('contact')
  const [contact, setContact] = useState<Contact>(emptyContact)
  const [values, setValues] = useState<Record<string, unknown>>({})
  const [files, setFiles] = useState<Record<string, File | undefined>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [banner, setBanner] = useState<string | null>(null)
  const [restored, setRestored] = useState(false)
  const [sending, setSending] = useState(false)
  const idemKey = useRef<string>('')
  const headingRef = useRef<HTMLHeadingElement>(null)
  const honeypot = useRef<HTMLInputElement>(null)
  const draftKey = `ev-draft:${serviceSlug}`

  // Restore a draft typed earlier on this device (power cuts and weak signal are common).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey)
      if (raw) {
        const d = JSON.parse(raw)
        if (d.contact) setContact({ ...emptyContact, ...d.contact, consent: false })
        if (d.values) setValues(d.values)
        idemKey.current = d.key || newKey()
        if (d.contact?.fullName || Object.keys(d.values ?? {}).length) setRestored(true)
      } else idemKey.current = newKey()
    } catch {
      idemKey.current = newKey()
    }
  }, [draftKey])

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify({ contact: { ...contact, consent: false }, values, key: idemKey.current }))
      } catch {}
    }, 400)
    return () => clearTimeout(id)
  }, [contact, values, draftKey])

  const index = steps.indexOf(step)
  const go = (s: Step) => {
    setStep(s)
    setBanner(null)
    requestAnimationFrame(() => {
      headingRef.current?.focus()
      headingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const validateContact = () => {
    const r = contactSchema(locale).safeParse({ ...contact, consent: true })
    const e: Record<string, string> = {}
    if (!r.success) for (const i of r.error.issues) e[`contact.${i.path.join('.')}`] = i.message
    return e
  }
  const validateDetails = () => {
    const e: Record<string, string> = {}
    for (const f of fields) {
      const m = validateField(f, values[f.name], values, locale)
      if (m) e[f.name] = m
    }
    return e
  }
  const validateDocs = () => {
    const e: Record<string, string> = {}
    for (const s of slots) if (s.required && !files[s.key]) e[`doc.${s.key}`] = locale === 'ar' ? 'هذا المستند مطلوب' : 'This document is required'
    return e
  }

  const next = () => {
    const e = step === 'contact' ? validateContact() : step === 'details' ? validateDetails() : step === 'docs' ? validateDocs() : {}
    setErrors(e)
    if (Object.keys(e).length) {
      setBanner(t('errorFix'))
      requestAnimationFrame(() => (document.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus())
      return
    }
    go(steps[index + 1])
  }

  const submit = async () => {
    if (!contact.consent) {
      setErrors({ 'contact.consent': locale === 'ar' ? 'يلزم الموافقة لإرسال الطلب' : 'You need to agree before sending' })
      return
    }
    setSending(true)
    setBanner(null)
    const fd = new FormData()
    fd.set(
      'payload',
      JSON.stringify({ serviceSlug, locale, idempotencyKey: idemKey.current, contact, values, website: honeypot.current?.value || '' }),
    )
    for (const [k, f] of Object.entries(files)) if (f) fd.append(`doc_${k}`, f, f.name)
    try {
      const res = await fetch('/api/requests/submit', { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.reference) {
        const p = normalizePhone(contact.phone)
        if (p.ok) saveMyRequest({ reference: data.reference, last4: lastFour(p.e164), title: serviceTitle, at: new Date().toISOString() })
        try {
          localStorage.removeItem(draftKey)
          sessionStorage.setItem('ev-last', JSON.stringify({ reference: data.reference, name: contact.fullName, service: serviceTitle, at: new Date().toISOString() }))
        } catch {}
        router.push({ pathname: '/request/success', query: { ref: data.reference, s: serviceSlug } })
        return
      }
      if (res.status === 422 && data.errors) {
        setErrors(data.errors)
        const keys = Object.keys(data.errors)
        const target: Step = keys.some((k) => k.startsWith('contact.')) ? 'contact' : keys.some((k) => k.startsWith('doc.')) ? 'docs' : 'details'
        go(steps.includes(target) ? target : 'contact')
        setBanner(data.message || t('errorFix'))
      } else setBanner(data.message || t('errorGeneric'))
    } catch {
      setBanner(t('errorGeneric'))
    } finally {
      setSending(false)
    }
  }

  const stepLabel: Record<Step, string> = { contact: t('stepContact'), details: t('stepDetails'), docs: t('stepDocs'), review: t('stepReview') }
  const visibleFields = fields.filter((f) => isVisible(f, values))
  const displayValue = (f: FormFieldDef) => {
    const v = values[f.name]
    if (v === undefined || v === '') return null
    if (f.type === 'select' || f.type === 'radio') return f.options?.find((o) => o.value === v)?.label ?? String(v)
    if (f.type === 'destination') return destinations.find((o) => o.value === v)?.label ?? String(v)
    if (f.type === 'checkbox') return v ? '✓' : '—'
    if (f.type === 'date' && f.showHijri) return `${v} · ${formatHijri(String(v) + 'T12:00:00Z', locale)}`
    return String(v)
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress */}
      <ol className="mb-8 flex items-center gap-2" aria-label={t('stepOf', { current: index + 1, total: steps.length })}>
        {steps.map((s, i) => (
          <li key={s} className="flex flex-1 flex-col gap-2">
            <span className={cn('h-1.5 rounded-full transition-colors', i <= index ? 'bg-navy-800' : 'bg-line', i === index && 'bg-gold-500')} />
            <span className={cn('hidden text-xs font-medium sm:block', i <= index ? 'text-navy-900' : 'text-muted')} aria-current={i === index ? 'step' : undefined}>
              {stepLabel[s]}
            </span>
          </li>
        ))}
      </ol>

      <p className="text-sm font-medium text-gold-700">{t('stepOf', { current: index + 1, total: steps.length })}</p>
      <h2 ref={headingRef} tabIndex={-1} className="mt-1 scroll-mt-28 text-2xl font-bold outline-none sm:text-3xl">
        {stepLabel[step]}
      </h2>

      {restored && step === 'contact' && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-navy-50 px-4 py-3 text-sm text-navy-900">
          <span>{t('draftRestored')}</span>
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => {
              setContact(emptyContact)
              setValues({})
              setRestored(false)
              idemKey.current = newKey()
              try {
                localStorage.removeItem(draftKey)
              } catch {}
            }}
          >
            {t('clearDraft')}
          </button>
        </div>
      )}

      <div role="alert" aria-live="assertive" className={cn(banner ? 'mt-4 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-danger' : 'sr-only')}>
        {banner}
      </div>

      <form
        noValidate
        className="mt-6"
        onSubmit={(e) => {
          e.preventDefault()
          if (step === 'review') submit()
          else next()
        }}
      >
        {/* Honeypot: hidden from people, filled by bots */}
        <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -start-[9999px] size-px opacity-0" />

        {step === 'contact' && (
          <div className="grid gap-5">
            <FieldInput
              field={{ name: 'fullName', type: 'text', label: t('fullName'), placeholder: t('fullNamePh'), required: true }}
              value={contact.fullName}
              error={errors['contact.fullName']}
              destinations={[]}
              onChange={(v) => setContact((c) => ({ ...c, fullName: String(v) }))}
            />
            <FieldInput
              field={{ name: 'phone', type: 'tel', label: t('phone'), placeholder: t('phonePh'), help: t('phoneHelp'), required: true }}
              value={contact.phone}
              error={errors['contact.phone']}
              destinations={[]}
              onChange={(v) => setContact((c) => ({ ...c, phone: String(v) }))}
            />
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={contact.sameWhatsapp} onChange={(e) => setContact((c) => ({ ...c, sameWhatsapp: e.target.checked }))} className="size-5 accent-navy-800" />
              <span className="font-medium text-navy-900">{t('sameWhatsapp')}</span>
            </label>
            {!contact.sameWhatsapp && (
              <FieldInput
                field={{ name: 'whatsapp', type: 'tel', label: t('whatsapp'), placeholder: t('phonePh'), required: true }}
                value={contact.whatsapp}
                error={errors['contact.whatsapp']}
                destinations={[]}
                onChange={(v) => setContact((c) => ({ ...c, whatsapp: String(v) }))}
              />
            )}
          </div>
        )}

        {step === 'details' && (
          <div className="grid gap-5 sm:grid-cols-2">
            {visibleFields.map((f) => (
              <div key={f.name} className={cn(f.width === 'half' ? 'sm:col-span-1' : 'sm:col-span-2')}>
                <FieldInput field={f} value={values[f.name]} error={errors[f.name]} destinations={destinations} onChange={(v) => setValues((s) => ({ ...s, [f.name]: v }))} />
              </div>
            ))}
            <div className="sm:col-span-2">
              <FieldInput
                field={{ name: 'notes', type: 'textarea', label: t('notes'), placeholder: t('notesPh') }}
                value={contact.notes}
                error={errors['contact.notes']}
                destinations={[]}
                onChange={(v) => setContact((c) => ({ ...c, notes: String(v) }))}
              />
            </div>
          </div>
        )}

        {step === 'docs' && (
          <div className="grid gap-6">
            <p className="text-muted">{t('docsIntro')}</p>
            {slots.map((s) => (
              <DocumentInput key={s.key} slot={s} file={files[s.key]} error={errors[`doc.${s.key}`]} onChange={(f) => setFiles((x) => ({ ...x, [s.key]: f }))} />
            ))}
            <p className="flex items-start gap-2 rounded-lg bg-navy-50 p-3 text-sm text-navy-900">
              <LockIcon size={18} className="mt-0.5 shrink-0 text-gold-700" /> {t('docsPrivacy')}
            </p>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-6">
            <p className="text-muted">{t('reviewIntro')}</p>
            <ReviewBlock title={t('stepContact')} onEdit={() => go('contact')} editLabel={t('edit')}>
              <Row label={t('fullName')} value={contact.fullName} />
              <Row label={t('phone')} value={normalizePhone(contact.phone).ok ? formatPhone((normalizePhone(contact.phone) as { e164: string }).e164) : contact.phone} ltr />
              {!contact.sameWhatsapp && <Row label={t('whatsapp')} value={contact.whatsapp} ltr />}
            </ReviewBlock>
            {steps.includes('details') && (
              <ReviewBlock title={t('stepDetails')} onEdit={() => go('details')} editLabel={t('edit')}>
                {visibleFields.map((f) => {
                  const v = displayValue(f)
                  return v ? <Row key={f.name} label={f.label} value={v} /> : null
                })}
                {contact.notes && <Row label={t('notes')} value={contact.notes} />}
              </ReviewBlock>
            )}
            {steps.includes('docs') && (
              <ReviewBlock title={t('stepDocs')} onEdit={() => go('docs')} editLabel={t('edit')}>
                {slots.map((s) => (
                  <Row key={s.key} label={s.label} value={files[s.key] ? files[s.key]!.name : '—'} ltr={!!files[s.key]} />
                ))}
              </ReviewBlock>
            )}

            <p className="rounded-lg border border-gold-500/30 bg-gold-50 p-4 text-sm leading-6 text-navy-900">{t('notice')}</p>

            <div>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={contact.consent}
                  onChange={(e) => {
                    setContact((c) => ({ ...c, consent: e.target.checked }))
                    setErrors((x) => ({ ...x, 'contact.consent': '' }))
                  }}
                  aria-invalid={errors['contact.consent'] ? true : undefined}
                  aria-describedby={errors['contact.consent'] ? 'consent-err' : undefined}
                  className="mt-1 size-5 shrink-0 accent-navy-800"
                />
                <span className="leading-7 text-navy-900">
                  {consentText ? consentText + ' ' : t('consent') + ' '}
                  <Link href="/privacy" target="_blank" className="font-semibold text-navy-700 underline decoration-gold-500 underline-offset-4">
                    {t('privacyLink')}
                  </Link>
                </span>
              </label>
              {errors['contact.consent'] && (
                <p id="consent-err" className="field-error">
                  {errors['contact.consent']}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-between">
          {index > 0 ? (
            <button type="button" className="btn-ghost" onClick={() => go(steps[index - 1])} disabled={sending}>
              {t('back')}
            </button>
          ) : (
            <span />
          )}
          <button type="submit" className={step === 'review' ? 'btn-gold min-w-48' : 'btn-primary min-w-40'} disabled={sending} aria-busy={sending}>
            {step === 'review' ? (
              sending ? (
                t('sending')
              ) : (
                <>
                  <CheckIcon size={20} /> {t('submit')}
                </>
              )
            ) : (
              t('next')
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

function ReviewBlock({ title, onEdit, editLabel, children }: { title: string; onEdit: () => void; editLabel: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h3 className="text-base font-semibold">{title}</h3>
        <button type="button" onClick={onEdit} className="text-sm font-semibold text-navy-700 underline decoration-gold-500 underline-offset-4">
          {editLabel}
        </button>
      </div>
      <dl className="divide-y divide-line">{children}</dl>
    </section>
  )
}

function Row({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(0,12rem)_1fr] sm:gap-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className={cn('font-medium break-words text-navy-900', ltr && 'ltr-nums text-start')}>{value}</dd>
    </div>
  )
}
