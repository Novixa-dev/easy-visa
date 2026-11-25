import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { waDigits } from './phone'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export function waLink(phoneE164: string, text?: string): string {
  const base = `https://wa.me/${waDigits(phoneE164)}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
