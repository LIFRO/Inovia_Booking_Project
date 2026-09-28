import { useEffect, useRef, useState, type CSSProperties, type TouchEvent } from 'react'
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
  onBookingCancelled: (booking: BookingDto) => void
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
  const [isPhone, setIsPhone] = useState(() => window.matchMedia('(max-width: 760px)').matches)
  const [view, setView] = useState<View>('week')
  const [selectedBooking, setSelectedBooking] = useState<BookingDto | null>(null)
  const calendarScrollRef = useRef<HTMLDivElement>(null)
  const [scrollHeight, setScrollHeight] = useState(0)
  const swipeStart = useRef<{ x: number, y: number } | null>(null)
  const pinchStart = useRef<number | null>(null)
  const pinchDistance = useRef<number | null>(null)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 760px)')
    const onChange = (event: MediaQueryListEvent) => setIsPhone(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const scroll = calendarScrollRef.current
    if (!scroll) return

    const observer = new ResizeObserver(([entry]) => setScrollHeight(entry.contentRect.height))
    observer.observe(scroll)
    return () => observer.disconnect()
  }, [view])

  const weekStart = startOfWeek(selectedDate || todayInStockholm())
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
  const days = view === 'day'
    ? [selectedDate || todayInStockholm()]
    : weekDays
  const visibleBookings = bookings
    .filter(booking => booking.resourceName === selectedResource && days.includes(booking.date))
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))

  const visibleStartTimes = [
    ...days.flatMap(day => availableSlotsByDay[day] ?? []),
    ...visibleBookings.map(booking => booking.startTime),
  ]
  const firstMinute = visibleStartTimes.length
    ? Math.min(...visibleStartTimes.map(minutes))
    : minutes(dayBoundaries.start)
  const lastMinute = minutes(dayBoundaries.end)
  const hours = Array.from(
    { length: Math.ceil((lastMinute - firstMinute) / 60) },
    (_, index) => `${String(Math.floor(firstMinute / 60) + index).padStart(2, '0')}:00`,
  )
  const hourHeight = scrollHeight
    ? Math.max(44, (scrollHeight - 52) / hours.length)
    : 64
  const gridHeight = hours.length * hourHeight

  function move(amount: number) {
    onDateChange(addDays(selectedDate || todayInStockholm(), amount * (view === 'day' ? 1 : 7)))
  }

  function touchDistance(event: TouchEvent) {
    const [first, second] = [event.touches[0], event.touches[1]]
    return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY)
  }

  function handleTouchStart(event: TouchEvent) {
    if (!isPhone) return
    if (event.touches.length >= 2) {
      pinchStart.current = touchDistance(event)
      pinchDistance.current = pinchStart.current
      swipeStart.current = null
      return
    }
    const touch = event.touches[0]
    swipeStart.current = { x: touch.clientX, y: touch.clientY }
  }

  function handleTouchMove(event: TouchEvent) {
    if (pinchStart.current !== null && event.touches.length >= 2) {
      pinchDistance.current = touchDistance(event)
    }
  }

  function handleTouchEnd(event: TouchEvent) {
    if (pinchStart.current !== null) {
      if (event.touches.length < 2) {
        const ratio = (pinchDistance.current ?? pinchStart.current) / pinchStart.current
        if (ratio > 1.2) setView('day')
        if (ratio < 0.8) setView('week')
        pinchStart.current = null
        pinchDistance.current = null
      }
      return
    }
    const start = swipeStart.current
    swipeStart.current = null
    if (!start || !isPhone) return
    const scroll = event.currentTarget
    if (scroll.classList.contains('calendarScroll') && scroll.scrollWidth > scroll.clientWidth) return
    const touch = event.changedTouches[0]
    const horizontal = touch.clientX - start.x
    const vertical = touch.clientY - start.y
    if (Math.abs(horizontal) < 50 || Math.abs(horizontal) <= Math.abs(vertical) * 1.25) return
    const amount = view === 'day' ? 1 : 7
    onDateChange(addDays(selectedDate || todayInStockholm(), horizontal > 0 ? amount : -amount))
  }

  function handleTouchCancel() {
    swipeStart.current = null
    pinchStart.current = null
    pinchDistance.current = null
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
    const style = positioned ? { top: (start - firstMinute) / 60 * hourHeight, height: (end - start) / 60 * hourHeight } : undefined

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
      <h2>{view === 'day' ? dateLabel.format(asDate(days[0])) : `${dateLabel.format(asDate(weekDays[0]))} – ${dateLabel.format(asDate(weekDays[6]))}`}</h2>
      <div className="calendarViews" aria-label="Calendar view">
        {(['week', 'day', 'agenda'] as const).map(option =>
          <button key={option} type="button" aria-pressed={view === option}
            onClick={() => setView(option)}>{option[0].toUpperCase() + option.slice(1)}</button>
        )}
      </div>
    </header>

    {availabilityError && <p className="calendarError" role="alert">{availabilityError}</p>}
    {availabilityLoading && <p className="calendarAvailabilityStatus" role="status">Loading available times…</p>}

    {view === 'agenda' ? <div className="calendarAgenda"
      onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchCancel}>
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
    </div> : <div className="calendarScroll" ref={calendarScrollRef} role="region" aria-label="Calendar time grid" tabIndex={0}
      onWheel={event => {
        const scroll = event.currentTarget
        if (scroll.scrollHeight <= scroll.clientHeight + 4 && scroll.scrollWidth > scroll.clientWidth &&
          Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
          scroll.scrollLeft += event.deltaY
        }
      }}
      onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchCancel}>
      <div className="calendarGrid" data-view={view} style={{ gridTemplateColumns: `64px repeat(${days.length}, minmax(120px, 1fr))`, '--calendar-hour-height': `${hourHeight}px` } as CSSProperties}>
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
              style={{ top: (minutes(time) - firstMinute) / 60 * hourHeight, height: hourHeight }}
              onClick={() => onTimeSelect(day, time)}
              aria-label={`${day}, ${time} to ${nextHour(time)} available for ${selectedResource}`}>
              <strong>{time}–{nextHour(time)}</strong><span>Available</span>
            </button>
          )}
          {visibleBookings.filter(booking => booking.date === day).map(booking => bookingItem(booking, true))}
        </div>)}
      </div>
    </div>}

    {isPhone && view === 'day' && <p className="calendarGestureHint">Pinch in for the week · Swipe right for next day</p>}

    {selectedBooking && <CancelBookingModal booking={selectedBooking}
      onClose={() => setSelectedBooking(null)}
      onCancelled={() => {
        onBookingCancelled(selectedBooking)
        setSelectedBooking(null)
      }} />}
  </section>
}
