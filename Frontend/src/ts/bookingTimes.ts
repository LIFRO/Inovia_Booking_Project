import type { BookingDto } from './dto/BookingDto'
import type { WeeklyTimeDto } from './dto/WeeklyTimeDto'

export function nextHour(time: string): string {
  return `${String(Number(time.slice(0, 2)) + 1).padStart(2, '0')}:00`
}

export function freeHours(
  schedule: WeeklyTimeDto[], bookings: BookingDto[], date: string, resourceId: number | undefined,
  openingTime: string, closingTime: string, today: string, currentTime: string,
): string[] {
  if (!date || resourceId === undefined) return []

  const dayBookings = bookings.filter(booking => booking.date === date && booking.resourceId === resourceId)
  return [...new Set(schedule
    .filter(time => time.availableDate === date)
    .map(time => time.availableTime.slice(0, 5))
    .filter(time => time.endsWith(':00') && time >= openingTime && time < closingTime)
    .filter(time => date > today || (date === today && `${time}:00` >= currentTime))
    .filter(time => !dayBookings.some(booking =>
      booking.startTime.slice(0, 5) < nextHour(time) && booking.endTime.slice(0, 5) > time
    )))].sort()
}

export function endTimes(startTime: string, availableHours: string[]): string[] {
  const ends: string[] = []
  for (let hour = startTime; availableHours.includes(hour); hour = nextHour(hour)) {
    ends.push(nextHour(hour))
  }
  return ends
}
