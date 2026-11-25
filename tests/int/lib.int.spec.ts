import { describe, expect, it } from 'vitest'
import { toLatinDigits } from '@/lib/digits'
import { formatPhone, lastFour, normalizePhone } from '@/lib/phone'
import { generateReference, normalizeReference } from '@/lib/reference'
import { formatPrice } from '@/lib/format'
import { sanitizeValues, validateAll, validateField, type FormFieldDef } from '@/lib/form-schema'
import { csvCell, toCsv } from '@/endpoints/export'
import { tripAvailability } from '@/collections/Trips'
import { offerLifecycle } from '@/collections/Offers'
import { rateLimit } from '@/lib/rate-limit'

describe('digits', () => {
  it('converts Arabic-Indic and Persian digits', () => {
    expect(toLatinDigits('٧٧٧١٢٣')).toBe('777123')
    expect(toLatinDigits('۰۹')).toBe('09')
    expect(toLatinDigits('abc ١')).toBe('abc 1')
  })
})

describe('phone', () => {
  it.each([
    ['777123456', '+967777123456'],
    ['0777123456', '+967777123456'],
    ['٧٧٧١٢٣٤٥٦', '+967777123456'],
    ['00967 777-123-456', '+967777123456'],
    ['+967780007578', '+967780007578'],
    ['0501234567', '+966501234567'],
    ['+966 50 123 4567', '+966501234567'],
  ])('normalises %s', (input, expected) => {
    const r = normalizePhone(input)
    expect(r.ok && r.e164).toBe(expected)
  })
  it.each(['', '12', '+9671', '777', '+966 40 123 4567', 'abc'])('rejects %s', (input) => {
    expect(normalizePhone(input).ok).toBe(false)
  })
  it('formats and extracts last four', () => {
    expect(formatPhone('+967780007578')).toBe('+967 780 007 578')
    expect(lastFour('+967780007578')).toBe('7578')
  })
})

describe('reference', () => {
  it('generates hard-to-guess references without ambiguous characters', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 500; i++) {
      const r = generateReference(new Date('2026-05-01'))
      expect(r).toMatch(/^EV-26-[2-9A-HJKMNP-Z]{6}$/)
      seen.add(r)
    }
    expect(seen.size).toBeGreaterThan(495)
  })
  it('normalises what customers type', () => {
    expect(normalizeReference('ev26k7m3qx')).toBe('EV-26-K7M3QX')
    expect(normalizeReference(' EV-٢٦-k7m3qx ')).toBe('EV-26-K7M3QX')
    expect(normalizeReference('hello')).toBeNull()
  })
})

describe('price formatting', () => {
  it('hides, quotes and formats', () => {
    expect(formatPrice({ mode: 'hidden' }, 'ar')).toBeNull()
    expect(formatPrice({ mode: 'quote' }, 'en')).toBe('Price on request')
    expect(formatPrice({ mode: 'fixed', amount: 1500, currency: 'SAR' }, 'en')).toBe('SAR 1,500')
    expect(formatPrice({ mode: 'from', amount: 300, currency: 'USD' }, 'ar')).toBe('ابتداءً من 300 دولار')
    expect(formatPrice({ mode: 'range', amount: 100, amountMax: 200, currency: 'SAR' }, 'en')).toBe('SAR 100 – SAR 200')
  })
})

describe('dynamic form validation', () => {
  const fields: FormFieldDef[] = [
    { name: 'travelers', type: 'number', label: 'Travellers', required: true, min: 1, max: 9 },
    { name: 'tripType', type: 'radio', label: 'Trip', required: true, options: [{ value: 'oneway', label: 'One way' }, { value: 'round', label: 'Round' }] },
    { name: 'departureDate', type: 'date', label: 'Departure', required: true },
    { name: 'returnDate', type: 'date', label: 'Return', required: true, afterField: 'departureDate', showWhen: { field: 'tripType', equals: 'round' } },
    { name: 'email', type: 'email', label: 'Email' },
  ]
  it('accepts valid values incl. Arabic digits', () => {
    expect(validateAll(fields, { travelers: '٣', tripType: 'oneway', departureDate: '2030-01-10' }, 'en')).toEqual({})
  })
  it('reports range, option and required errors', () => {
    const e = validateAll(fields, { travelers: '12', tripType: 'other' }, 'en')
    expect(e.travelers).toMatch(/Maximum/)
    expect(e.tripType).toMatch(/Choose/)
    expect(e.departureDate).toMatch(/required/)
  })
  it('applies conditional fields and date ordering', () => {
    const v = { travelers: '2', tripType: 'round', departureDate: '2030-01-10', returnDate: '2030-01-05' }
    expect(validateAll(fields, v, 'en').returnDate).toMatch(/after/)
    expect(validateField(fields[3], undefined, { tripType: 'oneway' }, 'en')).toBeNull()
  })
  it('sanitises: drops hidden/unknown fields and coerces numbers', () => {
    const out = sanitizeValues(fields, { travelers: '٤', tripType: 'oneway', returnDate: '2030-01-01', hack: 'x' })
    expect(out).toEqual({ travelers: 4, tripType: 'oneway' })
  })
})

describe('CSV export safety', () => {
  it('neutralises spreadsheet formulas and quotes', () => {
    expect(csvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`)
    expect(csvCell('+967777')).toBe(`"'+967777"`)
    expect(csvCell('سالم')).toBe('"سالم"')
    expect(toCsv([['a', 'b']]).startsWith('﻿')).toBe(true)
  })
})

describe('trip availability', () => {
  const future = new Date(Date.now() + 86400_000).toISOString()
  it('computes seats left and states', () => {
    expect(tripAvailability({ seatsTotal: 40, seatsBooked: 10, seatsHeldOffline: 5, departureAt: future })).toEqual({ state: 'open', seatsLeft: 25 })
    expect(tripAvailability({ seatsTotal: 40, seatsBooked: 30, seatsHeldOffline: 6, departureAt: future }).state).toBe('few')
    expect(tripAvailability({ seatsTotal: 10, seatsBooked: 10, departureAt: future }).state).toBe('full')
    expect(tripAvailability({ seatsTotal: 10, manualFull: true, departureAt: future }).state).toBe('full')
    expect(tripAvailability({ bookingOpen: false, departureAt: future }).state).toBe('closed')
    expect(tripAvailability({ departureAt: new Date(Date.now() - 1000).toISOString() }).state).toBe('departed')
    expect(tripAvailability({ departureAt: future })).toEqual({ state: 'open', seatsLeft: null })
  })
})

describe('offer lifecycle', () => {
  const now = new Date('2026-06-01')
  it('derives the state from status and dates', () => {
    expect(offerLifecycle({ status: 'draft' }, now)).toBe('draft')
    expect(offerLifecycle({ status: 'archived' }, now)).toBe('archived')
    expect(offerLifecycle({ status: 'published', startDate: '2026-07-01' }, now)).toBe('scheduled')
    expect(offerLifecycle({ status: 'published', startDate: '2026-05-01', endDate: '2026-05-20' }, now)).toBe('expired')
    expect(offerLifecycle({ status: 'published', startDate: '2026-05-01', endDate: '2026-06-20' }, now)).toBe('active')
  })
})

describe('rate limiter', () => {
  it('blocks after the limit within the window', () => {
    const key = 'test:' + Math.random()
    for (let i = 0; i < 3; i++) expect(rateLimit(key, 3, 60_000).ok).toBe(true)
    const r = rateLimit(key, 3, 60_000)
    expect(r.ok).toBe(false)
    expect(r.retryAfter).toBeGreaterThan(0)
  })
})
