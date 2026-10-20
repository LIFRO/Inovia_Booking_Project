# IoT temperature refresh

The admin **Temperatures** page now retrieves the current reading for each registered device when **Refresh** is selected.

## Current-reading endpoint

`GET /portal/{tenantId}/devices/{deviceId}/latest?type=temperature`

The endpoint queries the `Measurements` table, orders matching readings by timestamp descending, and returns the first result:

```json
{
  "deviceId": "…",
  "type": "temperature",
  "point": { "t": "2026-10-20T12:34:56Z", "v": 21.8 }
}
```

If no matching reading exists, `point` is `null`.

## Why this changed

Previously, Refresh downloaded each device's 24-hour history and the frontend used the final item as the current temperature. The new endpoint makes the database choose the newest timestamp, transfers only one reading, and avoids relying on ordering within a grouped history response.

Live readings are still delivered through SignalR. The edge simulator publishes on its configured 10-second interval, so a live value can take up to one interval to arrive after the page opens.
