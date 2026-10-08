import { useEffect, useRef } from 'react'
import { connection, startConnection} from './signalr'
import type { BookingDto } from './dto/BookingDto'

export interface BookingEventHandlers {
  onCreated?: (b: BookingEvent) => void
  onPrivateCreated?: (b: BookingDto) => void
  onCancelled?: (b: { id: number }) => void
  onDeleted?: (b: BookingDto) => void
}

export type BookingEvent = Pick<BookingDto, 'id' | 'resourceId' | 'resourceName' | 'date' | 'startTime' | 'endTime'>

export function useBookingEvents(handlers: BookingEventHandlers) {
  const ref = useRef(handlers)

  useEffect(() => {
    ref.current = handlers
  })

  useEffect(() => {
    const created = (b: BookingEvent) => ref.current.onCreated?.(b)
    const privateCreated = (b: BookingDto) => ref.current.onPrivateCreated?.(b)
    const cancelled = (b: { id: number }) => ref.current.onCancelled?.(b)
    const deleted = (b: BookingDto) => ref.current.onDeleted?.(b)

    connection.on('BookingCreated', created)
    connection.on('BookingCreatedPrivate', privateCreated)
    connection.on('BookingCancelled', cancelled)
    connection.on('BookingDeleted', deleted)

    startConnection().catch(console.error)

    return () => {
      connection.off('BookingCreated', created)
      connection.off('BookingCreatedPrivate', privateCreated)
      connection.off('BookingCancelled', cancelled)
      connection.off('BookingDeleted', deleted)
    }
  }, [])
}
