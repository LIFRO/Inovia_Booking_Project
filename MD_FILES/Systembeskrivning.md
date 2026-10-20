# Systembeskrivning – Resursbokningssystem
 
## 1. Syfte
 
Systemet är en webbapplikation för att boka interna resurser, t.ex. skrivbord, mötesrum, VR-headset och AI-servrar. Användare kan söka lediga resurser och boka dem, medan administratörer kan hantera och avboka bokningar. Systemet ger även uppdateringar i realtid när bokningar skapas, avbokas eller tas bort.
 
## 2. Övergripande arkitektur
 
Systemet består av två huvuddelar:
 
- **Frontend** – en React SPA (Single Page Application) som användarna interagerar med i webbläsaren.
- **Backend** – ett ASP.NET Core-API som hanterar affärslogik, datalagring och realtidskommunikation.
Kommunikationen mellan frontend och backend sker via **REST + WebSocket**: vanliga anrop går via REST-endpoints, medan realtidshändelser (t.ex. att en bokning skapas eller avbokas) skickas via WebSocket (SignalR).
 
```
React SPA  <——  REST + WebSocket  ——>  ASP.NET Core Backend
```
 
## 3. Frontend – React SPA
 
**Sidor (UI Pages):**
- Login
- Dashboard / Home
- Admin Panel
- Booking
**Komponenter (UI Components):**
- Menu
- Calendar
## 4. Backend – ASP.NET Core
 
Backend är uppdelat i tydliga lager:
 
| Lager | Ansvar |
|---|---|
| Controllers | Tar emot REST-anrop |
| DTO:er | Formar data för request/response |
| Booking Service | Innehåller domänlogik |
| Models | Datamodeller (Resource, Booking, User + in-memory-lagring) |
| Booking Hub (SignalR) | Skickar realtidsuppdateringar till klienterna |
 
### 4.1 Controllers (API-endpoints)
 
**ResourceController**
- `GET /api/resources`
**BookingsController**
- `GET /api/bookings?date`
- `GET /api/bookings/mine`
- `POST /api/bookings`
- `PATCH /api/bookings/{id}/cancel`
**AdminController**
- `GET /api/admin/bookings?status`
- `DELETE /api/admin/bookings/{id}`
### 4.2 DTO:er
 
- **ResourceDto**: Id, Type, Name
- **BookingDto**: Id, ResourceId, ResourceName, UserId, Date, Start, End, Status, CreatedAt
- **AdminBookingDto**: BookingDto + EmployeeName, EmployeeEmail
### 4.3 Services
 
- **IBookingService / BookingService** – hanterar bokningslogik
- **IResourceService / ResourceService** – hanterar resurslogik
- **IBookingNotifier / BookingNotifier** – skickar notiser via `IHubContext<BookingHub>`
### 4.4 Models (in-memory)
 
- **Resource**: Id, Type (Desk, MeetingRoom, VrHeadset, AiServer), Name
- **Booking**: Id, ResourceId, UserId, Date, Start, End, Status, CreatedAt
- **User**: Id, Name, Email
### 4.5 SignalR – Booking Hub
 
Skickar följande realtidshändelser till klienterna:
 
- `BookingCreated`
- `BookingCancelled` (till användaren)
- `BookingDeleted` (till admin)
## 5. Roller
 
- **Användare**: kan söka, boka och avboka sina egna bokningar.
- **Administratör**: kan se och hantera samtliga bokningar (inklusive borttagning).
---