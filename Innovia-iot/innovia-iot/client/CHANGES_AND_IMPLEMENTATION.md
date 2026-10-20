# Changes and implementation documentation

## Purpose

The Innovia Device Portal is a small Vue frontend for monitoring every device in the `innovia` tenant. It presents current temperature and CO₂ readings, receives measurement updates in real time, and lets an operator inspect recent history for an individual device.

## Delivered changes

### Device overview

- Loads the `innovia` tenant by slug, then retrieves all of its devices.
- Displays one card per device with serial number, model, status, temperature, and CO₂.
- Includes **All**, **Active**, and **Inactive** filter buttons.
- Has a manual refresh button for reloading the device registry list.

### Real-time readings

- Connects to the existing SignalR hub through the Vite proxy.
- Invokes `JoinTenant("innovia")` after connecting.
- Handles `measurementReceived` messages and updates the matching device card immediately when the measurement type is `temperature` or `co2`.
- Displays the SignalR connection state in the toolbar and shows the time of the latest reading on each updated card.

### Measurement history

- Every device card has a **History** button that opens a dedicated History view with a Back to devices action.
- The History view loads the previous 24 hours for the selected device from the existing `series/all` portal endpoint.
- Operators can show temperature, CO₂, or both metrics.
- Each selected metric is rendered as a lightweight SVG trend line without adding a charting dependency.

## Frontend structure

```
client/
├── index.html                  # Vite entry page
├── package.json                # Vue, SignalR, and Vite dependencies
├── vite.config.js              # Development proxy configuration
└── src/
    ├── main.js                 # Vue bootstrap
    ├── App.js                  # Portal state, API calls, SignalR, and UI
    └── styles.css              # Responsive portal styling
```

`App.js` uses Vue's runtime template build. This keeps the portal simple and avoids a separate single-file-component compiler plugin while remaining a Vue application.

## Existing service integration

The frontend does not alter or depend on new backend endpoints. During local Vite development, these proxy routes forward requests to the existing services:

| Browser path | Service target | Used for |
| --- | --- | --- |
| `/registry` | `http://localhost:5101` | Tenant lookup and device list |
| `/portal-api` | `http://localhost:5104` | 24-hour measurement series |
| `/telemetry` | `http://localhost:5103` | SignalR telemetry hub |

The proxy is important because the existing registry and portal services do not need any CORS changes for this frontend.

## Run locally

1. Start the existing DeviceRegistry API, Portal Adapter, and Realtime Hub on ports `5101`, `5104`, and `5103`.
2. Install client dependencies:

   ```bash
   npm --prefix client install
   ```

3. Start the Vite development server:

   ```bash
   npm --prefix client run dev
   ```

4. Open the address shown by Vite (normally `http://127.0.0.1:5173`).

## Validation

The production bundle was verified with:

```bash
npm --prefix client run build
```

## Scope boundary

Only files under `client/` were added or modified for this portal. No C# code, backend API behavior, database schema, or service configuration was changed.
