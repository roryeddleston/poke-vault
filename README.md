# PokeVault

A full-stack Pokemon card portfolio tracker built with Next.js App Router.

Track holdings, review profit/loss, explore card search results, and view a clear "How it works" breakdown of the project architecture and user flow.

---

## Current Pages

- `Dashboard` (`/`): portfolio KPIs, top/worst performers, recent price changes, top movers, allocation tabs
- `Portfolio` (`/portfolio`): searchable/filterable holdings table, add holding dialog, export CSV, set demo as default
- `Search` (`/market`): search cards by name or number (for example `60/64`) and add cards to portfolio
- `How it works` (`/analytics`): project goal, tech stack, and user flow

---

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Prisma 7 (`@prisma/client`, `@prisma/adapter-neon`)
- Neon PostgreSQL (plus SQLite support for local workflows)
- Tailwind CSS 4
- TCGdex SDK (`@tcgdex/sdk`)
- ESLint

---

## API Routes

- `GET /api/portfolio` - portfolio payload (holdings + summary)
- `POST /api/portfolio/reset` - restore demo data from template snapshot
- `POST /api/portfolio/promote` - promote current demo data to template
- `GET /api/holdings` - list holdings
- `POST /api/holdings` - create holding
- `PATCH /api/holdings/[id]` - update holding
- `DELETE /api/holdings/[id]` - delete holding
- `GET /api/cards/search` - card search endpoint

---

## Data Model

Core Prisma models:

- `Holding`: card-level portfolio position (card metadata, grade, finish, edition, quantity, purchase price)
- `PriceSnapshot`: historical valuation snapshots linked to holdings

The demo uses owner-scoped records (`demo`, `demo-template`) to support deterministic reset/promote flows.

---

## Getting Started

### 1) Install

```bash
npm install
```

### 2) Configure environment

Create `.env` with at least:

```bash
DATABASE_URL=your_database_connection_string
```

### 3) Prisma setup

```bash
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
```

### 4) Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Live link: https://pokevault.roryeddleston.co.uk/

---

## Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - run ESLint

---

## Deployment Notes (Vercel)

- Add `DATABASE_URL` in Project Settings -> Environment Variables (no quotes)
- Build command: `npm run build`
- Install command: `npm install`
- If Prisma schema changes, ensure migrations are applied before/with deployment
