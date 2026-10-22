 # Skola_innovia_gruppProjekt

Bokningssystem för kontorsresurser — mötesrum, skrivbord, VR-headsets och AI-servrar. Backend i ASP.NET Core, frontend i React/Vite.

## IoT-källkod

IoT-lösningen är en vanlig del av detta repository och finns i
`Innovia-iot/innovia-iot`. Där ingår bland annat Edge Simulator,
Ingest Gateway, Device Registry och portaladaptern. Se
`Innovia-iot/innovia-iot/README.md` för instruktioner för IoT-tjänsterna.

## Produktion server

[innovia.froden.nu
](https://innovia.froden.nu/login)

## Förutsättningar

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (LTS)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (för PostgreSQL)

## 1. Starta databasen

Starta Docker Desktop, kör sedan:

```bash
docker run --name innovia-db -e POSTGRES_USER=app -e POSTGRES_PASSWORD=devpassword -e POSTGRES_DB=appdb -p 5433:5432 -d postgres
```

Nästa gång räcker det med `docker start innovia-db` om containern redan finns.

## 2. Starta backend

```bash
cd Backend
dotnet user-secrets set "Jwt:Key" "<en-lång-hemlig-nyckel>"   # bara första gången
dotnet run
```

Migrationer och seed-data körs automatiskt vid start i Development. Backend körs på `http://localhost:5109`, Swagger UI finns på `http://localhost:5109/swagger`.

## 3. Starta frontend

```bash
cd Frontend
npm install
npm run dev
```

Öppnas på `http://localhost:5173`. Vite proxar `/api` och `/hubs` till backend på port 5109.

## Felsökning

**"Failed to connect to 127.0.0.1:5433"** — PostgreSQL kör inte, eller så används fel host-port. Kontrollera att Docker Desktop är igång och att containern är startad (`docker start innovia-db`). Port `5433` används lokalt för bokningsdatabasen för att inte krocka med IoT-projektets PostgreSQL på `5432`.

## AI-supportchattbot

Innovia har en AI-baserad förstalinjesupport för inloggade användare. Chatten hjälper användaren att felsöka enklare problem i bokningssystemet och hänvisar till IT-support när problemet kräver mänsklig hjälp. Den kan inte läsa bokningar, kontrollera systemstatus eller göra ändringar i systemet.

### Teknisk lösning

```text
React-komponent → POST /api/chat/ChatBot → ChatService → OpenAI Responses API
```

- Frontend: `Frontend/src/components/ITSupport.tsx`
- API-endpoint: `Backend/Controllers/ChatController.cs`
- AI-tjänst och instruktioner: `Backend/Services/ChatService.cs`
- Chatten kräver en giltig JWT, eftersom endpointen använder `[Authorize]`.
- Klienten skickar högst de 20 senaste meddelandena som chatthistorik. Historiken sparas bara i den öppna chatten i webbläsaren; den lagras inte av backend.

### Konfiguration lokalt

Konfigurera API-nyckeln från katalogen `Backend` före du startar backend:

```bash
dotnet user-secrets set "OpenAI:ApiKey" "din-api-nyckel"
```

Alternativt kan miljövariabeln `OPENAI_API_KEY` användas. Modellen är för närvarande konfigurerad i `ChatService.cs`.

Starta sedan backend och frontend enligt instruktionerna ovan, logga in och öppna chattikonen nere till höger. Skicka ett meddelande för att verifiera att svaret visas i chatten. Knappen **Talk to a person** öppnar en telefonlänk till IT-support på `072-053-18-19`.

### Säkerhet och avgränsningar

- API-nyckeln får aldrig läggas i React/Vite-koden, `appsettings.json` eller Git. Använd .NET User Secrets lokalt och en skyddad miljövariabel på produktionsservern.
- Endast autentiserade användare kan anropa chatt-API:t.
- Chatt-API:t begränsas till 10 anrop per minut och inloggad användare. Meddelanden får vara högst 1 000 tecken, historiken högst 20 meddelanden, och varje historikpost måste ha rollen `user` eller `assistant`.
- AI-svaret begränsas till högst 400 output-tokens för att hålla svaren korta och begränsa kostnaden.
- Chatboten instrueras att inte påstå att den har kontrollerat bokningar, databas, loggar eller användarens enhet.
- Vid osäkerhet eller ett troligt systemfel ska den hänvisa användaren till IT-support i stället för att hitta på ett svar.
