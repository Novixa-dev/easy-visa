'use client'
import { useLocale } from 'next-intl'
import { useEffect } from 'react'

/** Friendly, localized error page with a retry; never shows technical details. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const ar = useLocale() === 'ar'
  useEffect(() => {
    console.error(error)
  }, [error])
  return (
    <div className="container-page py-24 text-center">
      <h1 className="text-3xl font-bold">{ar ? 'تعذّر تحميل الصفحة' : 'This page could not load'}</h1>
      <p className="mx-auto mt-3 max-w-md text-lg text-muted">
        {ar ? 'قد يكون الاتصال ضعيفاً. حاول مرة أخرى، أو راسلنا على واتساب إن استمرت المشكلة.' : 'Your connection may be weak. Try again, or message us on WhatsApp if it continues.'}
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <button type="button" onClick={reset} className="btn-primary">
          {ar ? 'إعادة المحاولة' : 'Try again'}
        </button>
        <a href={ar ? '/ar' : '/en'} className="btn-outline">
          {ar ? 'الرئيسية' : 'Home'}
        </a>
      </div>
      {error.digest && <p className="mt-6 text-xs text-muted ltr-nums">#{error.digest}</p>}
    </div>
  )
}
