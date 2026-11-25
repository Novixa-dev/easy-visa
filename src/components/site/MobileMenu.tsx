'use client'
import { useEffect, useRef, useState } from 'react'
import { Link, usePathname } from '@/i18n/routing'
import { CloseIcon, MenuIcon, WhatsAppIcon } from '../icons'

type Props = {
  locale: string
  labels: { menu: string; close: string }
  items: { href: string; label: string }[]
  whatsapp: string
  whatsappLabel: string
}

export function MobileMenu({ labels, items, whatsapp, whatsappLabel }: Props) {
  const [open, setOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  useEffect(() => setOpen(false), [pathname])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex size-11 items-center justify-center rounded-lg text-navy-900 hover:bg-navy-50 lg:hidden"
        aria-label={labels.menu}
        aria-expanded={open}
      >
        <MenuIcon size={26} />
      </button>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        className="m-0 ms-auto h-dvh max-h-dvh w-[min(88vw,380px)] max-w-none bg-white p-0 text-ink backdrop:bg-navy-950/50 open:animate-[sheet_.22s_ease-out]"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-line px-4">
            <span className="font-display text-lg font-semibold text-navy-900">{labels.menu}</span>
            <button type="button" onClick={() => setOpen(false)} className="inline-flex size-11 items-center justify-center rounded-lg hover:bg-navy-50" aria-label={labels.close}>
              <CloseIcon size={24} />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-2 py-3">
            <ul>
              {items.map((i) => (
                <li key={i.href}>
                  <Link href={i.href} className="flex min-h-13 items-center rounded-lg px-3 text-lg font-medium text-navy-900 hover:bg-navy-50" aria-current={pathname.startsWith(i.href) ? 'page' : undefined}>
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t border-line p-4">
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn-wa w-full">
              <WhatsAppIcon /> {whatsappLabel}
            </a>
          </div>
        </div>
      </dialog>
      <style>{`@keyframes sheet{from{transform:translateX(var(--sheet-from,100%))}to{transform:none}}[dir=rtl] dialog{--sheet-from:-100%}`}</style>
    </>
  )
}
