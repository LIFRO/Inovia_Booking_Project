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

- The gateway now creates a cache key from tenant slug and device serial when it stores a resolved device ID.

### Current cache limitation

The cache lookup still uses `tenantSlug` rather than the new `cacheKey`. Therefore the per-device cache behavior is not yet active: the first resolved device for a tenant can still be reused for later devices. Change the lookup to `_cache.TryGetValue(cacheKey, out var hit)` before relying on multiple-device telemetry in the booking frontend.

## Documentation organization

`SERVER_ENV_GUIDE.md`, `Systembeskrivning.md`, and `Testning_och_kvalitet.md` were moved from the repository root into `MD_FILES/`; their contents were not changed.
