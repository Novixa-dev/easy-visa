'use client'

import { DownloadIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

type DeferredInstallPrompt = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/** Offers a native installation flow only when the browser supports it. */
export function PwaInstallPrompt({ locale }: { locale: 'ar' | 'en' }) {
  const [prompt, setPrompt] = useState<DeferredInstallPrompt | null>(null)
  const [installed, setInstalled] = useState(true)

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
    setInstalled(standalone)

    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined)
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      setPrompt(event as DeferredInstallPrompt)
      setInstalled(false)
    }
    const onInstalled = () => {
      setPrompt(null)
      setInstalled(true)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed || !prompt) return null

  const install = async () => {
    await prompt.prompt()
    const choice = await prompt.userChoice
    if (choice.outcome !== 'accepted') setPrompt(null)
  }

  return (
    <button
      type="button"
      onClick={install}
      className="fixed bottom-24 end-4 z-30 inline-flex min-h-11 items-center gap-2 rounded-full bg-navy-900 px-4 text-sm font-semibold text-white shadow-lg shadow-navy-950/20 transition hover:bg-navy-800 focus:outline-none focus:ring-4 focus:ring-gold-400/40 md:bottom-5"
    >
      <DownloadIcon size={18} aria-hidden />
      {locale === 'ar' ? 'تثبيت التطبيق' : 'Install app'}
    </button>
  )
}
