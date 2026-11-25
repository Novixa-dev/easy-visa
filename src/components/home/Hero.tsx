import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { waLink } from '@/lib/misc'
import { WhatsAppIcon } from '../icons'
import { QuickTrack } from './QuickTrack'

type Props = { title: string; subtitle?: string | null; whatsapp: string; city?: string | null }

export async function Hero({ title, subtitle, whatsapp, city }: Props) {
  const t = await getTranslations('home')
  return (
    <section className="relative isolate overflow-hidden bg-navy-50">
      {/* Dot texture: echoes the dotted world map on the brand flyer */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.55] [background-image:radial-gradient(rgb(12_36_84/0.16)_1.1px,transparent_1.2px)] [background-size:14px_14px] [mask-image:radial-gradient(ellipse_70%_80%_at_70%_40%,#000_20%,transparent_75%)] rtl:[mask-image:radial-gradient(ellipse_70%_80%_at_30%_40%,#000_20%,transparent_75%)]"
      />
      <div className="container-page grid items-center gap-12 pt-10 pb-16 sm:pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:pt-20 lg:pb-24">
        <div className="relative">
          {city && <p className="mb-4 text-[0.95rem] font-medium text-gold-700">{city}</p>}
          <h1 className="text-[2.6rem] leading-[1.12] font-bold sm:text-6xl lg:text-[4.25rem]">{title}</h1>
          {subtitle && <p className="mt-5 max-w-[46ch] text-lg leading-8 text-muted sm:text-xl sm:leading-9">{subtitle}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/services" className="btn-primary px-7">
              {t('primaryCta')}
            </Link>
            <a href={waLink(whatsapp)} target="_blank" rel="noopener noreferrer" className="btn-outline px-6">
              <WhatsAppIcon className="text-wa" />
              {t('secondaryCta')}
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:me-0">
          {/* The one orchestrated motion: a gold route drawn toward the pass, with a plane on it. */}
          <svg aria-hidden viewBox="0 0 420 220" className="pointer-events-none absolute -top-24 -start-10 hidden h-[220px] w-[420px] text-gold-500 sm:block rtl:-scale-x-100">
            <path
              id="route"
              d="M10 200 C 90 60, 260 20, 400 70"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="1"
              pathLength={1}
              className="animate-draw"
              style={{ strokeDashoffset: 0 }}
            />
            <path d="M10 200 C 90 60, 260 20, 400 70" fill="none" stroke="white" strokeWidth="3" strokeDasharray="0.012 0.018" pathLength={1} />
            <g
              className="animate-fly text-navy-800"
              style={{ offsetPath: "path('M10 200 C 90 60, 260 20, 400 70')", offsetRotate: 'auto' }}
            >
              <path d="M-11 0 L11 0 M2 0 L-4 -8 M2 0 L-4 8 M-9 0 L-12 -4 M-9 0 L-12 4" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
            </g>
          </svg>
          <div className="ticket-wrap">
            <QuickTrack />
          </div>
        </div>
      </div>
    </section>
  )
}
