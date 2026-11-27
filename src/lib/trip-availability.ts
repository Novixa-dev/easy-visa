/** Public booking state derived from a trip's seats and departure settings. */
export type TripAvailability = 'open' | 'few' | 'full' | 'closed' | 'departed'

export function tripAvailability(
  trip: {
    bookingOpen?: boolean | null
    manualFull?: boolean | null
    seatsTotal?: number | null
    seatsBooked?: number | null
    seatsHeldOffline?: number | null
    departureAt?: string | null
  },
  now = new Date(),
): { state: TripAvailability; seatsLeft: number | null } {
  const total = trip.seatsTotal ?? null
  const left = total == null ? null : Math.max(0, total - (trip.seatsBooked ?? 0) - (trip.seatsHeldOffline ?? 0))
  if (trip.departureAt && new Date(trip.departureAt) < now) return { state: 'departed', seatsLeft: left }
  if (trip.bookingOpen === false) return { state: 'closed', seatsLeft: left }
  if (trip.manualFull || left === 0) return { state: 'full', seatsLeft: 0 }
  if (left != null && total != null && left <= Math.max(2, Math.ceil(total * 0.15))) return { state: 'few', seatsLeft: left }
  return { state: 'open', seatsLeft: left }
}
