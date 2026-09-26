import { useEffect, useState } from "react";
import ReserveCard from "../components/ReserveCard"
import CustomCalendar from "./CustomCalendar"
import './CSS/CalendarPage.css'
import { apiGetAllResources } from "../ts/apiCalls/Resource";
import type { ResourceDto } from "../ts/dto/ResourceDTO";
import { todayInStockholm } from "../ts/dateUtils";
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

const dayBoundaries = { start: '06:00', end: '18:00' }
const stockholmTime = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
})

export default function CalendarPage() {
  const { userId, userRole } = useAuth()
  const [reserveModel, setReserveModel] = useState<ReserveModel>({
    selectedCategory: 'MeetingRoom',
    selectedDate: todayInStockholm(),
    selectedResource: 'Mötesrum A'
  });

  const [allresources, setAllResources] = useState<ResourceDto[]>([])
  const [resourcesLoaded, setResourcesLoaded] = useState(false)
  const [resourceError, setResourceError] = useState('')
  const [bookings, setBookings] = useState<BookingDto[]>([])
  const [bookingsLoaded, setBookingsLoaded] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [weeklyTimes, setWeeklyTimes] = useState<{ date: string, times: WeeklyTimeDto[], error: string } | null>(null)
  const [now, setNow] = useState(() => new Date())

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
    if (!reserveModel.selectedDate) return
    let active = true
    const date = reserveModel.selectedDate
    apiGetWeeklyTimes(date)
      .then(data => { if (active) setWeeklyTimes({ date, times: data, error: '' }) })
      .catch(() => {
        if (active) setWeeklyTimes({ date, times: [], error: 'Could not load available times.' })
      })
    return () => { active = false }
  }, [reserveModel.selectedDate])

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])

  useBookingEvents({
    onCreated: booking => setBookings(current => [...current.filter(b => b.id !== booking.id), booking]),
    onCancelled: booking => setBookings(current => current.filter(b => b.id !== booking.id)),
    onDeleted: booking => setBookings(current => current.filter(b => b.id !== booking.id)),
  }, userId, userRole === 'Admin')

  const filteredCategory = allresources.filter(c => c.type === reserveModel.selectedCategory);
  const resourceId = allresources.find(resource => resource.name === reserveModel.selectedResource)?.id
  const today = todayInStockholm()
  const currentTime = stockholmTime.format(now)
  const selectedSchedule = weeklyTimes?.date === reserveModel.selectedDate ? weeklyTimes : null
  const availableSlots = freeHours(
    selectedSchedule?.times ?? [], bookings, reserveModel.selectedDate, resourceId,
    dayBoundaries.start, dayBoundaries.end, today, currentTime,
  )


  return (
    <div className="calendarContent">
      <div className="calendarWrapper">
      <CustomCalendar
        selectedResource={reserveModel.selectedResource} 
        selectedDate={reserveModel.selectedDate}
        onDateChange={(date) => setReserveModel(model => ({ ...model, selectedDate: date }))}
        dayBoundaries={dayBoundaries}
        bookings={bookings}
        error={bookingError}
        onBookingCancelled={(id) => setBookings(current => current.filter(booking => booking.id !== id))}
      />
      </div>
        <div className="reserveContent">
          <h3 className="reserveTitle">Reserve Resource</h3>
          <ReserveCard 
          reserveModel={reserveModel}
          setReserveModel={setReserveModel}
          resources={allresources} 
          filteredCategory={filteredCategory} 
          availableSlots={availableSlots}
          availabilityError={resourceError || selectedSchedule?.error || bookingError}
          loading={(!!reserveModel.selectedDate && !selectedSchedule) || !bookingsLoaded || !resourcesLoaded}
          onBookingCreated={(booking) => setBookings(current => [...current.filter(b => b.id !== booking.id), booking])}/>
        </div>
    </div>
  )
}
