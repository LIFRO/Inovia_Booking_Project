import { createEventsServicePlugin } from "@schedule-x/events-service";
import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react";
import { useCallback, useEffect, useState } from "react";
import {
  createViewDay,
  createViewWeekAgenda,
  createViewWeek,
  viewWeek,
} from '@schedule-x/calendar'
import type { CalendarEventExternal, DayBoundariesExternal } from "@schedule-x/calendar";
import '@schedule-x/theme-default/dist/index.css'

import './CSS/CallenderView.css'
import { createEventModalPlugin } from "@schedule-x/event-modal";
import CancelBookingModal from "../components/CancelBookingModal";
import { apiGetAllBookings } from "../ts/apiCalls/Booking";
import { toZonedDateTimeFromStrings } from "../ts/dateUtils";
import { useBookingEvents } from "../ts/useBookingEvents";
import { useAuth } from "../ts/types/AuthContext";
import type { BookingDto } from "../ts/dto/BookingDto";
import { createCalendarControlsPlugin } from "@schedule-x/calendar-controls";
import './CSS/BookingTaken.css'


interface CategoryProps {
  selectedResource: string,
  selectedDate: Temporal.PlainDate | null,
  dayBoundaries: DayBoundariesExternal
}

interface CustomCalendarEventExternal extends CalendarEventExternal{
    disabled?: boolean
}



export default function CalenderView({selectedResource, selectedDate, dayBoundaries}: CategoryProps){
    const authContext = useAuth();

    const eventsService = useState(() => createEventsServicePlugin())[0]
    const [calendarControls] = useState(() => createCalendarControlsPlugin());
    const [eventModal] = useState(() => createEventModalPlugin())

    const toCalendarEvent = useCallback((b: BookingDto): CustomCalendarEventExternal => {
        const calenderEvent: CustomCalendarEventExternal = {
            id: b.id,
            title: b.resourceName || `Resurs ${b.resourceId}`,
            start: toZonedDateTimeFromStrings(b.date, b.startTime),
            end: toZonedDateTimeFromStrings(b.date, b.endTime),
            disabled: false
        }

        if(b.userId !== authContext.userId){
            calenderEvent.disabled = true
            calenderEvent._options = {
                additionalClasses: ['booking-taken']
            }
        }
        return calenderEvent
    }, [authContext.userId])

    useBookingEvents({
        onCreated: (b) => eventsService.add(toCalendarEvent(b)),
        onCancelled: (b) => eventsService.remove(b.id),
        onDeleted: (b) => eventsService.remove(b.id),
    }, authContext.userId, authContext.userRole === 'Admin')

    const customComponents = {
        eventModal: CancelBookingModal
    }

    const calendar = useCalendarApp({
        isDark: false,

        weekOptions: {
            nDays: 5
        },

        callbacks: {
            onEventClick: (calenderEvent: CustomCalendarEventExternal) => {
                if(calenderEvent.disabled)
                    eventModal.close();
            }
        },



        locale: 'sv-SE',

        timezone: 'Europe/Stockholm',

        dayBoundaries: dayBoundaries,

        defaultView: viewWeek.name,

        views: [
                createViewDay(),
                createViewWeekAgenda(),
                createViewWeek(),
            ],

        events: [],
        plugins: [eventsService, eventModal, calendarControls]
    })


    useEffect(() => {
        calendarControls.setDate(selectedDate ?? Temporal.Now.plainDateISO())
    }, [selectedDate, calendarControls])
    
    //Gets all bookings
    useEffect(() => {
        apiGetAllBookings()
        .then(bookings => {
            const filtered = bookings.filter(b => b.resourceName === selectedResource)
            eventsService.set(filtered.map(b => toCalendarEvent(b)))
        })
        .catch(console.error)
    }, [selectedResource, eventsService, toCalendarEvent]);

    return(
        <div>
            <ScheduleXCalendar
            calendarApp={calendar}
            customComponents={customComponents} />
        </div>
    )
}
