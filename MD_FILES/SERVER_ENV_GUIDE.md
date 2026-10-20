# Environment files on your own server

This guide explains how to configure Innovia's ASP.NET Core backend on a Linux server. The systemd example assumes a server that uses systemd; adjust paths and usernames for your deployment. These are instructions, not changes already made to your server.

## What an environment file does

An environment file stores settings as `NAME=value` lines. Your server's process manager loads those settings into the backend process so you can change configuration without changing C# code.

ASP.NET Core reads process environment variables automatically through `WebApplication.CreateBuilder(args)`. It does **not** automatically read a file just because it is named `.env`. You must load that file through your process manager, container runtime, or shell.

Environment variables override the normal appsettings JSON configuration. See [Microsoft's configuration documentation](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/?view=aspnetcore-8.0).

## Matching environment names to your C# code

For nested ASP.NET configuration keys, use two underscores (`__`) in environment variable names:

| Environment variable | C# configuration lookup |
| --- | --- |
| `OpenAI__ApiKey` | `configuration["OpenAI:ApiKey"]` |
| `OpenAI__Model` | `configuration["OpenAI:Model"]` |
| `Jwt__Key` | `configuration["Jwt:Key"]` |
| `Jwt__Issuer` | `configuration["Jwt:Issuer"]` |
| `Jwt__Audience` | `configuration["Jwt:Audience"]` |
| `ConnectionStrings__DefaultConnection` | `configuration.GetConnectionString("DefaultConnection")` |
| `Cors__AllowedOrigins__0` | First entry in `Cors:AllowedOrigins` |

The chatbot example in `AI_CHATBOT_GUIDE.md` reads `OpenAI:ApiKey`, so use `OpenAI__ApiKey` for that version.

If your service instead uses this original code:

```csharp
Environment.GetEnvironmentVariable("OPENAI_API_KEY")
```

then set `OPENAI_API_KEY`. These two names are different; choose the name matching your code. If you hardcode the model, you do not need `OpenAI__Model`.

## Create a server environment file

Keep it outside the frontend and outside directories served by your web server. For example, on your server:

```bash
sudo install -d -m 700 /etc/innovia
sudo install -m 600 /dev/null /etc/innovia/backend.env
sudo nano /etc/innovia/backend.env
```

Run the `install` command for the file only when first creating it: running it again would empty an existing file. Use `nano` to edit it afterward.

Example contents:

```dotenv
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://127.0.0.1:5109

OpenAI__ApiKey='REPLACE_WITH_YOUR_API_KEY'
OpenAI__Model='REPLACE_WITH_YOUR_MODEL_ID'

Jwt__Key='REPLACE_WITH_A_LONG_RANDOM_SECRET'
Jwt__Issuer='REPLACE_WITH_YOUR_CONFIGURED_ISSUER'
Jwt__Audience='REPLACE_WITH_YOUR_CONFIGURED_AUDIENCE'

ConnectionStrings__DefaultConnection='Host=127.0.0.1;Port=5432;Database=appdb;Username=app;Password=REPLACE_WITH_DATABASE_PASSWORD'
Cors__AllowedOrigins__0=https://your-domain.example
```

Replace every placeholder. Match issuer and audience to the values your application uses to issue tokens. Set CORS origins to your frontend's actual origin, without a trailing slash. Add `Cors__AllowedOrigins__1` for another origin if needed.

This example binds the backend to localhost and assumes an HTTPS reverse proxy on the same server forwards `/api` and `/hubs` to it. A backend inside a container needs a different bind address and database host.

Use simple literal values. Environment-file syntax differs between systemd, Bash, and Docker; do not assume variable expansion or escaping behaves identically. For systemd files, do not add `export` before variable names.

## Load the file with systemd

If you already have a backend service, add `EnvironmentFile=/etc/innovia/backend.env` to its `[Service]` section and retain the existing working directory, command, and user.

For a new service, this is an example `/etc/systemd/system/innovia-backend.service`:

```ini
[Unit]
Description=Innovia ASP.NET backend
After=network.target

[Service]
WorkingDirectory=/srv/innovia/backend
ExecStart=/usr/bin/dotnet /srv/innovia/backend/Backend.dll
User=innovia
EnvironmentFile=/etc/innovia/backend.env
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

This assumes:

- You have published the backend to `/srv/innovia/backend`.
- Its assembly is named `Backend.dll`.
- The `innovia` service user exists and can read the published application and its guides.
- The required .NET runtime is installed at `/usr/bin/dotnet`.
- Your database is available.

The system service manager reads the root-owned environment file before starting the process as the service user. Keep the file permissions restrictive.

After creating or changing the service definition:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now innovia-backend
sudo systemctl restart innovia-backend
sudo systemctl status innovia-backend
```

After editing only `backend.env`, restart the service to load the new values:

```bash
sudo systemctl restart innovia-backend
```

Use your existing service name if different. The environment file is read when the service starts; editing it does not change the running process.

See the official [systemd execution documentation](https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html#EnvironmentFile=).

## Running manually in Bash

For a development check, you can load a trusted, Bash-compatible file in the same terminal before starting the backend:

```bash
cd /path/to/Innovia-local/Backend
set -a
source /path/to/your/backend.env
set +a
dotnet run --no-launch-profile
```

`set -a` exports assignments so the child process receives them. `source` executes the file as shell code, so only source files you control. This does not configure a separately running systemd service and does not persist across new terminals. Avoid shell tracing (`set -x`) when loading secrets.

## If you deploy with Docker

Docker can load environment variables from a file using `docker run --env-file /path/to/backend.env ...`. In Compose, `env_file` under the backend service passes the file's values into that container:

```yaml
services:
  backend:
    image: your-backend-image
    env_file:
      - /path/to/backend.env
```

Compose's project `.env` file is primarily used for substitution in the Compose configuration; it does not automatically inject every variable into the backend container. Use `env_file` or explicit `environment` entries. Recreate the backend container after changing its environment settings.

Use values appropriate for containers, such as `ASPNETCORE_URLS=http://0.0.0.0:5109` and the database container's service name as the database host. Check your existing image and networking configuration before applying this alternative.

See [Docker Compose environment-file documentation](https://docs.docker.com/compose/how-tos/environment-variables/set-environment-variables/).

## React and Vite environment files

Your frontend uses Vite. Frontend variables prefixed with `VITE_` are exposed to browser code, so they are public. Never put the OpenAI API key, JWT signing key, or database password in a `VITE_` variable.

An optional public setting in `Frontend/.env.production` could be:

```dotenv
VITE_API_BASE_URL=https://your-domain.example
```

Read it in React with:

```tsx
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
```

This setting only affects your requests if you actually use it when building URLs. Your current chatbot example uses the relative URL `/api/chat/ChatBot`; that works when your production web server forwards `/api` to your backend. The Vite development proxy does not configure a production web server.

Vite replaces frontend environment values at build time. Rebuild and redeploy the frontend when those values change; changing the backend service environment does not change an already-built React bundle.

See [Vite environment-variable documentation](https://vite.dev/guide/env-and-mode).

## Keep real environment files out of Git

Use ignore rules such as these if storing local environment files in your checkout:

```gitignore
.env
.env.*
*.env
!.env.example
```

You can commit `.env.example` containing placeholders to document the required settings. Ignore rules do not remove files already tracked by Git. If a real key was committed or exposed, replace it with the key owner's help.

The recommended `/etc/innovia/backend.env` path is outside your checkout, so it is not part of normal commits.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| OpenAI API key is missing | Match the environment name to the C# lookup and restart the backend. |
| Database connection is missing or fails | Set `ConnectionStrings__DefaultConnection`; verify the database address and credentials. |
| JWT key is missing | Set `Jwt__Key` and restart. |
| Authenticated calls return 401 | Check the login token, signing key, issuer, audience, and expiry. |
| Browser reports CORS errors | Set the frontend origin in `Cors__AllowedOrigins__0`. |
| New values do not take effect | Restart the backend service, recreate its container, or rebuild the frontend as appropriate. |
| Local guide cannot be found | Publish `Guides/it-support.md` and verify the service working directory and read permissions. |

Inspect service logs without printing your configuration or API key:

```bash
sudo journalctl -u innovia-backend -n 50 --no-pager
```

Your current `Program.cs` runs database migrations and seed data only in Development. Setting Production means those steps do not run automatically; ensure the production database has been prepared separately.

For the chatbot code and local Markdown guide setup, see [AI_CHATBOT_GUIDE.md](AI_CHATBOT_GUIDE.md).
