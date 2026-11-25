'use client'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Link } from '@/i18n/routing'
import { waLink } from '@/lib/misc'
import { WhatsAppIcon } from '../icons'

export function SuccessActions({ reference, whatsapp, template, serviceTitle }: { reference: string; whatsapp: string; template: string; serviceTitle: string }) {
  const t = useTranslations('success')
  const tc = useTranslations('common')
  const [name, setName] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      const last = JSON.parse(sessionStorage.getItem('ev-last') || '{}')
      if (last.reference === reference) setName(last.name || '')
    } catch {}
  }, [reference])

  const text = template.replaceAll('{reference}', reference).replaceAll('{service}', serviceTitle).replaceAll('{name}', name).replace(/\n.*:\s*$/m, '')

  return (
    <div className="no-print mt-6 grid gap-3">
      <a href={waLink(whatsapp, text)} target="_blank" rel="noopener noreferrer" className="btn-wa w-full">
        <WhatsAppIcon /> {t('whatsappCta')}
      </a>
      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          className="btn-outline px-2"
          onClick={() =>
            navigator.clipboard?.writeText(reference).then(() => {
              setCopied(true)
              setTimeout(() => setCopied(false), 1800)
            })
          }
        >
          <span aria-live="polite">{copied ? tc('copied') : tc('copy')}</span>
        </button>
        <button type="button" className="btn-outline px-2" onClick={() => window.print()}>
          {tc('print')}
        </button>
        <Link href={{ pathname: '/track', query: { ref: reference } }} className="btn-outline px-2">
          {t('trackCta')}
        </Link>
      </div>
      <p className="text-center text-sm text-muted">{t('screenshot')}</p>
    </div>
  )
}
