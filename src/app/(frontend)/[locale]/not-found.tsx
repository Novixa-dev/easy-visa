import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

export default function NotFound() {
  const t = useTranslations('notFound')
  return (
    <div className="container-page py-24 text-center">
      <p className="ltr-nums font-display text-7xl font-bold text-gold-500">404</p>
      <h1 className="mt-4 text-3xl font-bold">{t('title')}</h1>
      <p className="mx-auto mt-3 max-w-md text-lg text-muted">{t('text')}</p>
      <Link href="/" className="btn-primary mt-8">
        {t('cta')}
      </Link>
    </div>
  )
}
