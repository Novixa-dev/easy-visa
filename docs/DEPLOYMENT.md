# Deployment & operations

## Recommended hosting

A small VPS (2 vCPU / 4 GB RAM / 60 GB disk) close to the audience, e.g. Hetzner (Germany/Finland), DigitalOcean (Frankfurt) or a Gulf region provider. Roughly 6–25 USD per month. Register the **domain and hosting in Easy Visa's own account**, not a developer's.

## First deployment

```bash
# on the server (Ubuntu 24.04), with Docker installed
git clone <repo> easy-visa && cd easy-visa
cp .env.production.example .env.production   # fill DOMAIN, passwords, PAYLOAD_SECRET, SMTP
set -a; . ./.env.production; set +a
docker compose -f deploy/docker-compose.prod.yml up -d --build
```

- Point the domain's **A record** to the server IP first; Caddy issues HTTPS certificates automatically.
- Database migrations run automatically when the app starts (`src/migrations`).
- Create the owner account at `https://DOMAIN/admin`; the first account is made **Owner** automatically.
- Do **not** run the seed in production. Enter real content from the dashboard, or run `npm run seed -- --no-demo --force` once and then edit.

## Before launch checklist

- [ ] Settings → Contact: confirm both WhatsApp numbers, add Instagram/Facebook URLs, address and hours.
- [ ] Settings → Payments: replace the placeholder bank accounts with real ones.
- [ ] Companies: replace placeholder company names; Trips: real dates, seats and prices.
- [ ] Settings → Notifications: add the email that receives new-request alerts; set SMTP in `.env.production`.
- [ ] Upload the original SVG logo if available (current logo is extracted from the provided images).
- [ ] Review About, Privacy and Terms text (approved), service requirements and prices.
- [ ] Create staff accounts (role Staff) and enable a strong password for each.
- [ ] Test a full request, a trip booking and a payment from a phone on mobile data.
- [ ] Confirm backups appear in `deploy/backups/` and copy them off the server.

## Card payments

The site never collects card numbers. For each request, staff paste a **secure checkout link** from the payment provider (a bank e-payment page, PayTabs, Stripe Payment Links, PayPal, etc.) into *Invoice & payment → Card payment link*. The customer pays there; staff then record the payment as *Paid*. If later a provider with an API is chosen, it can be connected to create links automatically.

## Backups & restore

The `backup` service writes a database dump and an archive of uploads every 24 h to `deploy/backups/` (kept 14 days). Copy them off-site (e.g. `rclone` to Google Drive or S3).

Restore:

```bash
docker compose -f deploy/docker-compose.prod.yml exec -T db pg_restore -U easyvisa -d easyvisa --clean < deploy/backups/db-YYYYMMDD-HHMM.dump
```

## Updating

```bash
git pull
docker compose -f deploy/docker-compose.prod.yml up -d --build
```

When the data model changes, create a migration in development first: `npm run migrate:create <name>` and commit it.

## Scaling notes

- Rate limiting is in memory (fine for one app container). For several containers, move it to Redis.
- Private documents can move to S3-compatible storage with `@payloadcms/storage-s3` (private bucket, signed URLs).
