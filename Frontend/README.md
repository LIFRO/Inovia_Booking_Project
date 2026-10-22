# Innovia frontend

React- och Vite-klienten för Innovias resursbokningssystem. Klienten använder den relativa API-basen `/api` och SignalR-hubben `/hubs/bookings`; Vites utvecklingsproxy skickar båda vidare till backend på `http://localhost:5109`.

## Starta lokalt

Starta backend och databasen först enligt [huvud-README:n](../README.md). Starta sedan klienten från den här katalogen:

```bash
npm install
npm run dev
```

Vite visar den lokala adressen, normalt `http://localhost:5173`.

## Funktioner

- Inloggning och registrering samt JWT-baserad skydd av interna sidor.
- Bokning, avbokning, resursöversikt och realtidsuppdateringar via SignalR.
- Administrationsvy och en administratörsskyddad temperaturvy för IoT-integrationen.
- IT-supportchatt för inloggade användare. Komponenten `src/components/ITSupport.tsx` skickar `POST /api/chat/ChatBot` med JWT från `localStorage` och visar ett telefonalternativ till IT-support. API-nyckeln till AI-tjänsten finns aldrig i frontend.

### Temperaturhistorik

Temperaturvyns historikdiagram visar temperatur och CO₂ över vald tidsperiod. Punkterna
placeras efter deras faktiska tidstämplar, så luckor i sensorrapporteringen syns i kurvan.
Vyn använder minutmedelvärden när mindre än 12 timmars data är tillgänglig och timmedelvärden
för längre historik. Hovra över diagrammet för tidstämpel och uppmätt värde för närmaste punkt.

Chattens historik hålls bara i komponentens minne. Den försvinner när sidan laddas om och återanvänds inte mellan inloggningar.

## Utvecklingsproxy

Utöver `/api` och `/hubs` proxas IoT-vägarna `/registry`, `/portal-api` och `/telemetry`. De används av temperaturvyn och beskrivs i [IoT-ändringsloggen](../MD_FILES/IOT_INTEGRATION_CHANGELOG.md).
