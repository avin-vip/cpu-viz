# CPU Viz

Interactive semiconductor education platform — learn chip architecture, manufacturing, and supply chains through visual explorations.

## Quick start

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Install dependencies
npm install

# 3. Apply schema and seed content
npx prisma db push
npm run db:seed

# 4. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | E2E tests (Playwright, requires DB + dev server) |
| `npm run db:seed` | Seed modules, lessons, companies, graph |

## Documentation

| Document | Purpose |
|----------|---------|
| [PRD.md](./PRD.md) | Product requirements |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design |
| [TASKS.md](./TASKS.md) | Implementation backlog |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md) | Current progress |

## MVP features

- Landing page with 8 learning modules
- Fundamentals track (3 lessons) + CPU track (3 lessons)
- Interactive CPU pipeline explorer (`/cpu/pipeline`)
- Supply chain graph with 27 companies (`/graph`)
- Company directory and detail pages (`/companies`)

## Environment

Copy `.env.example` to `.env`. Default `DATABASE_URL` targets the Docker Compose Postgres instance.
