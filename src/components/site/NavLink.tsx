'use client'
import { Link, usePathname } from '@/i18n/routing'
import { cn } from '@/lib/misc'

export function NavLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(href + '/')
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative rounded-lg px-3 py-2 text-[0.95rem] font-medium text-navy-900/80 transition-colors hover:bg-navy-50 hover:text-navy-900',
        active && 'text-navy-900 after:absolute after:inset-x-3 after:-bottom-[13px] after:h-[3px] after:rounded-full after:bg-gold-500',
        className,
      )}
    >
      {children}
    </Link>
  )
}
