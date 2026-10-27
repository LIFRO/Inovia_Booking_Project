# Implementering av Innovia Hub IoT

Den här filen beskriver integrationen mellan bokningsplattformen och Innovia
Hub IoT för G-kraven. IoT-projektet finns under
`Innovia-iot/innovia-iot` och webbportalen finns under `Frontend`.

## Resultat

Lösningen registrerar en tenant med sluggen `innovia` i **DeviceRegistry.Api**
och har stöd för minst tio aktiva CO₂- och temperatursensorer under den
tenanten. **Edge.Simulator** hämtar alla registrerade enheter och publicerar
temperatur- och CO₂-data för var och en via MQTT varje sekund. Intervallet
uppfyller därmed kravet på högst tio sekunder mellan avläsningarna.

Administratörsvyn på `/temperatures` hämtar enhetslistan från DeviceRegistry
och visar de senaste mätvärdena genom Portal.Adapter. Vyn ansluter också till
Realtime.Hub med SignalR. När Ingest.Gateway tar emot en ny mätning uppdateras
rätt enhets kort direkt, utan att sidan behöver laddas om.

## Ändringar i bokningsplattformen

IoT-vyn finns i `Frontend/src/views/TemperaturePage.tsx`. Den hämtar tenanten
och dess enheter från DeviceRegistry samt senaste temperatur- och CO₂-värden
från Portal.Adapter. Ett kort visas för varje registrerad sensor och vyn kan
även visa historik för en enskild enhet.

Samma vy skapar en SignalR-anslutning till `/telemetry/hub/telemetry`, anropar
`JoinTenant("innovia")` och lyssnar på händelsen `measurementReceived`.
Mätningen matchas mot `deviceId`, så att endast berörd sensors värde ändras.
Automatisk återanslutning är aktiverad.

I `Frontend/vite.config.ts` proxas `/registry` till port 5101, `/portal-api`
till port 5104 och `/telemetry`, inklusive WebSocket-trafik, till port 5103.
Webbläsaren kan därför använda samma origin vid lokal utveckling.

`Frontend/src/App.tsx` och sidomenyn gör IoT-vyn tillgänglig på den skyddade
administratörsrouten `/temperatures`. Bokningsdatabasen har samtidigt flyttats
till värdport 5433 i `Backend/DB/compose.yaml` och
`Backend/appsettings.Development.json`. IoT PostgreSQL behåller port 5432,
vilket undviker en portkonflikt.

## Ändringar i IoT-tjänsten

**DeviceRegistry.Api** har Swagger aktiverat i
`src/DeviceRegistry.Api/Program.cs`. API:t kan skapa en tenant och en device,
hämta tenant via slug, lista devices och söka efter en device med serial.

I `src/Ingest.Gateway/Program.cs` prenumererar **Ingest.Gateway** på
MQTT-topicen `tenants/+/devices/+/measurements`. Tjänsten kontrollerar att
serial i topicen stämmer överens med payloaden, sparar mätvärdet och skickar
det vidare till Realtime.Hub. Den återansluter till både MQTT och SignalR om
respektive tjänst startas senare.

**Realtime.Hub** exponerar SignalR-hubben `/hub/telemetry` från
`src/Realtime.Hub/Program.cs`. Klienter ansluter till en tenant-grupp med
`JoinTenant` och får händelsen `measurementReceived` när en ny mätning
publiceras.

**Portal.Adapter**, i `src/Portal.Adapter/Program.cs`, exponerar `latest` för
senaste värde och `series` för tidsserier per enhet och mätvärdestyp. Swagger
är aktiverat även där. **Edge.Simulator**, i
`src/Edge.Simulator/Program.cs`, läser `innovia` och dess devices från
DeviceRegistry, ansluter till och återansluter till MQTT och publicerar
temperatur och CO₂ för varje device varje sekund.

## Lokal startordning

Kör kommandona från projektroten i separata terminaler. Börja med att starta
IoT-infrastrukturen:

```bash
docker compose -f Innovia-iot/innovia-iot/deploy/docker-compose.yml up -d
```

Starta sedan IoT-tjänsterna:

```bash
dotnet run --project Innovia-iot/innovia-iot/src/DeviceRegistry.Api
dotnet run --project Innovia-iot/innovia-iot/src/Realtime.Hub
dotnet run --project Innovia-iot/innovia-iot/src/Ingest.Gateway
dotnet run --project Innovia-iot/innovia-iot/src/Portal.Adapter
```

Swagger finns för Device Registry på `http://localhost:5101/swagger`, Ingest
Gateway på `http://localhost:5102/swagger` och Portal Adapter på
`http://localhost:5104/swagger`. Realtime Hub kör på `http://localhost:5103`
med SignalR-endpointen `/hub/telemetry`.

Skapa därefter tenanten `innovia` och minst tio devices via DeviceRegistry
Swagger eller API. Varje sensor behöver ett unikt `serial`, till exempel
`dev-101` till `dev-110`, samt status `active`. När enheterna är registrerade
startas simulatorn:

```bash
dotnet run --project Innovia-iot/innovia-iot/src/Edge.Simulator
```

Starta till sist bokningsbackend och frontend, logga in som administratör och
öppna `/temperatures`. Tio sensorkort ska visas och värdena ska ändras i
realtid.

## Demonstrationsflöde

Demonstrationen börjar med att minst tio enheter visas i DeviceRegistry
Swagger. Visa sedan Edge.Simulators logg så att publiceringar för flera serials
framgår. I `/temperatures` ska enheterna visas med modell, serial, status,
temperatur, CO₂ och tidpunkt för senaste avläsning. När simulatorn publicerar
nästa värde ska motsvarande kort uppdateras utan att knappen **Refresh**
används; statusen **Live updates** bekräftar SignalR-anslutningen. Avsluta med
att öppna **View history** på en sensor för att visa den sparade tidsserien från
Portal.Adapter.

## Verifiering

Följande byggen har verifierats lokalt:

```bash
dotnet build Backend/Backend.csproj --no-restore
dotnet build Innovia-iot/innovia-iot/src/DeviceRegistry.Api/DeviceRegistry.Api.csproj --no-restore
dotnet build Innovia-iot/innovia-iot/src/Ingest.Gateway/Ingest.Gateway.csproj --no-restore
dotnet build Innovia-iot/innovia-iot/src/Realtime.Hub/Realtime.Hub.csproj --no-restore
dotnet build Innovia-iot/innovia-iot/src/Portal.Adapter/Portal.Adapter.csproj --no-restore
npm --prefix Frontend run build
```

Mer detaljer om temperaturvyn finns i
[`MD_FILES/IOT_TEMPERATURE_REFRESH.md`](MD_FILES/IOT_TEMPERATURE_REFRESH.md).
