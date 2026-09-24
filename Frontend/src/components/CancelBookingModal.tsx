import type { CalendarEventExternal } from "@schedule-x/calendar";
import { apiDeleteBooking } from "../ts/apiCalls/Booking";
import "./CSS/CancelBookingModal.css";

export default function CancelBookingModal({ calendarEvent }: { calendarEvent: CalendarEventExternal }){
  const handleCancelBooking = () => {
    apiDeleteBooking(parseInt(calendarEvent.id.toString()));
  }

  const formatTime = (plainDateTime: string) => {
    return plainDateTime.split('T')[1].slice(0, 5)
  }

  const formatDate = (plainDateTime: string) => {
    return plainDateTime.split('T')[0]
  }
  
  return (
      <div className="cancelBookingModal">
        <h3 className="modalTitle">
          {calendarEvent.title}
        </h3>
        <p className="modalDateTime">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          {formatDate(calendarEvent.start.toPlainDateTime().toString())}
        </p>
        <p className="modalDateTime">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          {formatTime(calendarEvent.start.toPlainDateTime().toString())} - {formatTime(calendarEvent.end.toPlainDateTime().toString())}
        </p>
        {
          <button className="modalCancelBtn" onClick={handleCancelBooking}>Cancel</button>
        }
      </div>
    );
}