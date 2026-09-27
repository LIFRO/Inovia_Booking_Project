import { useEffect, useRef, useState } from "react";
import ReserveCard from "../components/ReserveCard"
import CustomCalendar from "./CustomCalendar"
import './CSS/CalendarPage.css'
import { apiGetAllResources } from "../ts/apiCalls/Resource";
import type { ResourceDto } from "../ts/dto/ResourceDTO";
import { addDays, startOfWeek, todayInStockholm } from "../ts/dateUtils";
import { freeHours } from "../ts/bookingTimes";
import { apiGetAllBookings, apiGetWeeklyTimes } from "../ts/apiCalls/Booking";
import type { BookingDto } from "../ts/dto/BookingDto";
import type { WeeklyTimeDto } from "../ts/dto/WeeklyTimeDto";
import { useBookingEvents } from "../ts/useBookingEvents";
import { useAuth } from "../ts/types/AuthContext";

export type ReserveModel = {
  selectedCategory: string,
  selectedResource: string,
  selectedDate: string
}

const calendarBoundaries = { start: '00:00', end: '24:00' }
const bookingBoundaries = { start: '06:00', end: '18:00' }
const stockholmTime = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
})

export default function CalendarPage() {
  const { userRole } = useAuth()
  const [reserveModel, setReserveModel] = useState<ReserveModel>({
    selectedCategory: 'MeetingRoom',
    selectedDate: todayInStockholm(),
    selectedResource: 'Mötesrum A'
  });

  const [allresources, setAllResources] = useState<ResourceDto[]>([])
  const [startTime, setStartTime] = useState('')
  const [bookingOpen, setBookingOpen] = useState(false)
  const bookingDialogRef = useRef<HTMLDialogElement>(null)
  const [resourcesLoaded, setResourcesLoaded] = useState(false)
  const [resourceError, setResourceError] = useState('')
  const [bookings, setBookings] = useState<BookingDto[]>([])
  const [bookingsLoaded, setBookingsLoaded] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [weeklyTimes, setWeeklyTimes] = useState<{ week: string, times: WeeklyTimeDto[], error: string } | null>(null)
  const [now, setNow] = useState(() => new Date())
  const selectedWeek = reserveModel.selectedDate ? startOfWeek(reserveModel.selectedDate) : ''

  useEffect(() => {
    let active = true
    apiGetAllResources()
      .then(data => {
        if (active) {
          setAllResources(data)
          setResourcesLoaded(true)
        }
      })
      .catch(() => {
        if (active) {
          setResourceError('Could not load resources.')
          setResourcesLoaded(true)
        }
      })
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    apiGetAllBookings()
      .then(data => {
        if (active) {
          setBookings(data)
          setBookingsLoaded(true)
        }
      })
      .catch(() => {
        if (active) {
          setBookingError('Could not load bookings.')
          setBookingsLoaded(true)
        }
      })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!userRole || !selectedWeek) return
    let active = true
    apiGetWeeklyTimes(selectedWeek)
      .then(data => { if (active) setWeeklyTimes({ week: selectedWeek, times: data, error: '' }) })
      .catch(() => {
        if (active) setWeeklyTimes({ week: selectedWeek, times: [], error: 'Could not load available times.' })
      })
    return () => { active = false }
  }, [selectedWeek, userRole])

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (bookingOpen) bookingDialogRef.current?.showModal()
  }, [bookingOpen])

  useBookingEvents({
    onCreated: booking => setBookings(current => current.some(b => b.id === booking.id)
      ? current
      : [...current, { ...booking, userId: '', userName: '' }]),
    onPrivateCreated: booking => setBookings(current => [...current.filter(b => b.id !== booking.id), booking]),
    onCancelled: booking => setBookings(current => current.filter(b => b.id !== booking.id)),
    onDeleted: booking => setBookings(current => current.filter(b => b.id !== booking.id)),
  })

  const filteredCategory = allresources.filter(c => c.type === reserveModel.selectedCategory);
  const resourceId = allresources.find(resource => resource.name === reserveModel.selectedResource)?.id
  const today = todayInStockholm()
  const currentTime = stockholmTime.format(now)
  const selectedSchedule = userRole && weeklyTimes?.week === selectedWeek ? weeklyTimes : null
  const availableSlotsByDay = selectedWeek ? Object.fromEntries(
    Array.from({ length: 7 }, (_, index) => {
      const date = addDays(selectedWeek, index)
      return [date, freeHours(
        selectedSchedule?.times ?? [], bookings, date, resourceId,
        bookingBoundaries.start, bookingBoundaries.end, today, currentTime,
      )]
    }),
  ) as Record<string, string[]> : {}
  const availableSlots = availableSlotsByDay[reserveModel.selectedDate] ?? []
  const availabilityLoading = !!userRole && !!selectedWeek && (!selectedSchedule || !bookingsLoaded || !resourcesLoaded)
  const availabilityError = resourceError || selectedSchedule?.error || bookingError


  return (
    <div className="calendarContent">
      <div className="calendarWrapper">
      <CustomCalendar
        selectedResource={reserveModel.selectedResource} 
        selectedDate={reserveModel.selectedDate}
        onDateChange={(date) => setReserveModel(model => ({ ...model, selectedDate: date }))}
        onDaySelect={(date) => {
          setReserveModel(model => ({ ...model, selectedDate: date }))
          setStartTime('')
          setBookingOpen(true)
        }}
        onTimeSelect={(date, time) => {
          setReserveModel(model => ({ ...model, selectedDate: date }))
          setStartTime(time)
          setBookingOpen(true)
        }}
        dayBoundaries={calendarBoundaries}
        bookings={bookings}
        availableSlotsByDay={availableSlotsByDay}
        availabilityLoading={availabilityLoading}
        availabilityError={availabilityError}
        onBookingCancelled={(id) => setBookings(current => current.filter(booking => booking.id !== id))}
      />
      </div>
      {bookingOpen && <dialog ref={bookingDialogRef} className="reserveDialog"
        aria-labelledby="reserveDialogTitle" onClose={() => setBookingOpen(false)}
        onClick={(event) => { if (event.target === event.currentTarget) setBookingOpen(false) }}>
        <div className="reserveContent">
          <div className="reserveDialogHeader">
            <h3 className="reserveTitle" id="reserveDialogTitle">Reserve Resource</h3>
            <button type="button" className="reserveDialogClose" onClick={() => setBookingOpen(false)} aria-label="Close reservation">×</button>
          </div>
          <ReserveCard
            reserveModel={reserveModel}
            setReserveModel={setReserveModel}
            resources={allresources}
            filteredCategory={filteredCategory}
            availableSlots={availableSlots}
            startTime={startTime}
            onStartTimeChange={setStartTime}
            availabilityError={availabilityError}
            loading={availabilityLoading}
            onBookingCreated={(booking) => setBookings(current => [...current.filter(b => b.id !== booking.id), booking])}/>
        </div>
      </dialog>}
    </div>
  )
}
