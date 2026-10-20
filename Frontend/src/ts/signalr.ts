import {
  HubConnectionBuilder,
  HubConnectionState,
  type HubConnection,
} from '@microsoft/signalr'

export const connection: HubConnection = new HubConnectionBuilder()
  .withUrl('/hubs/bookings', {
    accessTokenFactory: () => localStorage.getItem('token') ?? '',
  })
  .withAutomaticReconnect()
  .build()

let starting: Promise<void> | null = null

// Idempotent: säker att anropa från flera komponenter / StrictMode-dubbelkörning
export function startConnection(): Promise<void> {
  if (connection.state === HubConnectionState.Connected) return Promise.resolve()
  if (!starting) {
    starting = connection.start().finally(() => { starting = null })
  }
  return starting
}
