import { toLatinDigits } from './digits'

export type PhoneCheck =
  | { ok: true; e164: string; country: 'YE' | 'SA' | 'OM' | 'AE' | 'OTHER' }
  | { ok: false }

/**
 * Normalize a phone number typed by a customer in Yemen or the Gulf.
 * Accepts Arabic digits, spaces, dashes, a leading 00 or +, and local Yemeni
 * mobiles typed without a country code (7XXXXXXXX or 07XXXXXXXX).
 */
export function normalizePhone(raw: string): PhoneCheck {
  let s = toLatinDigits(String(raw ?? '')).replace(/[\s\-().]/g, '')
  if (!s) return { ok: false }
  if (s.startsWith('00')) s = '+' + s.slice(2)
  if (!s.startsWith('+')) {
    const local = s.replace(/^0/, '')
    if (/^7[01378]\d{7}$/.test(local)) return { ok: true, e164: '+967' + local, country: 'YE' }
    if (/^05\d{8}$/.test(s)) return { ok: true, e164: '+966' + s.slice(1), country: 'SA' }
    return { ok: false }
  }
  if (!/^\+\d{8,15}$/.test(s)) return { ok: false }
  if (s.startsWith('+967')) {
    const n = s.slice(4)
    if (/^7[01378]\d{7}$/.test(n) || /^[1-6]\d{6,7}$/.test(n)) return { ok: true, e164: s, country: 'YE' }
    return { ok: false }
  }
  if (s.startsWith('+966')) return /^5\d{8}$/.test(s.slice(4)) ? { ok: true, e164: s, country: 'SA' } : { ok: false }
  if (s.startsWith('+968')) return /^\d{8}$/.test(s.slice(4)) ? { ok: true, e164: s, country: 'OM' } : { ok: false }
  if (s.startsWith('+971')) return /^5\d{8}$/.test(s.slice(4)) ? { ok: true, e164: s, country: 'AE' } : { ok: false }
  return { ok: true, e164: s, country: 'OTHER' }
}

/** Digits only, as used by wa.me links. */
export const waDigits = (e164: string) => toLatinDigits(e164).replace(/\D/g, '')

/** Last 4 digits of a phone, used as the second tracking factor. */
export const lastFour = (e164: string) => waDigits(e164).slice(-4)

/** Display format: +967 780 007 578 */
export function formatPhone(e164: string): string {
  const d = waDigits(e164)
  if (d.startsWith('967') && d.length === 12) return `+967 ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}`
  if (d.startsWith('966') && d.length === 12) return `+966 ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8)}`
  return '+' + d
}
