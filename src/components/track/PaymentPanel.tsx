'use client'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import { formatDate, formatMoney } from '@/lib/format'
import { cn } from '@/lib/misc'
import type { Currency, Locale } from '@/lib/constants'
import { DocumentInput } from '../request/DocumentInput'
import { CheckIcon, LockIcon } from '../icons'

export type Invoice = {
  amount: number
  currency: Currency
  description: string | null
  dueDate: string | null
  paid: number
  status: 'none' | 'unpaid' | 'pending_review' | 'partial' | 'paid'
  cardUrl: string | null
  allowBankTransfer: boolean
  allowCash: boolean
  bankAccounts: { bank: string; holder: string; number: string; iban: string | null; currency: string | null; note: string | null }[]
  instructions: string | null
  payments: { reference: string; amount: number; currency: string; method: string; status: string; at: string; note: string | null }[]
}

function CopyValue({ value }: { value: string }) {
  const tc = useTranslations('common')
  const [done, setDone] = useState(false)
  return (
    <span className="inline-flex items-center gap-2">
      <span className="ltr-nums font-semibold break-all text-navy-900">{value}</span>
      <button
        type="button"
        className="rounded-md px-2 py-0.5 text-xs font-semibold text-navy-700 ring-1 ring-line hover:bg-white"
        onClick={() =>
          navigator.clipboard?.writeText(value).then(() => {
            setDone(true)
            setTimeout(() => setDone(false), 1500)
          })
        }
      >
        {done ? tc('copied') : tc('copy')}
      </button>
    </span>
  )
}

export function PaymentPanel({ invoice, reference, phone, onSent }: { invoice: Invoice; reference: string; phone: string; onSent: () => void }) {
  const t = useTranslations('pay')
  const locale = useLocale() as Locale
  const remaining = Math.max(0, invoice.amount - invoice.paid)
  const [form, setForm] = useState({ amount: String(remaining || ''), payerName: '', transferReference: '', toAccount: invoice.bankAccounts[0] ? `${invoice.bankAccounts[0].bank} · ${invoice.bankAccounts[0].number}` : '' })
  const [file, setFile] = useState<File>()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const done = invoice.status === 'paid'

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError(null)
    const fd = new FormData()
    fd.set('reference', reference)
    fd.set('phone', phone)
    fd.set('locale', locale)
    fd.set('method', 'bank_transfer')
    Object.entries(form).forEach(([k, v]) => fd.set(k, v))
    if (file) fd.set('receipt', file, file.name)
    try {
      const res = await fetch('/api/requests/pay', { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setSent(true)
        onSent()
      } else {
        setErrors(data.errors ?? {})
        setError(data.message ?? null)
      }
    } catch {
      setError(locale === 'ar' ? 'تعذّر الإرسال. تحقق من الاتصال.' : 'Could not send. Check your connection.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="mt-10" aria-labelledby="pay-title">
      <h2 id="pay-title" className="text-xl font-semibold">
        {t('title')}
      </h2>
      <div className="mt-4 rounded-[var(--radius-ticket)] border border-line">
        <div className="grid grid-cols-3 divide-x divide-line rtl:divide-x-reverse">
          {[
            [t('due'), formatMoney(invoice.amount, invoice.currency, locale)],
            [t('paid'), formatMoney(invoice.paid, invoice.currency, locale)],
            [t('remaining'), formatMoney(remaining, invoice.currency, locale)],
          ].map(([k, v], i) => (
            <div key={k} className="p-4">
              <p className="text-xs text-muted">{k}</p>
              <p className={cn('mt-0.5 font-display font-bold', i === 2 && remaining > 0 ? 'text-gold-700' : 'text-navy-900')}>{v}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3 text-sm">
          <span className={cn('font-semibold', done ? 'text-wa' : 'text-navy-900')}>{t(`status_${invoice.status}`)}</span>
          {invoice.dueDate && !done && <span className="text-muted">{t('payBy', { date: formatDate(invoice.dueDate, locale) })}</span>}
        </div>
        {invoice.description && <p className="border-t border-line px-4 py-3 text-[0.95rem] leading-7 whitespace-pre-line">{invoice.description}</p>}
      </div>

      {!done && remaining > 0 && (
        <div className="mt-6 space-y-4">
          {invoice.cardUrl && (
            <div className="rounded-[var(--radius-ticket)] border border-line p-5">
              <h3 className="font-semibold">{t('card')}</h3>
              <p className="mt-1 text-sm text-muted">{t('cardText')}</p>
              <a href={invoice.cardUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-4 w-full sm:w-auto">
                <LockIcon size={18} /> {t('cardCta')}
              </a>
            </div>
          )}

          {invoice.allowBankTransfer && invoice.bankAccounts.length > 0 && (
            <details className="group rounded-[var(--radius-ticket)] border border-line p-5" open={!invoice.cardUrl}>
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                {t('bank')}
                <span aria-hidden className="text-xl text-gold-600 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-2 text-sm text-muted">{t('bankText')}</p>
              {invoice.instructions && <p className="mt-2 text-sm whitespace-pre-line">{invoice.instructions}</p>}
              <ul className="mt-4 space-y-3">
                {invoice.bankAccounts.map((a, i) => (
                  <li key={i} className="rounded-xl bg-navy-50 p-4 text-sm">
                    <p className="font-display text-base font-semibold text-navy-900">
                      {a.bank} {a.currency && <span className="text-xs text-muted">({a.currency})</span>}
                    </p>
                    <dl className="mt-2 space-y-1.5">
                      <div className="flex flex-wrap justify-between gap-2">
                        <dt className="text-muted">{t('holder')}</dt>
                        <dd className="font-semibold">{a.holder}</dd>
                      </div>
                      <div className="flex flex-wrap justify-between gap-2">
                        <dt className="text-muted">{t('account')}</dt>
                        <dd>
                          <CopyValue value={a.number} />
                        </dd>
                      </div>
                      {a.iban && (
                        <div className="flex flex-wrap justify-between gap-2">
                          <dt className="text-muted">{t('iban')}</dt>
                          <dd>
                            <CopyValue value={a.iban} />
                          </dd>
                        </div>
                      )}
                    </dl>
                    {a.note && <p className="mt-2 text-xs text-muted">{a.note}</p>}
                  </li>
                ))}
              </ul>

              {sent ? (
                <p role="status" className="mt-5 flex items-start gap-2 rounded-lg bg-wa/10 p-4 text-sm font-medium text-wa">
                  <CheckIcon size={18} className="mt-0.5 shrink-0" /> {t('sent')}
                </p>
              ) : (
                <form onSubmit={send} noValidate className="mt-6 space-y-4 border-t border-line pt-5">
                  <h4 className="font-semibold">{t('reportTitle')}</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(
                      [
                        ['amount', t('amount'), 'numeric'],
                        ['payerName', t('payer'), 'text'],
                        ['transferReference', t('txn'), 'text'],
                      ] as const
                    ).map(([k, label, mode]) => (
                      <div key={k}>
                        <label htmlFor={`pay-${k}`} className="field-label">
                          {label}
                        </label>
                        <input
                          id={`pay-${k}`}
                          value={form[k]}
                          inputMode={mode}
                          dir={k === 'payerName' ? undefined : 'ltr'}
                          onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                          aria-invalid={errors[k] ? true : undefined}
                          className="field-input"
                        />
                        {errors[k] && <p className="field-error">{errors[k]}</p>}
                      </div>
                    ))}
                    {invoice.bankAccounts.length > 1 && (
                      <div>
                        <label htmlFor="pay-to" className="field-label">
                          {t('toAccount')}
                        </label>
                        <select id="pay-to" value={form.toAccount} onChange={(e) => setForm((f) => ({ ...f, toAccount: e.target.value }))} className="field-input">
                          {invoice.bankAccounts.map((a, i) => (
                            <option key={i} value={`${a.bank} · ${a.number}`}>
                              {a.bank} · {a.number}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <DocumentInput slot={{ key: 'receipt', label: t('receipt'), required: true }} file={file} error={errors.receipt} onChange={setFile} />
                  {error && (
                    <p role="alert" className="field-error">
                      {error}
                    </p>
                  )}
                  <button type="submit" className="btn-gold w-full" disabled={sending} aria-busy={sending}>
                    {sending ? t('sending') : t('send')}
                  </button>
                </form>
              )}
            </details>
          )}

          {invoice.allowCash && (
            <div className="rounded-[var(--radius-ticket)] border border-line p-5">
              <h3 className="font-semibold">{t('cash')}</h3>
              <p className="mt-1 text-sm text-muted">{t('cashText')}</p>
            </div>
          )}
        </div>
      )}

      {invoice.payments.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold">{t('history')}</h3>
          <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
            {invoice.payments.map((p) => (
              <li key={p.reference} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <span>
                  <span className="font-semibold">{formatMoney(p.amount, p.currency as Currency, locale)}</span>
                  <span className="ms-2 text-muted">{formatDate(p.at, locale)}</span>
                  {p.note && <span className="block text-muted">{p.note}</span>}
                </span>
                <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', p.status === 'paid' ? 'bg-wa/10 text-wa' : p.status === 'rejected' ? 'bg-danger/10 text-danger' : 'bg-gold-100 text-gold-700')}>
                  {t(`p_${p.status}`)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
