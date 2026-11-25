'use client'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useRouter } from '@/i18n/routing'
import { toLatinDigits } from '@/lib/digits'

/** Boarding-pass styled tracking entry on the homepage. */
export function QuickTrack() {
  const t = useTranslations('home')
  const tt = useTranslations('track')
  const router = useRouter()
  const [ref, setRef] = useState('')

  return (
    <form
      className="ticket relative px-6 pt-6 pb-7 sm:px-8 [--notch-at:62%]"
      onSubmit={(e) => {
        e.preventDefault()
        const v = toLatinDigits(ref).trim().toUpperCase()
        router.push(v ? { pathname: '/track', query: { ref: v } } : '/track')
      }}
    >
      <div className="flex items-center justify-between gap-3 text-sm">
        <div>
          <p className="text-muted">{t('passFrom')}</p>
          <p className="font-display text-lg font-semibold text-navy-900">{t('passFromValue')}</p>
        </div>
        <svg aria-hidden viewBox="0 0 80 16" className="h-4 w-16 flex-1 text-gold-500 rtl:-scale-x-100">
          <path d="M2 8h68" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 4" />
          <path d="M66 3l8 5-8 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="text-end">
          <p className="text-muted">{t('passTo')}</p>
          <p className="font-display text-lg font-semibold text-navy-900">{t('passToValue')}</p>
        </div>
      </div>

      <div className="mt-6">
        <p className="font-display text-xl font-semibold text-navy-900">{t('passTitle')}</p>
        <p className="mt-1 text-[0.95rem] leading-7 text-muted">{t('passText')}</p>
      </div>

      <div className="ticket-tear" aria-hidden />

      <div className="mt-16 flex gap-2">
        <label htmlFor="quick-ref" className="sr-only">
          {tt('reference')}
        </label>
        <input
          id="quick-ref"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          placeholder={tt('referencePh')}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          dir="ltr"
          className="field-input min-w-0 flex-1 font-display tracking-wide uppercase placeholder:normal-case"
        />
        <button type="submit" className="btn-gold shrink-0 px-5">
          {t('passCta')}
        </button>
      </div>
    </form>
  )
}
