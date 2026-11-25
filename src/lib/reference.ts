import { randomInt } from 'node:crypto'
import { toLatinDigits } from './digits'

// No 0/O/1/I/L: avoids confusion when read aloud or typed from a screenshot.
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'

/** Hard-to-guess public reference, e.g. EV-26-K7M3QX (31^6 ≈ 887M combinations per year). */
export function generateReference(date = new Date()): string {
  const yy = String(date.getUTCFullYear()).slice(-2)
  let code = ''
  for (let i = 0; i < 6; i++) code += ALPHABET[randomInt(ALPHABET.length)]
  return `EV-${yy}-${code}`
}

/** Clean what a customer typed: Arabic digits, lowercase, missing dashes, spaces. */
export function normalizeReference(input: string): string | null {
  const s = toLatinDigits(String(input ?? '')).toUpperCase().replace(/[^A-Z0-9]/g, '')
  const m = /^EV(\d{2})([A-Z0-9]{6})$/.exec(s)
  if (!m) return null
  return `EV-${m[1]}-${m[2]}`
}
