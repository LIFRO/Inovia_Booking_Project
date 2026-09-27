import { useState } from 'react'
import { addDays, startOfWeek, todayInStockholm } from '../ts/dateUtils'
import './CSS/BookingDatePicker.css'

interface Props {
  value: string
  onChange: (date: string) => void
}

const fullDate = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
})
const monthLabel = new Intl.DateTimeFormat('en-GB', {
  month: 'long', year: 'numeric', timeZone: 'UTC',
})

function asDate(date: string): Date {
  return new Date(`${date}T00:00:00Z`)
}

function moveMonth(month: string, amount: number): string {
  const date = asDate(`${month}-01`)
  date.setUTCMonth(date.getUTCMonth() + amount)
  return date.toISOString().slice(0, 7)
}

export default function BookingDatePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState((value || todayInStockholm()).slice(0, 7))
  const today = todayInStockholm()
  const nextMonday = addDays(startOfWeek(today), 7)
  const firstDay = asDate(`${visibleMonth}-01`)
  const leadingDays = (firstDay.getUTCDay() + 6) % 7
  const daysInMonth = new Date(Date.UTC(firstDay.getUTCFullYear(), firstDay.getUTCMonth() + 1, 0)).getUTCDate()
  const cellCount = Math.ceil((leadingDays + daysInMonth) / 7) * 7

  function choose(date: string) {
    onChange(date)
    setOpen(false)
  }

  return <div className="bookingDatePicker">
    <label htmlFor="dateValue">Date</label>
    <button id="dateValue" type="button" className="bookingDateTrigger"
      aria-expanded={open} aria-controls="bookingDatePanel"
      onClick={() => {
        setVisibleMonth((value || today).slice(0, 7))
        setOpen(current => !current)
      }}>
      <svg className="bookingDateTriggerIcon" aria-hidden="true" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 10h18" />
      </svg>
      <span>{value ? fullDate.format(asDate(value)) : 'Choose a date'}</span>
      <span className="bookingDateTriggerAction">{open ? 'Close' : 'Change'}</span>
    </button>

    {open && <div id="bookingDatePanel" className="bookingDatePanel">
      <div className="bookingDateShortcuts" aria-label="Quick dates">
        <button type="button" onClick={() => choose(today)}>Today</button>
        <button type="button" onClick={() => choose(addDays(today, 1))}>Tomorrow</button>
        <button type="button" onClick={() => choose(nextMonday)}>Next Monday</button>
      </div>
      <div className="bookingDateMonthHeader">
        <button type="button" aria-label="Previous month" disabled={visibleMonth <= today.slice(0, 7)}
          onClick={() => setVisibleMonth(month => moveMonth(month, -1))}>‹</button>
        <strong>{monthLabel.format(firstDay)}</strong>
        <button type="button" aria-label="Next month"
          onClick={() => setVisibleMonth(month => moveMonth(month, 1))}>›</button>
      </div>
      <div className="bookingDateGrid">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day =>
          <span className="bookingDateWeekday" key={day}>{day}</span>
        )}
        {Array.from({ length: cellCount }, (_, index) => {
          const day = index - leadingDays + 1
          if (day < 1 || day > daysInMonth) return <span key={index} />
          const date = `${visibleMonth}-${String(day).padStart(2, '0')}`
          return <button key={date} type="button" disabled={date < today}
            className={`bookingDateDay${date === value ? ' selected' : ''}${date === today ? ' today' : ''}`}
            aria-label={fullDate.format(asDate(date))} aria-pressed={date === value}
            aria-current={date === today ? 'date' : undefined}
            onClick={() => choose(date)}>{day}</button>
        })}
      </div>
    </div>}
  </div>
}
