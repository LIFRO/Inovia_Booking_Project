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
- The temperature monitor is documented separately in [IOT_TEMPERATURE_REFRESH.md](IOT_TEMPERATURE_REFRESH.md).

## Edge Simulator

- The simulator retrieves the `innovia` tenant and its devices from Device Registry before connecting to MQTT.
- It emits temperature and CO₂ measurements for every returned device, using each device serial in both the payload and MQTT topic.
- The publish interval is currently one second.

## Ingest Gateway

- The gateway caches resolved tenant and device IDs using a `cacheKey` composed of the tenant slug and device serial (`{tenantSlug}:{deviceSerial}`).
- Both cache lookup and storage use this key, so each device has its own cached resolution within a tenant. Telemetry from multiple devices no longer reuses the first device resolved for that tenant.

## Documentation organization

`SERVER_ENV_GUIDE.md`, `Systembeskrivning.md`, and `Testning_och_kvalitet.md` were moved from the repository root into `MD_FILES/`; their contents were not changed.
