# Andora

Andora is a web messaging application with account authentication, email verification and password reset flows, friend relationships, notifications, presence, and real-time conversations.

## Prerequisites

- Node.js and npm for the client. This workspace was verified with Node.js `v22.14.0` and npm `10.9.2`.
- Python for the server. The existing virtual environment was verified with Python `3.13.7`.
- A local Redis server. The server uses Redis databases `0`, `1`, and `2` for online presence, user data, and notifications.
- A Gmail SMTP account and app password for verification and password-reset email. SMTP delivery was not tested because it requires external credentials and network access.

The repository does not contain a sanitized `.env.example`, `pyproject.toml`, Docker configuration, CI configuration, or contributor documentation. The existing `server/.env` contains live-looking credentials and must not be copied into a new checkout or committed. Rotate those credentials if they are real.

## Setup

1. From the repository root, install the client dependencies:

   ```powershell
   Set-Location .\client
   npm install
   ```

2. Create or edit `server/.env` with the variables required by the backend:

   ```dotenv
   PORT=7777
   PY_ENV=dev
   DB_NAME=andora.db
   JWT_SECRET=<long-random-secret>
   DEFAULT_PROFILE=default.webp
   EMAIL=<Gmail sender address>
   EMAIL_APP_PASSWORD=<Gmail app password>
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   ONLINE_USER_DB=0
   USER_DATA_DB=1
   NOTIFICATION_DB=2
   ```

   These names and the shown local port/database values come from the existing server configuration. The application reads `JWT_SECRET`, `EMAIL`, and `EMAIL_APP_PASSWORD` for authentication and email delivery; the exact account and secret values are not determined by the codebase.

3. Create a Python virtual environment and install the declared backend dependencies:

   ```powershell
   Set-Location .\server
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   python -m pip install -r requirements.txt
   ```

   An existing `server/venv` was present during verification, so the commands above were not rerun against a fresh environment.

4. Configure the client API URL. The client reads Vite variables named `VITE_API_URL_LOCAL` and `VITE_API_URL_PRODUCTION`; the Socket.IO client specifically uses `VITE_API_URL_LOCAL`.

   For local development, create `client/.env.local` containing:

   ```dotenv
   VITE_API_URL_LOCAL=http://localhost:7777
   ```

   The URL is based on the backend's configured port and should match the server address you run.

## Run Locally

Start Redis first, then run the backend from `server/`:

```powershell
Set-Location .\server
.\venv\Scripts\Activate.ps1
python server.py
```

The backend binds to `0.0.0.0:7777` in the current configuration. Importing the server creates the SQLite database and tables automatically at `files/database/andora.db`; there are no separate migration or seed scripts.

In a second terminal, run the client from `client/`:

```powershell
Set-Location .\client
npm run dev
```

Vite is configured to listen on port `5173`, so the local client URL is `http://localhost:5173`. The backend allows this origin for CORS and Socket.IO. The client requires the backend and Redis to be available for authenticated chat and real-time features. Email verification and password reset additionally require valid Gmail SMTP configuration.

To serve the production build locally after building:

```powershell
Set-Location .\client
npm run preview
```

Vite's default preview port is used because no preview port is configured in `vite.config.ts`.

## Checks

Run the available client checks from `client/`:

```powershell
npm run build
npm run lint
```

`npm run build` was verified successfully. It reported only a stale Browserslist database warning. `npm run lint` was run successfully as a command but exited with errors in existing source files, including explicit `any` uses, hook dependency warnings, and React static-component errors in `SideBar.tsx`.

No automated test suite or test directory was found in the repository.

A backend import check was also run with the existing virtual environment:

```powershell
Set-Location .\server
.\venv\Scripts\python.exe -c "import server; print('backend import succeeded')"
```

It succeeded, created the tables, and started the background email worker. It also printed an Eventlet `RLock` warning. Redis connectivity, SMTP delivery, and an end-to-end authenticated session were not verified.

## Structure

- `client/`: React 19 and TypeScript frontend built with Vite. Application routes and components are under `client/src/`; Axios API calls, Socket.IO events, IndexedDB caching, and Zustand stores are implemented there.
- `server/`: Flask and Flask-SocketIO backend. `server.py` loads configuration, initializes Socket.IO, registers route blueprints, creates tables, and starts background workers.
- `server/routes/`: HTTP route blueprints for authentication, users, friends, chat, and notifications.
- `server/modules/`: Database access and schema creation, Redis caching, Socket.IO handlers, email sending, and background workers.
- `files/database/`: SQLite database storage. The database file is created here using `DB_NAME`.

## Runtime Notes

- Authentication uses a JWT stored in the `logged_in` cookie; the client sends API requests with credentials enabled and the Socket.IO connection also requires the cookie.
- The backend starts the pending-signup cleanup scheduler and email queue worker automatically when `server.py` initializes.
- Redis is initialized by the caching modules during backend import. A Redis service that is unavailable may prevent presence, user-data, or notification functionality from working.
- The current client and server CORS allowlists include `localhost:5173`, `localhost:4173`, and some additional development origins listed directly in `server.py` and `server/modules/websocket.py`. Update those allowlists if the frontend is served from another origin.
