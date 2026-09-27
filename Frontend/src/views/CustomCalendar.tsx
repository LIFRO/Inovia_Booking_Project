import { useState } from 'react'
import CancelBookingModal from '../components/CancelBookingModal'
import { addDays, startOfWeek, todayInStockholm } from '../ts/dateUtils'
import { nextHour } from '../ts/bookingTimes'
import type { BookingDto } from '../ts/dto/BookingDto'
import { useAuth } from '../ts/types/AuthContext'
import './CSS/CustomCalendar.css'

type View = 'week' | 'day' | 'agenda'

interface Props {
  selectedResource: string
  selectedDate: string
  onDateChange: (date: string) => void
  onDaySelect: (date: string) => void
  onTimeSelect: (date: string, time: string) => void
  dayBoundaries: { start: string, end: string }
  bookings: BookingDto[]
  availableSlotsByDay: Record<string, string[]>
  availabilityLoading: boolean
  availabilityError: string
  onBookingCancelled: (id: number) => void
}

const dateLabel = new Intl.DateTimeFormat('sv-SE', {
  weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC',
})
function asDate(date: string): Date {
  return new Date(`${date}T00:00:00Z`)
}

function minutes(time: string): number {
  return Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5))
}

export default function CustomCalendar({ selectedResource, selectedDate, onDateChange, onDaySelect, onTimeSelect, dayBoundaries, bookings, availableSlotsByDay, availabilityLoading, availabilityError, onBookingCancelled }: Props) {
  const { userId } = useAuth()
  const [view, setView] = useState<View>('week')
  const [selectedBooking, setSelectedBooking] = useState<BookingDto | null>(null)

  const weekStart = startOfWeek(selectedDate || todayInStockholm())
  const days = view === 'day'
    ? [selectedDate || todayInStockholm()]
    : Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
  const visibleBookings = bookings
    .filter(booking => booking.resourceName === selectedResource && days.includes(booking.date))
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))

  const firstMinute = minutes(dayBoundaries.start)
  const lastMinute = minutes(dayBoundaries.end)
  const hours = Array.from(
    { length: Math.ceil((lastMinute - firstMinute) / 60) },
    (_, index) => `${String(Math.floor(firstMinute / 60) + index).padStart(2, '0')}:00`,
  )
  const gridHeight = (lastMinute - firstMinute) / 60 * 64

  function move(amount: number) {
    onDateChange(addDays(selectedDate || todayInStockholm(), amount * (view === 'day' ? 1 : 7)))
  }

  function bookingItem(booking: BookingDto, positioned = false) {
    const start = Math.max(minutes(booking.startTime), firstMinute)
    const end = Math.min(minutes(booking.endTime), lastMinute)
    if (positioned && end <= start) return null

    const own = booking.userId === userId
    const content = <>
      <strong>{booking.startTime.slice(0, 5)}–{booking.endTime.slice(0, 5)}</strong>
      <span>{booking.resourceName}</span>
    </>
    const className = `calendarBooking${own ? '' : ' calendarBookingTaken'}${positioned ? ' calendarBookingPositioned' : ''}`
    const style = positioned ? { top: (start - firstMinute) / 60 * 64, height: (end - start) / 60 * 64 } : undefined

    return own
      ? <button key={booking.id} type="button" className={className} style={style}
          onClick={() => setSelectedBooking(booking)} aria-label={`View booking ${booking.date}, ${booking.startTime.slice(0, 5)} to ${booking.endTime.slice(0, 5)}`}>
          {content}
        </button>
      : <div key={booking.id} className={className} style={style} title="Booked by another user">{content}</div>
  }

  return <section className="customCalendar" aria-label="Booking calendar">
    <header className="calendarHeader">
      <div className="calendarNavigation">
        <button type="button" onClick={() => move(-1)} aria-label="Previous period">‹</button>
        <button type="button" onClick={() => onDateChange(todayInStockholm())}>Today</button>
        <button type="button" onClick={() => move(1)} aria-label="Next period">›</button>
      </div>
      <h2>{view === 'day' ? dateLabel.format(asDate(days[0])) : `${dateLabel.format(asDate(days[0]))} – ${dateLabel.format(asDate(days[6]))}`}</h2>
      <div className="calendarViews" aria-label="Calendar view">
        {(['week', 'day', 'agenda'] as const).map(option =>
          <button key={option} type="button" aria-pressed={view === option}
            onClick={() => setView(option)}>{option[0].toUpperCase() + option.slice(1)}</button>
        )}
      </div>
    </header>

    {availabilityError && <p className="calendarError" role="alert">{availabilityError}</p>}
    {availabilityLoading && <p className="calendarAvailabilityStatus" role="status">Loading available times…</p>}

    {view === 'agenda' ? <div className="calendarAgenda">
      {days.map(day => <div className="agendaDay" key={day}>
        <h3><button type="button" className={`agendaDayButton${day === selectedDate ? ' selected' : ''}`}
          onClick={() => onDaySelect(day)} aria-label={`Select ${day} for booking`}>
          {dateLabel.format(asDate(day))}
        </button></h3>
        <div className="agendaBookings">
          {!availabilityLoading && !availabilityError && (availableSlotsByDay[day] ?? []).map(time =>
            <button key={time} type="button" className="calendarAvailable" onClick={() => onTimeSelect(day, time)}
              aria-label={`${day}, ${time} to ${nextHour(time)} available for ${selectedResource}`}>
              {time}–{nextHour(time)} available
            </button>
          )}
          {visibleBookings.filter(booking => booking.date === day).map(booking => bookingItem(booking))}
          {!availabilityLoading && !availabilityError && !visibleBookings.some(booking => booking.date === day) &&
            !(availableSlotsByDay[day]?.length) && <p>No available times</p>}
        </div>
      </div>)}
    </div> : <div className="calendarScroll" role="region" aria-label="Calendar time grid" tabIndex={0}>
      <div className="calendarGrid" style={{ gridTemplateColumns: `64px repeat(${days.length}, minmax(120px, 1fr))` }}>
        <div className="calendarCorner" />
        {days.map(day => <button key={day} type="button"
          className={`calendarDayHeader${day === selectedDate ? ' selected' : ''}`}
          onClick={() => onDaySelect(day)}>{dateLabel.format(asDate(day))}</button>)}
        <div className="calendarHours" style={{ height: gridHeight }}>
          {hours.map(hour => <span key={hour}>{hour}</span>)}
        </div>
        {days.map(day => <div className={`calendarDay${day === selectedDate ? ' selected' : ''}`} key={day} style={{ height: gridHeight }}>
          <button type="button" className="calendarDaySelect" onClick={() => onDaySelect(day)}
            aria-label={`Select ${day} for booking`} title={`Book for ${day}`} />
          {!availabilityLoading && !availabilityError && (availableSlotsByDay[day] ?? []).map(time =>
            <button key={time} type="button" className="calendarAvailable calendarAvailablePositioned"
              style={{ top: (minutes(time) - firstMinute) / 60 * 64, height: 64 }}
              onClick={() => onTimeSelect(day, time)}
              aria-label={`${day}, ${time} to ${nextHour(time)} available for ${selectedResource}`}>
              <strong>{time}–{nextHour(time)}</strong><span>Available</span>
            </button>
          )}
          {visibleBookings.filter(booking => booking.date === day).map(booking => bookingItem(booking, true))}
        </div>)}
      </div>
    </div>}

    {selectedBooking && <CancelBookingModal booking={selectedBooking}
      onClose={() => setSelectedBooking(null)}
      onCancelled={() => {
        onBookingCancelled(selectedBooking.id)
        setSelectedBooking(null)
      }} />}
  </section>
}
