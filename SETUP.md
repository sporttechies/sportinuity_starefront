# Sportinuity setup guide

This repository contains four independently deployable projects:

- `app/` — public Sportinuity website
- `manager/` — internal operations dashboard
- `backend/` — Express API and authentication server
- `db/` — SQL schema and development seed scripts

Only `backend/` connects to PostgreSQL. The two Next.js applications communicate with the backend over HTTP.

## 1. Prerequisites

Install:

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+

From the repository root, install the root/public application dependencies:

```bash
pnpm install
pnpm --dir backend install
pnpm --dir manager install
```

## 2. Configure PostgreSQL

Create a local database, for example:

```bash
createdb sportinuity
```

Run the schema before the seed data:

```bash
psql "$DATABASE_URL" -f db/001_team_logistics.sql
psql "$DATABASE_URL" -f db/002_seed_development.sql
```

If you do not use `DATABASE_URL` in your shell, replace `"$DATABASE_URL"` with your PostgreSQL connection string:

```bash
psql "postgresql://postgres:postgres@localhost:5432/sportinuity" -f db/001_team_logistics.sql
psql "postgresql://postgres:postgres@localhost:5432/sportinuity" -f db/002_seed_development.sql
```

The seed creates:

| Account | Email | Password | Access |
| --- | --- | --- | --- |
| Sportinuity manager | `manager@sportinuity.test` | `ManagerPass!2026` | Internal manager dashboard |
| Harbour Sharks FC admin | `admin@harboursharks.test` | `TeamPass!2026` | Harbour Sharks team requests |
| Eagles Basketball Club admin | `admin@eaglesbasketball.test` | `TeamPass!2026` | Eagles Basketball team requests |

These credentials are for local development only. Change or remove them before using a shared or production database.

## 3. Configure the backend

Create `backend/.env`:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sportinuity
JWT_SECRET=replace-with-a-long-random-server-only-secret
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

`JWT_SECRET` and `DATABASE_URL` must remain in the backend environment. Do not copy them into `app/.env` or `manager/.env`.

Start the API:

```bash
pnpm --dir backend dev
```

The API should be available at `http://localhost:4000`.

## 4. Configure the public app

Create `app/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Start the public website:

```bash
pnpm dev
```

Open `http://localhost:3000`.

Public flows:

1. Use the travel request form on the homepage.
2. Select dates from the calendar dialog.
3. Select adults, children, and infants from the traveller dialog.
4. Submit the request.
5. Use **Team login** to access team-only request management.
6. Use **Manage request** to look up and manage a request after signing in.

## 5. Configure the manager dashboard

Create `manager/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Start the manager app in a second terminal:

```bash
pnpm --dir manager dev
```

Open the URL printed by Next.js, normally `http://localhost:3001` if the public app is already using port 3000.

Sign in with:

```text
Email: manager@sportinuity.test
Password: ManagerPass!2026
```

The manager dashboard is intended for Sportinuity internal operations. It reads logistics data through the Express API; it does not connect directly to PostgreSQL.

## 6. Sign in as a team

From the public app, open **Team login** or visit:

```text
http://localhost:3000/team-login
```

Sign in as Harbour Sharks:

```text
Email: admin@harboursharks.test
Password: TeamPass!2026
```

Or sign in as Eagles Basketball Club:

```text
Email: admin@eaglesbasketball.test
Password: TeamPass!2026
```

After authentication:

- Open **Manage request**.
- Look up a request using its reference.
- The backend validates the team session before returning managed request data.
- Team accounts are scoped to their own team profile.

To create a new team account, use **Create an account** on the team login page. Registration creates the team profile and its first team administrator through the backend API.

## 7. Useful API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/team/register` | Create a team and first team administrator |
| `POST` | `/api/auth/team/login` | Sign in a team administrator |
| `GET` | `/api/auth/team/me` | Validate the current team session |
| `POST` | `/api/auth/manager/login` | Sign in an internal manager |
| `POST` | `/api/logistics/public-requests` | Create a public logistics request |
| `GET` | `/api/logistics/public-requests/:id` | Public request lookup |
| `GET` | `/api/logistics/requests` | Manager logistics data |
| `GET` | `/api/logistics/requests/:id` | Protected request details |

Use the token returned by login in the backend request header:

```http
Authorization: Bearer <token>
```

## 8. Troubleshooting

### CORS errors

Make sure `backend/.env` includes the exact frontend origins:

```env
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

Restart the backend after changing environment variables.

### Database connection errors

Check that PostgreSQL is running, the database exists, and `DATABASE_URL` points to the correct database. Run the schema and seed scripts in order.

### Empty manager dashboard

Confirm the backend is running on port 4000, the manager has `NEXT_PUBLIC_API_URL=http://localhost:4000`, and the manager account exists in the seeded database.

### Reset development data

To reset the local database, drop and recreate it, then run both SQL files again:

```bash
dropdb sportinuity
createdb sportinuity
psql "$DATABASE_URL" -f db/001_team_logistics.sql
psql "$DATABASE_URL" -f db/002_seed_development.sql
```

Never run reset commands against a shared or production database.
