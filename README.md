 # Skola_innovia_gruppProjekt

Bokningssystem för kontorsresurser — mötesrum, skrivbord, VR-headsets och AI-servrar. Backend i ASP.NET Core, frontend i React/Vite.

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
docker run --name innovia-db -e POSTGRES_USER=app -e POSTGRES_PASSWORD=devpassword -e POSTGRES_DB=appdb -p 5432:5432 -d postgres
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

**"Failed to connect to 127.0.0.1:5432"** — PostgreSQL kör inte. Kontrollera att Docker Desktop är igång och att containern är startad (`docker start innovia-db`).
