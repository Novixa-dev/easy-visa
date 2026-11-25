import type { CollectionConfig, Payload, PayloadRequest } from 'payload'
import { isOwner, isStaff } from '@/access'
import { L, priceField, publishStatusField, slugField } from '@/fields/common'
import { audited } from '@/hooks/audit'

/** Requests in these statuses still hold their seats. */
export const HOLDING_STATUSES = ['new', 'under_review', 'awaiting_customer', 'in_progress', 'completed'] as const

export type TripAvailability = 'open' | 'few' | 'full' | 'closed' | 'departed'

export function tripAvailability(t: {
  bookingOpen?: boolean | null
  manualFull?: boolean | null
  seatsTotal?: number | null
  seatsBooked?: number | null
  seatsHeldOffline?: number | null
  departureAt?: string | null
}, now = new Date()): { state: TripAvailability; seatsLeft: number | null } {
  const total = t.seatsTotal ?? null
  const left = total == null ? null : Math.max(0, total - (t.seatsBooked ?? 0) - (t.seatsHeldOffline ?? 0))
  if (t.departureAt && new Date(t.departureAt) < now) return { state: 'departed', seatsLeft: left }
  if (t.bookingOpen === false) return { state: 'closed', seatsLeft: left }
  if (t.manualFull || left === 0) return { state: 'full', seatsLeft: 0 }
  if (left != null && total != null && left <= Math.max(2, Math.ceil(total * 0.15))) return { state: 'few', seatsLeft: left }
  return { state: 'open', seatsLeft: left }
}

/** Recount seats held by requests for a trip (called whenever a linked request changes). */
export async function recountTripSeats(payload: Payload, tripId: number | string, req?: PayloadRequest) {
  // Must run inside the caller's transaction (req), otherwise it waits on the
  // row lock held by the request being saved.
  const res = await payload.find({
    collection: 'requests',
    where: { and: [{ trip: { equals: tripId } }, { status: { in: [...HOLDING_STATUSES] } }] },
    limit: 1000,
    depth: 0,
    overrideAccess: true,
    select: { seats: true },
    req,
  })
  const seatsBooked = res.docs.reduce((a, r) => a + (r.seats ?? 1), 0)
  await payload.update({ collection: 'trips', id: tripId, data: { seatsBooked }, overrideAccess: true, req, context: { skipAudit: true } })
  return seatsBooked
}

export const Trips: CollectionConfig = {
  slug: 'trips',
  labels: { singular: L('رحلة', 'Trip'), plural: L('الرحلات المتاحة', 'Available trips') },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'departureAt', 'seatsTotal', 'seatsBooked', 'availability', 'status'],
    group: L('الرحلات', 'Trips'),
    listSearchableFields: ['title', 'slug'],
    description: L(
      'رحلات بمواعيد ومقاعد محددة (باصات، طيران، باقات عمرة). المقاعد المحجوزة تُحسب تلقائياً من الطلبات.',
      'Scheduled departures with limited seats (buses, flights, Umrah packages). Booked seats are counted automatically from requests.',
    ),
  },
  defaultSort: 'departureAt',
  access: {
    read: ({ req }) => (isStaff(req) ? true : { status: { equals: 'published' } }),
    create: ({ req }) => isOwner(req),
    update: ({ req }) => isOwner(req),
    delete: ({ req }) => isOwner(req),
  },
  hooks: audited,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: L('الرحلة', 'Trip'),
          fields: [
            { name: 'title', type: 'text', required: true, localized: true, label: L('عنوان الرحلة', 'Trip title'), admin: { description: L('مثال: المكلا ← جدة (باص)', 'e.g. Mukalla → Jeddah (bus)') } },
            {
              type: 'row',
              fields: [
                {
                  name: 'type',
                  type: 'select',
                  required: true,
                  defaultValue: 'bus',
                  label: L('النوع', 'Type'),
                  options: [
                    { label: L('باص / نقل بري', 'Bus / land'), value: 'bus' },
                    { label: L('طيران', 'Flight'), value: 'flight' },
                    { label: L('باقة عمرة', 'Umrah package'), value: 'umrah' },
                    { label: L('باقة سياحية', 'Holiday package'), value: 'package' },
                  ],
                },
                { name: 'company', type: 'relationship', relationTo: 'companies', label: L('الشركة / المزوّد', 'Company / provider') },
                { name: 'service', type: 'relationship', relationTo: 'services', label: L('الخدمة المرتبطة (للتقارير)', 'Linked service (for reports)') },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'from', type: 'text', required: true, localized: true, label: L('من', 'From') },
                { name: 'to', type: 'text', required: true, localized: true, label: L('إلى', 'To') },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'departureAt', type: 'date', required: true, index: true, label: L('موعد الانطلاق', 'Departure'), admin: { date: { pickerAppearance: 'dayAndTime', timeIntervals: 15 } } },
                { name: 'returnAt', type: 'date', label: L('موعد العودة (اختياري)', 'Return (optional)'), admin: { date: { pickerAppearance: 'dayAndTime', timeIntervals: 15 } } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'duration', type: 'text', localized: true, label: L('المدة', 'Duration'), admin: { description: L('مثال: 18 ساعة، 10 أيام', 'e.g. 18 hours, 10 days') } },
                { name: 'meetingPoint', type: 'text', localized: true, label: L('نقطة التجمع / الانطلاق', 'Meeting / departure point') },
              ],
            },
            { name: 'image', type: 'upload', relationTo: 'media', label: L('صورة', 'Image') },
            {
              name: 'features',
              type: 'array',
              label: L('المميزات والخدمات المشمولة', 'Features & inclusions'),
              fields: [{ name: 'item', type: 'text', required: true, localized: true, label: L('الميزة', 'Feature') }],
            },
            { name: 'details', type: 'textarea', localized: true, label: L('تفاصيل وشروط', 'Details & conditions') },
          ],
        },
        {
          label: L('السعر والمقاعد', 'Price & seats'),
          fields: [
            priceField,
            { name: 'childPrice', type: 'number', min: 0, label: L('سعر الطفل (اختياري)', 'Child price (optional)') },
            {
              type: 'row',
              fields: [
                { name: 'seatsTotal', type: 'number', min: 0, label: L('إجمالي المقاعد', 'Total seats'), admin: { description: L('اتركه فارغاً إن كانت غير محدودة', 'Leave empty if unlimited') } },
                { name: 'seatsBooked', type: 'number', min: 0, defaultValue: 0, label: L('محجوزة عبر الطلبات', 'Booked via requests'), admin: { readOnly: true, description: L('تُحسب تلقائياً', 'Counted automatically') } },
                { name: 'seatsHeldOffline', type: 'number', min: 0, defaultValue: 0, label: L('محجوزة خارج الموقع', 'Held offline'), admin: { description: L('حجوزات تمت بالهاتف أو المكتب', 'Bookings made by phone or at the office') } },
              ],
            },
            { name: 'maxSeatsPerBooking', type: 'number', min: 1, defaultValue: 10, label: L('أقصى عدد مقاعد للطلب الواحد', 'Max seats per request') },
            { name: 'showSeatsLeft', type: 'checkbox', defaultValue: true, label: L('إظهار المقاعد المتبقية للعملاء', 'Show seats left to customers') },
          ],
        },
      ],
    },
    {
      name: 'availability',
      type: 'text',
      virtual: true,
      label: L('التوفر', 'Availability'),
      admin: { readOnly: true, position: 'sidebar' },
      hooks: {
        afterRead: [
          ({ siblingData }) => {
            const a = tripAvailability(siblingData)
            const label = { open: 'متاح', few: 'مقاعد قليلة', full: 'مكتمل', closed: 'الحجز مغلق', departed: 'انطلقت' }[a.state]
            return a.seatsLeft == null ? label : `${label} (${a.seatsLeft})`
          },
        ],
      },
    },
    slugField(),
    publishStatusField,
    { name: 'bookingOpen', type: 'checkbox', defaultValue: true, label: L('الحجز مفتوح', 'Booking open'), admin: { position: 'sidebar' } },
    { name: 'manualFull', type: 'checkbox', label: L('اعتبرها مكتملة', 'Mark as full'), admin: { position: 'sidebar' } },
    { name: 'featured', type: 'checkbox', label: L('مميزة في الرئيسية', 'Featured on homepage'), admin: { position: 'sidebar' } },
    {
      name: 'bookings',
      type: 'join',
      collection: 'requests',
      on: 'trip',
      label: L('طلبات الحجز', 'Booking requests'),
      admin: { defaultColumns: ['reference', 'contactName', 'seats', 'status'] },
    },
  ],
}
