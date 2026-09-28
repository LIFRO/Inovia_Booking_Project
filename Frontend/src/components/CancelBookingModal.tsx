import { useState } from 'react'
import { apiDeleteBooking } from '../ts/apiCalls/Booking'
import type { BookingDto } from '../ts/dto/BookingDto'
import './CSS/CancelBookingModal.css'

interface Props {
  booking: BookingDto
  onClose: () => void
  onCancelled: () => void
}

export default function CancelBookingModal({ booking, onClose, onCancelled }: Props) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function cancelBooking() {
    setError('')
    setBusy(true)
    try {
      await apiDeleteBooking(booking.id)
      onCancelled()
    } catch {
      setError('Could not cancel booking. Please try again.')
      setBusy(false)
    }
  }

  return <div className="bookingModalBackdrop" onClick={onClose}>
    <div className="cancelBookingModal" role="dialog" aria-modal="true" aria-labelledby="bookingModalTitle"
      onClick={event => event.stopPropagation()}>
      <button type="button" className="modalCloseBtn" onClick={onClose} aria-label="Close">×</button>
      <h3 className="modalTitle" id="bookingModalTitle">{booking.resourceName}</h3>
      <p className="modalDateTime">{booking.date}</p>
      <p className="modalDateTime">{booking.startTime.slice(0, 5)}–{booking.endTime.slice(0, 5)}</p>
      {error && <div className="modalError" role="alert">
        <strong>Cancellation failed</strong>
        <p>{error}</p>
      </div>}
      <button type="button" className="modalCancelBtn" onClick={cancelBooking} disabled={busy}>
        {busy ? 'Cancelling…' : 'Cancel booking'}
      </button>
    </div>
  </div>
}
