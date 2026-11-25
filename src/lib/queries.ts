import 'server-only'
import { cache } from 'react'
import { getPayloadClient } from './payload'
import type { Locale } from './constants'
import { offerLifecycle } from '@/collections/Offers'

export const getSettings = cache(async (locale: Locale) => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings', locale, depth: 0 })
})

export const getHomepage = cache(async (locale: Locale) => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'homepage', locale, depth: 1 })
})

export const getAbout = cache(async (locale: Locale) => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'about-page', locale, depth: 0 })
})

export const getLegal = cache(async (locale: Locale) => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'legal-pages', locale, depth: 0 })
})

export const getCategories = cache(async (locale: Locale) => {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'service-categories', locale, sort: 'sortOrder', limit: 20, depth: 0 })
  return res.docs
})

export const getServices = cache(async (locale: Locale, categorySlug?: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'services',
    locale,
    where: {
      status: { equals: 'published' },
      ...(categorySlug ? { 'category.slug': { equals: categorySlug } } : {}),
    },
    sort: 'sortOrder',
    limit: 100,
    depth: 1,
    select: { title: true, summary: true, slug: true, icon: true, price: true, available: true, category: true, featured: true, image: true },
  })
  return res.docs
})

export const getService = cache(async (locale: Locale, slug: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'services',
    locale,
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    limit: 1,
    depth: 2,
  })
  return res.docs[0] ?? null
})

export const getDestinations = cache(async (locale: Locale) => {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'destinations', locale, where: { active: { equals: true } }, sort: 'sortOrder', limit: 300, depth: 0 })
  return res.docs.map((d) => ({ value: d.code, label: d.name }))
})

export const getOffers = cache(async (locale: Locale) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'offers',
    locale,
    where: { status: { equals: 'published' } },
    sort: '-startDate',
    limit: 60,
    depth: 1,
  })
  const now = new Date()
  const withState = res.docs.map((o) => ({ ...o, state: offerLifecycle(o, now) }))
  return {
    active: withState.filter((o) => o.state === 'active').sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    past: withState.filter((o) => o.state === 'expired').slice(0, 12),
  }
})

export const getOffer = cache(async (locale: Locale, slug: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'offers', locale, where: { slug: { equals: slug }, status: { equals: 'published' } }, limit: 1, depth: 1 })
  const o = res.docs[0]
  return o ? { ...o, state: offerLifecycle(o) } : null
})

export const getTrips = cache(async (locale: Locale, type?: string, limit = 60) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'trips',
    locale,
    where: {
      status: { equals: 'published' },
      departureAt: { greater_than: new Date().toISOString() },
      ...(type ? { type: { equals: type } } : {}),
    },
    sort: 'departureAt',
    limit,
    depth: 1,
  })
  return res.docs
})

export const getTrip = cache(async (locale: Locale, slug: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'trips', locale, where: { slug: { equals: slug }, status: { equals: 'published' } }, limit: 1, depth: 1 })
  return res.docs[0] ?? null
})

export const getFaqs = cache(async (locale: Locale) => {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'faqs', locale, where: { status: { equals: 'published' } }, sort: 'sortOrder', limit: 100, depth: 0 })
  return res.docs
})
