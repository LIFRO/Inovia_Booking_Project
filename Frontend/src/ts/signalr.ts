import {
  HubConnectionBuilder,
  HubConnectionState,
  type HubConnection,
} from '@microsoft/signalr'

export const connection: HubConnection = new HubConnectionBuilder()
  .withUrl('/hubs/bookings') // relativ - går via Vite-proxyn
  .withAutomaticReconnect()
  .build()

let starting: Promise<void> | null = null

// Idempotent: säker att anropa från flera komponenter / StrictMode-dubbelkörning
export function startConnection(): Promise<void> {
  if (connection.state === HubConnectionState.Connected) return Promise.resolve()
  if (!starting) {
    starting = connection.start().catch((err) => {
      starting = null
      throw err
    })
  }
  return starting
}
