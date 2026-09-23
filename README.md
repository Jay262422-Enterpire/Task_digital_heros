# Digital Heroes

A subscription web app that combines golf performance tracking, a monthly prize draw, and charity giving. Level 1 from the Digital Heroes PRD: public story, subscriber desk, and admin control room.

The look leads with charitable impact — dark, editorial, gold and rose — not fairways or club crests.

## What you can do

- Browse the homepage, charity directory (search + filter), and draw rules without an account
- Sign up, pick a charity (10%+ of the fee), then subscribe monthly (£12) or yearly (£108) via **Stripe Checkout**
- Log a rolling window of five Stableford scores (1–45, one per date)
- Sit in a monthly draw whose ticket *is* those five scores
- Upload winner proof; admins verify and mark payouts paid
- Admins manage users, scores, subscriptions, charities, draw simulation/publish, winners, and reports

Payments use **Stripe Checkout** (hosted). The click does not activate a plan — `checkout.session.completed` (and related subscription/invoice events) does. Without Stripe keys, subscribe shows an error instead of a fake success. Prisma talks to **PostgreSQL** (Supabase on Vercel).

## Run locally

```bash
npm install
cp .env.example .env
# Set DATABASE_URL and DIRECT_URL to PostgreSQL (local Postgres or your Supabase URIs).
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Open [http://127.0.0.1:4327](http://127.0.0.1:4327). `npm run dev` generates the client and runs `prisma migrate deploy`; it will exit if `DATABASE_URL` is not a Postgres URI.

Reset demo data anytime (destructive):

```bash
npm run db:reset
```

Engine unit tests:

```bash
npm test
```

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Player (Maya, 3-match pending proof) | `player@digitalheroes.test` | `HeroPlay!26` |
| Admin | `admin@digitalheroes.test` | `HeroAdmin!26` |
| Other players | `jordan@`, `sam@`, `riley@`, `alex@` + `digitalheroes.test` | `HeroPlay!26` |

Riley already has a verified, paid 4-match from August. Alex is lapsed.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · Prisma · PostgreSQL · jose sessions · bcryptjs · Stripe Checkout
