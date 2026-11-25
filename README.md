# Easy Visa — إيزي فيزا

Bilingual (Arabic RTL / English) travel & visa request platform for Easy Visa, Mukalla, Hadhramaut.
Customers send service requests, book seats on scheduled trips, pay by bank transfer or card link, and track everything with a reference number. The owner manages all content, prices, trips, payments and contact details from the dashboard.

**Stack:** Next.js 16 (App Router) · Payload CMS 3 (dashboard + API) · PostgreSQL 16 · Tailwind CSS v4 · next-intl · Vitest · Playwright.

## Run locally

```bash
npm install
npm run db:local      # starts Postgres on :5433 without Docker (keep this terminal open)
npm run seed          # bilingual content + demo requests/trips/payments/visits
npm run dev           # http://localhost:3000  ·  dashboard: /admin
```

With Docker instead: `npm run db:up` (uses `docker-compose.yml`, same port and credentials).

Seed logins (development only): `owner@easyvisa.test` / `ChangeMe!2026` and `staff@easyvisa.test` / `Staff!2026`.
`npm run seed -- --no-demo` loads content without demo requests.

## Tests

```bash
npm run test:int      # unit tests (phones, references, validation, CSV safety, seats, offers…)
npm run test:e2e      # browser journeys on a phone profile (needs dev server + seed)
npm run typecheck
```

## Project map

| Path | What it is |
|---|---|
| `src/app/(frontend)/[locale]/…` | Public site pages (ar/en) |
| `src/app/(payload)` | Dashboard (`/admin`) and REST API (`/api`) |
| `src/collections`, `src/globals` | Data model and access rules |
| `src/endpoints` | Public endpoints: submit, track, book trip, pay, export |
| `src/components/admin` | Dashboard home, reports, WhatsApp actions |
| `src/lib` | Phone/reference/date utils, validation schema, stats, queries |
| `src/messages/{ar,en}.json` | Interface text |
| `src/seed` | Starter content |
| `deploy/` | Production compose, Caddy (HTTPS), backups |
| `docs/` | Plan, deployment guide, owner guide (Arabic) |

## Key behaviours

- **Requests** get an unguessable reference (`EV-26-K7M3QX`). Tracking needs the reference + last 4 phone digits; only customer-safe fields are returned.
- **Documents** are stored outside the public folder and served only to signed-in staff. File type is checked from the file contents.
- **Trips** count booked seats automatically from requests (cancelled/rejected release seats). Over-booking is refused.
- **Payments:** the office sets an amount on a request; the customer sees bank accounts (from Settings), uploads a receipt, or opens a card checkout link; staff confirm. Card details never touch this site.
- **Analytics** are cookieless (daily-salted hash), honour Do-Not-Track, and keep ~13 months.
- **Content edits** refresh public pages immediately.

See `docs/DEPLOYMENT.md` before going live.
