import { useEffect, useRef } from 'react'
import { connection, startConnection} from './signalr'
import type { BookingDto } from './dto/BookingDto'

export interface BookingEventHandlers {
  onCreated?: (b: BookingDto) => void
  onCancelled?: (b: BookingDto) => void
  onDeleted?: (b: BookingDto) => void
}

export function useBookingEvents(
  handlers: BookingEventHandlers,
  userId: string,
  isAdmin: boolean,
) {
  const ref = useRef(handlers)
  ref.current = handlers

  useEffect(() => {
    const created = (b: BookingDto) => ref.current.onCreated?.(b)
    const cancelled = (b: BookingDto) => ref.current.onCancelled?.(b)
    const deleted = (b: BookingDto) => ref.current.onDeleted?.(b)

    connection.on('BookingCreated', created)
    connection.on('BookingCancelled', cancelled)
    connection.on('BookingDeleted', deleted)

    startConnection()
      .then(() => connection.invoke('Register', userId, isAdmin))
      .catch(console.error)

    return () => {
      connection.off('BookingCreated', created)
      connection.off('BookingCancelled', cancelled)
      connection.off('BookingDeleted', deleted)
    }
  }, [userId, isAdmin])
}
