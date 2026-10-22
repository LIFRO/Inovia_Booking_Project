# IoT integration change log

This document records the current IoT-related changes across the Booking System and the nested `Innovia-iot` project.

## Booking System

- The local booking PostgreSQL container now publishes host port `5433` to avoid colliding with the IoT PostgreSQL service on port `5432`.
- `Backend/appsettings.Development.json` uses port `5433` for the booking database connection.
- Administrators have a **Temperatures** navigation item and protected `/temperatures` route.
- The development frontend proxies these IoT services:
  - `/registry` → Device Registry on port `5101`.
  - `/portal-api` → Portal Adapter on port `5104`.
  - `/telemetry` → Realtime Hub on port `5103`.
- The temperature monitor retrieves each registered device's newest temperature and CO₂ value through Portal Adapter's `latest` endpoint instead of downloading a full history to determine the current value.
- Live telemetry from Realtime Hub updates the matching device card as temperature or CO₂ measurements arrive.
- Each device card has a history view with 24-hour, 7-day, and 30-day ranges, metric filtering, and client-side time-window averaging (five minutes for up to 7 days and 30 minutes for 30 days).
- The temperature-monitor behavior and endpoints are documented separately in [IOT_TEMPERATURE_REFRESH.md](IOT_TEMPERATURE_REFRESH.md).

## Edge Simulator

- The simulator retrieves the `innovia` tenant and its devices from Device Registry before connecting to MQTT.
- It emits temperature and CO₂ measurements for every returned device, using each device serial in both the payload and MQTT topic.
- The publish interval is currently one second.

## Ingest Gateway

- The gateway caches resolved tenant and device IDs using a `cacheKey` composed of the tenant slug and device serial (`{tenantSlug}:{deviceSerial}`).
- Both cache lookup and storage use this key, so each device has its own cached resolution within a tenant. Telemetry from multiple devices no longer reuses the first device resolved for that tenant.

## Portal Adapter

- `GET /portal/{tenantId}/devices/{deviceId}/latest?type=...` returns the newest stored measurement for one device and metric. It orders readings by timestamp in the database and returns `point: null` if no matching reading exists.

## Documentation organization

`SERVER_ENV_GUIDE.md`, `Systembeskrivning.md`, and `Testning_och_kvalitet.md` were moved from the repository root into `MD_FILES/`; their contents were not changed.
