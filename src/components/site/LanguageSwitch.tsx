'use client'
import { useLocale } from 'next-intl'
import { useParams } from 'next/navigation'
import { Link, usePathname } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function Inner({ label, ariaLabel }: { label: string; ariaLabel: string }) {
  const locale = useLocale()
  const pathname = usePathname()
  const params = useParams()
  const search = useSearchParams()
  const other = locale === 'ar' ? 'en' : 'ar'
  const query = Object.fromEntries(search.entries())
  void params
  return (
    <Link
      href={{ pathname, query }}
      locale={other}
      hrefLang={other}
      aria-label={ariaLabel}
      className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-navy-800 hover:bg-navy-50"
      lang={other}
    >
      {label}
    </Link>
  )
}

export function LanguageSwitch(props: { label: string; ariaLabel: string }) {
  return (
    <Suspense fallback={<span className="inline-flex min-h-10 items-center px-3 text-sm font-semibold text-navy-800">{props.label}</span>}>
      <Inner {...props} />
    </Suspense>
  )
}
