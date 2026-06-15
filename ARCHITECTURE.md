# Architecture — CPU Viz

> Staff-level system design for an interactive semiconductor education platform.
> **Status:** Pre-implementation design document. No application code exists yet.

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Folder Structure](#2-folder-structure)
3. [Database Design](#3-database-design)
4. [Semiconductor Knowledge Graph Design](#4-semiconductor-knowledge-graph-design)
5. [Visualization Framework Design](#5-visualization-framework-design)
6. [Educational Content Architecture](#6-educational-content-architecture)
7. [Page Architecture](#7-page-architecture)
8. [MVP Scope](#8-mvp-scope)
9. [Execution Roadmap](#9-execution-roadmap)
10. [Risks and Technical Challenges](#10-risks-and-technical-challenges)

---

## 1. System Architecture

### 1.1 Design Principles

| Principle | Application |
|-----------|-------------|
| **Simplicity first** | One monolith (Next.js) until traffic or team size demands splitting |
| **Schema-driven** | Lessons, visualizations, and graph data are data — not hardcoded in components |
| **Server-first rendering** | Fetch content on the server; hydrate only interactive surfaces |
| **Progressive complexity** | Relational Postgres before graph DB; seed scripts before CMS |
| **Separation of concerns** | Domain data (Postgres) ≠ presentation config (viz JSON) ≠ UI components |

### 1.2 High-Level System Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              CDN / Edge                                  │
│                    Static assets · ISR-cached pages                      │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼─────────────────────────────────────────┐
│                         Next.js Application                              │
│                                                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────────┐  │
│  │ Server          │  │ Client Islands  │  │ API Routes               │  │
│  │ Components      │  │                 │  │ /api/content/*           │  │
│  │ (RSC)           │  │ React Flow      │  │ /api/graph/*             │  │
│  │                 │  │ D3.js           │  │ /api/companies/*         │  │
│  │ Data fetching   │  │ Framer Motion   │  │ /api/progress/*          │  │
│  │ SEO metadata    │  │ URL-driven state│  │                          │  │
│  └────────┬────────┘  └────────┬────────┘  └────────────┬─────────────┘  │
│           │                    │                        │                │
│           └────────────────────┼────────────────────────┘                │
│                                ▼                                         │
│                    ┌───────────────────────┐                             │
│                    │   Service Layer (lib/)  │                             │
│                    │   content · graph · viz │                             │
│                    └───────────┬───────────┘                             │
│                                ▼                                         │
│                    ┌───────────────────────┐                             │
│                    │      Prisma ORM       │                             │
│                    └───────────┬───────────┘                             │
└────────────────────────────────┼─────────────────────────────────────────┘
                                 ▼
                    ┌────────────────────────┐
                    │     PostgreSQL       │
                    │  (Neon / Supabase)   │
                    └────────────────────────┘
```

**Deployment target:** Vercel (frontend + serverless API) + managed PostgreSQL (Neon recommended for serverless connection pooling).

**Deferred infrastructure:** Redis cache, graph database (Neo4j), search engine (Meilisearch/Typesense), object storage (S3) — none required for MVP.

---

### 1.3 Frontend Architecture

#### Layer Model

```
┌─────────────────────────────────────────────────────────┐
│  Routes (app/)          — URL → page, metadata, layout  │
├─────────────────────────────────────────────────────────┤
│  Feature Components     — learn/, graph/, layout/       │
├─────────────────────────────────────────────────────────┤
│  Visualization Layer    — react-flow/, d3/, shared/     │
├─────────────────────────────────────────────────────────┤
│  UI Primitives (ui/)    — Button, Card, Badge, Panel    │
├─────────────────────────────────────────────────────────┤
│  Lib + Hooks            — data transforms, URL state    │
└─────────────────────────────────────────────────────────┘
```

#### Rendering Strategy

| Surface | Rendering | Rationale |
|---------|-----------|-----------|
| Landing page | SSG / ISR (revalidate: 3600) | Static marketing content, fast LCP |
| Module overview pages | ISR | Content changes infrequently |
| Lesson pages | SSR (RSC) | SEO, fresh content, no client fetch waterfall |
| Supply chain graph page | SSR shell + client viz | SEO for page; interactivity client-side |
| Company detail pages | SSR | Rich metadata for sharing |
| API routes | Serverless functions | Dynamic graph queries, progress writes |

#### Component Classification

Every component falls into one of three categories:

1. **Server Components (default)** — Layout shells, lesson text, module lists, company profiles (static sections)
2. **Client Components (`"use client"`)** — Anything with hooks, event handlers, browser APIs, or viz libraries
3. **Client-only dynamic imports** — React Flow and D3 bundles loaded via `next/dynamic` with `ssr: false`

#### Route Groups

| Group | Path prefix | Layout behavior |
|-------|-------------|-----------------|
| `(marketing)` | `/` | Full-width, no sidebar, marketing header |
| `(learn)` | `/fundamentals`, `/cpu`, etc. | Sidebar nav, progress indicator, breadcrumbs |
| `(explore)` | `/graph`, `/companies` | Full-bleed viz canvas, collapsible detail panel |

The `(explore)` group is separated from `(learn)` because graph exploration is a distinct interaction mode — full viewport, minimal chrome.

---

### 1.4 Backend Architecture

CPU Viz uses a **colocated backend** — Next.js API routes and Server Components share the same service layer (`src/lib/`). There is no separate API server.

#### Service Layer Responsibilities

| Module | Path | Responsibility |
|--------|------|----------------|
| `content` | `lib/content/` | Load modules, tracks, lessons, blocks; resolve cross-references |
| `graph` | `lib/graph/` | Assemble knowledge graph payloads; path queries; filters |
| `visualizations` | `lib/visualizations/` | Transform domain data → viz config (React Flow / D3 format) |
| `companies` | `lib/companies/` | Company profiles, dependency trees |
| `progress` | `lib/progress/` | Anonymous + authenticated progress (Phase 2+) |
| `prisma` | `lib/prisma/` | Singleton client, query helpers |

#### API Surface (REST, JSON)

| Endpoint | Method | Purpose | Phase |
|----------|--------|---------|-------|
| `/api/content/modules` | GET | Published modules with track summaries | 1 |
| `/api/content/lessons/[slug]` | GET | Lesson + ordered blocks | 1 |
| `/api/graph/supply-chain` | GET | Filtered supply chain subgraph | 1 |
| `/api/graph/concepts` | GET | Concept prerequisite graph | 2 |
| `/api/graph/path` | GET | Shortest path between two nodes | 2 |
| `/api/companies` | GET | Paginated company list with filters | 1 |
| `/api/companies/[slug]` | GET | Company detail + relationships | 1 |
| `/api/visualizations/[slug]` | GET | Viz config by slug | 1 |
| `/api/progress` | POST | Upsert lesson progress | 2 |
| `/api/search` | GET | Full-text search across content + entities | 2 |

**Validation:** Zod schemas at API boundary. Shared types between API and service layer.

**Caching:** `Cache-Control: s-maxage=60, stale-while-revalidate=300` on read endpoints. RSC pages use `revalidate` export for ISR.

**Auth (Phase 3):** NextAuth.js v5 with email/OAuth. Progress migrates from anonymous session ID to user ID.

---

### 1.5 Data Flow

#### Flow A — Lesson Page (read-heavy, server-rendered)

```
User requests /cpu/pipeline
        │
        ▼
page.tsx (Server Component)
        │
        ├─► lib/content/getLesson("cpu", "pipeline")
        │         │
        │         ▼
        │   Prisma: Lesson + ContentBlocks (ordered)
        │         │
        │         ▼
        │   Resolve embedded viz references (vizSlug → config)
        │
        ▼
Render LessonPage
        │
        ├─► Server: TextBlock, HeadingBlock, CalloutBlock
        │
        └─► Client island: VisualizationBlock
                  │
                  └─► PipelineDiagram (config passed as prop)
```

No client-side data fetching on initial lesson load. Viz config is embedded in the RSC payload.

#### Flow B — Supply Chain Graph (interactive, filter-driven)

```
User requests /graph?category=FOUNDRY&focus=tsmc
        │
        ▼
page.tsx (Server Component) — renders shell + initial graph
        │
        ├─► lib/graph/getSupplyChainSubgraph({ category, depth: 2 })
        │         │
        │         ▼
        │   Prisma: Companies + GraphEdges (filtered)
        │         │
        │         ▼
        │   lib/visualizations/toReactFlow(graph)
        │
        ▼
SupplyChainGraph (Client Component)
        │
        ├─► User clicks node → update URL ?focus=asml
        ├─► User changes filter → update URL ?category=EQUIPMENT
        │
        └─► Optional: client fetch /api/graph/supply-chain?... for heavy filters
            (only when filter change exceeds SSR payload)
```

URL is the source of truth for graph view state — shareable, back-button friendly.

#### Flow C — Content Authoring (Phase 3)

```
Admin UI → POST /api/admin/content → Prisma write → revalidatePath()
```

Deferred. Phase 1 uses seed scripts.

---

### 1.6 State Management Strategy

**Guiding rule:** Use the simplest mechanism that satisfies the requirement. No global state library in MVP.

| State type | Mechanism | Examples |
|------------|-----------|----------|
| **Server data** | RSC props, ISR cache | Lesson content, company profiles |
| **URL state** | `searchParams` (Next.js) | Graph filters, selected node, pipeline step, active lesson section |
| **Ephemeral UI** | `useState` | Panel open/closed, hover tooltips, drag positions |
| **Cross-component (local)** | React Context (scoped) | Learn layout sidebar collapse; viz detail panel |
| **Persistent user state** | `localStorage` + API sync | Anonymous lesson progress (Phase 1–2) |
| **Authenticated state** | DB via API | Progress, bookmarks (Phase 3) |

#### What we explicitly avoid

- **Redux / Zustand** — unnecessary; URL + RSC covers 90% of needs
- **React Flow internal state as source of truth** — graph data lives in props derived from URL + server data
- **Duplicating server data in client stores** — fetch once via RSC, pass down

#### URL State Schema (graph pages)

```
/graph?category=FOUNDRY,EQUIPMENT&focus=tsmc&depth=2&layout=force
```

| Param | Type | Purpose |
|-------|------|---------|
| `category` | comma-separated enum | Filter node types |
| `focus` | slug | Center/highlight node |
| `depth` | 1–3 | Hops from focus node |
| `layout` | `hierarchical` \| `force` | Layout algorithm |

---

### 1.7 Visualization Architecture

See [§5 Visualization Framework Design](#5-visualization-framework-design) for full detail. Summary:

- **VizRegistry** — maps `VisualizationType` + slug → lazy-loaded component
- **VizContainer** — shared wrapper: loading skeleton, error boundary, resize observer, aria-live region
- **Config contract** — all viz components accept `{ config: VizConfig; onInteraction?: Callback }`
- **Two renderers** — `ReactFlowRenderer`, `D3Renderer` — selected by config type
- **Composite viz** — a lesson block can reference multiple viz configs (e.g., CPU vs GPU comparison)

---

### 1.8 Content Management Strategy

#### Phase 1 — Seed-driven (MVP)

| Content type | Storage | Authoring |
|--------------|---------|-----------|
| Lessons | PostgreSQL (`ContentBlock.data` JSON) | TypeScript seed files in `prisma/seed/` |
| Companies | PostgreSQL typed tables | Seed scripts |
| Graph edges | PostgreSQL `GraphEdge` table | Seed scripts |
| Viz configs | PostgreSQL `Visualization.config` JSON | Seed scripts |
| Static diagrams | `public/assets/diagrams/` | SVG files committed to repo |
| Glossary terms | PostgreSQL `Concept` table | Seed scripts |

**Rationale:** Seed scripts are version-controlled, reviewable in PRs, and require no admin UI investment. Sufficient for <100 lessons and <200 graph nodes.

#### Phase 2 — Structured authoring

- Markdown files in `content/` directory (optional Git-based workflow) synced to DB via import script
- Glossary and concept links validated at import time

#### Phase 3 — Admin CMS

- Protected `/admin` routes
- WYSIWYG block editor for lessons
- Graph edge editor with visual confirmation
- Content preview before publish
- `published` boolean + `publishedAt` timestamp on all content entities

#### Content Versioning (deferred to Phase 4)

- Snapshot table or `version` column — not needed until multiple editors collaborate

---

## 2. Folder Structure

### 2.1 Complete Directory Tree

```
cpu_viz/
├── .cursor/
│   └── rules/                          # Cursor AI project rules
│       └── cpu-viz.mdc
│
├── content/                            # [Phase 2] Git-based markdown source (optional)
│   ├── lessons/
│   └── glossary/
│
├── docs/
│   ├── api/                            # OpenAPI / endpoint documentation
│   ├── content/                        # Content authoring guides
│   ├── graph/                          # Knowledge graph modeling notes
│   └── visualizations/                 # Per-viz design specifications
│
├── prisma/
│   ├── schema.prisma                   # Database schema (source of truth)
│   ├── migrations/                     # Versioned SQL migrations
│   └── seed/
│       ├── index.ts                    # Seed orchestrator
│       ├── modules.ts                  # Learning modules + tracks
│       ├── lessons/                    # Lesson content per module
│       │   ├── fundamentals.ts
│       │   ├── cpu.ts
│       │   └── ...
│       ├── concepts.ts                 # Concept graph + glossary
│       ├── companies.ts                # Company entities
│       ├── graph-edges.ts              # Supply chain + concept edges
│       └── visualizations.ts           # Viz config seed data
│
├── public/
│   ├── assets/
│   │   ├── diagrams/                   # Static SVG/PNG (transistor, wafer, etc.)
│   │   └── icons/                      # Category and module icons
│   └── data/                           # Dev fallback JSON (offline development)
│
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   │   ├── layout.tsx              # Marketing shell (header, footer)
│   │   │   └── page.tsx                # Landing page (/)
│   │   │
│   │   ├── (learn)/
│   │   │   ├── layout.tsx              # Learn shell (sidebar, progress bar)
│   │   │   ├── fundamentals/
│   │   │   │   ├── page.tsx            # Module overview
│   │   │   │   └── [lessonSlug]/
│   │   │   │       └── page.tsx
│   │   │   ├── cpu/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── pipeline/
│   │   │   │   │   └── page.tsx        # Dedicated pipeline explorer
│   │   │   │   └── [lessonSlug]/
│   │   │   │       └── page.tsx
│   │   │   ├── gpu/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [lessonSlug]/page.tsx
│   │   │   ├── memory/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [lessonSlug]/page.tsx
│   │   │   ├── hbm-ai/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [lessonSlug]/page.tsx
│   │   │   └── manufacturing/
│   │   │       ├── page.tsx
│   │   │       └── [lessonSlug]/page.tsx
│   │   │
│   │   ├── (explore)/
│   │   │   ├── layout.tsx              # Full-bleed explore shell
│   │   │   ├── graph/
│   │   │   │   └── page.tsx            # Supply chain knowledge graph
│   │   │   ├── concepts/
│   │   │   │   └── page.tsx            # [Phase 2] Concept map
│   │   │   └── companies/
│   │   │       ├── page.tsx            # Company directory
│   │   │       └── [slug]/
│   │   │           └── page.tsx        # Company detail
│   │   │
│   │   ├── api/
│   │   │   ├── content/
│   │   │   │   ├── modules/route.ts
│   │   │   │   └── lessons/[slug]/route.ts
│   │   │   ├── graph/
│   │   │   │   ├── supply-chain/route.ts
│   │   │   │   ├── concepts/route.ts   # [Phase 2]
│   │   │   │   └── path/route.ts       # [Phase 2]
│   │   │   ├── companies/
│   │   │   │   ├── route.ts
│   │   │   │   └── [slug]/route.ts
│   │   │   ├── visualizations/[slug]/route.ts
│   │   │   ├── progress/route.ts       # [Phase 2]
│   │   │   └── search/route.ts         # [Phase 2]
│   │   │
│   │   ├── layout.tsx                  # Root layout (fonts, theme provider)
│   │   ├── globals.css                 # Design tokens, base styles
│   │   ├── not-found.tsx
│   │   └── error.tsx
│   │
│   ├── components/
│   │   ├── ui/                         # Design system primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── panel.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── site-header.tsx
│   │   │   ├── site-footer.tsx
│   │   │   ├── learn-sidebar.tsx
│   │   │   ├── learn-progress.tsx
│   │   │   └── breadcrumbs.tsx
│   │   ├── learn/
│   │   │   ├── lesson-renderer.tsx     # Orchestrates ContentBlock rendering
│   │   │   ├── content-blocks/         # One component per block type
│   │   │   │   ├── text-block.tsx
│   │   │   │   ├── heading-block.tsx
│   │   │   │   ├── callout-block.tsx
│   │   │   │   ├── diagram-block.tsx
│   │   │   │   └── visualization-block.tsx
│   │   │   ├── lesson-nav.tsx          # Prev/next lesson links
│   │   │   ├── module-card.tsx
│   │   │   ├── concept-link.tsx        # Inline glossary link
│   │   │   └── glossary-panel.tsx
│   │   ├── graph/
│   │   │   ├── graph-toolbar.tsx       # Filters, layout toggle, search
│   │   │   ├── graph-detail-panel.tsx  # Node detail side panel
│   │   │   └── graph-legend.tsx
│   │   └── visualizations/
│   │       ├── viz-registry.ts         # Slug → component map
│   │       ├── viz-container.tsx       # Shared wrapper
│   │       ├── react-flow/
│   │       │   ├── supply-chain-graph.tsx
│   │       │   ├── pipeline-diagram.tsx
│   │       │   ├── manufacturing-flow.tsx
│   │       │   ├── concept-map.tsx     # [Phase 2]
│   │       │   ├── nodes/              # Custom node components
│   │       │   ├── edges/              # Custom edge components
│   │       │   └── hooks/
│   │       │       ├── use-graph-filters.ts
│   │       │       └── use-fit-view.ts
│   │       ├── d3/
│   │       │   ├── memory-hierarchy.tsx
│   │       │   ├── hbm-stack.tsx
│   │       │   ├── company-metrics.tsx
│   │       │   └── hooks/
│   │       │       ├── use-d3.ts
│   │       │       └── use-resize-observer.ts
│   │       └── shared/
│   │           ├── viz-legend.tsx
│   │           ├── viz-controls.tsx
│   │           └── step-controller.tsx # Pipeline step-through UI
│   │
│   ├── lib/
│   │   ├── prisma/
│   │   │   └── client.ts               # Singleton Prisma client
│   │   ├── content/
│   │   │   ├── get-module.ts
│   │   │   ├── get-lesson.ts
│   │   │   └── resolve-blocks.ts       # Resolve viz refs, concept links
│   │   ├── graph/
│   │   │   ├── get-subgraph.ts         # Filtered graph queries
│   │   │   ├── find-path.ts            # Shortest path [Phase 2]
│   │   │   └── node-resolver.ts        # Polymorphic node → display data
│   │   ├── visualizations/
│   │   │   ├── to-react-flow.ts        # Domain graph → React Flow format
│   │   │   ├── to-d3-hierarchy.ts      # Domain data → D3 hierarchy
│   │   │   ├── layout-algorithms.ts    # Dagre, force, manual
│   │   │   └── color-scales.ts         # Category → color mapping
│   │   ├── companies/
│   │   │   └── get-company.ts
│   │   ├── progress/
│   │   │   └── progress-store.ts       # localStorage + API sync
│   │   ├── constants/
│   │   │   ├── modules.ts              # Module metadata (order, icons)
│   │   │   ├── categories.ts           # Company/graph categories
│   │   │   └── learning-path.ts        # Canonical progression order
│   │   └── utils/
│   │       ├── cn.ts
│   │       └── format.ts
│   │
│   ├── hooks/
│   │   ├── use-lesson-progress.ts
│   │   ├── use-graph-url-state.ts      # Sync graph state ↔ URL
│   │   └── use-media-query.ts
│   │
│   ├── types/
│   │   ├── content.ts
│   │   ├── graph.ts                    # Node types, edge types, graph payloads
│   │   ├── company.ts
│   │   ├── visualization.ts
│   │   └── api.ts
│   │
│   └── config/
│       ├── site.ts                     # Site name, description, OG defaults
│       └── navigation.ts              # Sidebar + header nav structure
│
├── tests/
│   ├── unit/                           # Vitest: lib/, graph transforms
│   ├── integration/                    # API routes + Prisma test DB
│   └── e2e/                            # Playwright: critical user journeys
│
├── PRD.md
├── ARCHITECTURE.md                     # This document
├── PROJECT_STATUS.md
├── cursor-rules.md
├── .env.example
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 2.2 Major Folder Explanations

| Folder | Purpose |
|--------|---------|
| `content/` | Optional Git-based markdown source for Phase 2 authoring workflow. Not used in MVP. |
| `docs/` | Human-readable specs that exceed inline code documentation — API contracts, viz interaction specs, graph modeling decisions. |
| `prisma/seed/` | **Primary content authoring surface for MVP.** Modular seed files per domain, orchestrated by `index.ts`. |
| `public/assets/` | Static media that doesn't belong in the database — SVG diagrams, icons. Referenced by URL in content blocks. |
| `src/app/(marketing)/` | Public-facing pages with no learning chrome. |
| `src/app/(learn)/` | Lesson experience with sidebar navigation and progress tracking. |
| `src/app/(explore)/` | Full-bleed interactive exploration (graph, companies). Distinct layout from learning mode. |
| `src/components/ui/` | Stateless design primitives. No business logic. |
| `src/components/learn/` | Lesson rendering pipeline. Knows about content block types. |
| `src/components/graph/` | UI chrome for graph pages (toolbar, detail panel) — not the viz itself. |
| `src/components/visualizations/` | Pure visualization renderers. Accept config props, emit interaction events. No data fetching. |
| `src/lib/graph/` | **Core graph logic.** Queries, path finding, subgraph filtering. Single source of truth for graph operations. |
| `src/lib/visualizations/` | **Transform layer.** Converts domain data to renderer-specific formats. Keeps viz components dumb. |
| `src/types/graph.ts` | Shared type definitions for the knowledge graph — used by lib, API, and components. |

---

## 3. Database Design

### 3.1 Design Approach

PostgreSQL stores all domain data relationally. The knowledge graph is **assembled at read time** from typed entity tables and a unified `GraphEdge` table — not stored as a monolithic JSON blob.

**Why not a graph database?** At MVP scale (50–200 nodes, 200–1000 edges), recursive CTEs in PostgreSQL handle path queries efficiently. Adding Neo4j introduces operational complexity with no measurable benefit until ~10K+ edges with heavy traversals.

### 3.2 Entity Relationship Overview

```
┌─────────────── LEARNING DOMAIN ───────────────┐
│                                               │
│  Module ──< Track ──< Lesson ──< ContentBlock │
│     │                                         │
│     └──< Concept (via moduleSlug)             │
│              │                                │
│              └──< ConceptPrerequisite         │
│                                               │
└───────────────────────────────────────────────┘

┌─────────────── KNOWLEDGE GRAPH DOMAIN ────────┐
│                                               │
│  Company ──< Facility                         │
│     │                                         │
│     └──< GraphEdge >──┐                       │
│                       │                       │
│  Technology ──────────┤  (polymorphic)        │
│  Product ─────────────┤                       │
│  Process ─────────────┤                       │
│  Concept ─────────────┘                       │
│                                               │
└───────────────────────────────────────────────┘

┌─────────────── VISUALIZATION DOMAIN ──────────┐
│                                               │
│  Visualization (config JSON, linked to module)│
│                                               │
└───────────────────────────────────────────────┘

┌─────────────── USER DOMAIN (Phase 2+) ────────┐
│                                               │
│  User ──< LessonProgress                      │
│       ──< Bookmark                          │
│                                               │
└───────────────────────────────────────────────┘
```

### 3.3 Prisma Models

#### Learning Content

```
Module
  id            String    @id @default(cuid())
  slug          String    @unique
  title         String
  description   String
  icon          String?
  order         Int       @default(0)
  published     Boolean   @default(false)
  tracks        Track[]
  concepts      Concept[]

Track
  id            String    @id @default(cuid())
  slug          String
  title         String
  description   String?
  order         Int       @default(0)
  moduleId      String    → Module
  lessons       Lesson[]
  @@unique([moduleId, slug])

Lesson
  id            String    @id @default(cuid())
  slug          String
  title         String
  summary       String?
  order         Int       @default(0)
  estimatedMin  Int?      // Reading time estimate
  published     Boolean   @default(false)
  trackId       String    → Track
  blocks        ContentBlock[]
  concepts      Concept[] // Concepts introduced in this lesson
  @@unique([trackId, slug])

ContentBlock
  id            String    @id @default(cuid())
  type          ContentBlockType  // TEXT | HEADING | DIAGRAM | VISUALIZATION | CALLOUT | GLOSSARY_TERM
  order         Int       @default(0)
  data          Json      // Type-specific payload
  lessonId      String    → Lesson

Concept
  id            String    @id @default(cuid())
  slug          String    @unique
  term          String    // Display name: "MOSFET", "EUV Lithography"
  definition    String
  moduleId      String?   → Module  // Primary module association
  lessons       Lesson[]  // Many-to-many: concepts introduced in lessons
  prerequisites ConceptPrerequisite[] @relation("PrereqTarget")
  dependents    ConceptPrerequisite[] @relation("PrereqSource")

ConceptPrerequisite
  id            String    @id @default(cuid())
  sourceId      String    → Concept  // Must know this first
  targetId      String    → Concept  // Before learning this
  @@unique([sourceId, targetId])
```

#### Knowledge Graph Entities

```
Company
  id            String    @id @default(cuid())
  slug          String    @unique
  name          String
  ticker        String?
  category      CompanyCategory  // FABLESS | IDM | FOUNDRY | EDA | EQUIPMENT | MATERIALS | OSAT | IP | CLOUD
  description   String?
  headquarters  String?
  founded       Int?
  website       String?
  logoUrl       String?
  metadata      Json?     // { revenue, employees, marketCap, segments }
  facilities    Facility[]
  createdAt     DateTime
  updatedAt     DateTime

Facility
  id            String    @id @default(cuid())
  name          String
  type          FacilityType  // FAB | OSAT | R_AND_D | HQ | DATA_CENTER
  location      String?   // "Hsinchu, Taiwan"
  processNode   String?   // "3nm", "5nm" — for fabs
  companyId     String    → Company

Technology
  id            String    @id @default(cuid())
  slug          String    @unique
  name          String    // "EUV Lithography", "FinFET", "Chiplet Packaging"
  category      TechCategory  // PROCESS | PACKAGING | ARCHITECTURE | MATERIAL | TOOL
  description   String?
  nodeNm        Int?      // Process node in nm, if applicable
  metadata      Json?

Product
  id            String    @id @default(cuid())
  slug          String    @unique
  name          String    // "H100 GPU", "Ryzen 9", "A16 Bionic"
  category      ProductCategory  // CPU | GPU | AI_ACCELERATOR | MEMORY | FPGA | MOBILE_SOC | EDA_TOOL | EQUIPMENT
  description   String?
  companyId     String?   → Company  // Primary manufacturer/designer
  metadata      Json?     // { processNode, tdp, memoryBandwidth, releaseYear }

Process
  id            String    @id @default(cuid())
  slug          String    @unique
  name          String    // "Photolithography", "CMP", "Wire Bonding"
  stage         ProcessStage  // DESIGN | FABRICATION | ASSEMBLY | TEST
  description   String?
  order         Int       @default(0)  // Order within manufacturing flow
```

#### Unified Graph Edges

```
GraphEdge
  id            String    @id @default(cuid())
  type          EdgeType
  sourceType    NodeType  // COMPANY | TECHNOLOGY | PRODUCT | PROCESS | CONCEPT
  sourceId      String    // Polymorphic FK (no DB constraint — enforced in app layer)
  targetType    NodeType
  targetId      String
  label         String?   // Display label on edge
  strength      Int       @default(3)  // 1–5 visual weight
  metadata      Json?     // { since: 2020, critical: true, revenue_Pct: 15 }
  createdAt     DateTime
  updatedAt     DateTime
  @@unique([sourceType, sourceId, targetType, targetId, type])
  @@index([sourceType, sourceId])
  @@index([targetType, targetId])
  @@index([type])
```

#### Visualizations

```
Visualization
  id            String    @id @default(cuid())
  slug          String    @unique
  title         String
  renderer      VizRenderer  // REACT_FLOW | D3 | COMPOSITE
  config        Json      // Renderer-specific configuration
  moduleSlug    String?   // Optional association
```

#### User Domain (Phase 2+)

```
User
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  progress      LessonProgress[]
  bookmarks     Bookmark[]

LessonProgress
  id            String    @id @default(cuid())
  completed     Boolean   @default(false)
  lastBlock     Int       @default(0)
  userId        String    → User
  lessonId      String
  completedAt   DateTime?
  @@unique([userId, lessonId])

Bookmark
  id            String    @id @default(cuid())
  userId        String    → User
  entityType    NodeType
  entityId      String
  @@unique([userId, entityType, entityId])
```

### 3.4 Enum Definitions

```
ContentBlockType:  TEXT | HEADING | DIAGRAM | VISUALIZATION | CALLOUT | GLOSSARY_TERM | QUIZ

CompanyCategory:   FABLESS | IDM | FOUNDRY | EDA | EQUIPMENT | MATERIALS | OSAT | IP | CLOUD | OTHER

FacilityType:      FAB | OSAT | R_AND_D | HQ | DATA_CENTER

TechCategory:      PROCESS | PACKAGING | ARCHITECTURE | MATERIAL | TOOL

ProductCategory:   CPU | GPU | AI_ACCELERATOR | MEMORY | FPGA | MOBILE_SOC | EDA_TOOL | EQUIPMENT

ProcessStage:      DESIGN | FABRICATION | ASSEMBLY | TEST

NodeType:          COMPANY | TECHNOLOGY | PRODUCT | PROCESS | CONCEPT

EdgeType:          SUPPLIES | CUSTOMER_OF | PARTNERS_WITH | COMPETES_WITH
                   USES_TECHNOLOGY | MANUFACTURES | ENABLES | PART_OF
                   PREREQUISITE | RELATED

VizRenderer:       REACT_FLOW | D3 | COMPOSITE
```

### 3.5 Indexing Strategy

| Table | Index | Purpose |
|-------|-------|---------|
| `Company` | `slug` (unique) | Route lookup by slug |
| `Company` | `category` | Filter graph by company type |
| `Company` | `ticker` | Future financial data join |
| `GraphEdge` | `(sourceType, sourceId)` | Outbound edge traversal |
| `GraphEdge` | `(targetType, targetId)` | Inbound edge traversal |
| `GraphEdge` | `type` | Filter by relationship type |
| `GraphEdge` | `(sourceType, sourceId, targetType, targetId, type)` (unique) | Prevent duplicate edges |
| `Lesson` | `(trackId, slug)` (unique) | Route lookup |
| `Lesson` | `published` | Filter published content |
| `Concept` | `slug` (unique) | Glossary lookup |
| `ConceptPrerequisite` | `(sourceId, targetId)` (unique) | Prerequisite queries |
| `ContentBlock` | `(lessonId, order)` | Ordered block retrieval |
| `Product` | `companyId` | Company's products |
| `Facility` | `companyId` | Company's facilities |
| `Visualization` | `slug` (unique) | Viz config lookup |

**Full-text search (Phase 2):** Add `tsvector` generated column on `Company.name + description`, `Concept.term + definition`, `Lesson.title + summary`. GIN index for `@@` queries. Alternatively, defer to Meilisearch if search complexity grows.

**Recursive queries:** Path finding uses PostgreSQL `WITH RECURSIVE` CTEs on `GraphEdge`. At MVP scale (<1000 edges), this performs well without materialized views. If query latency exceeds 200ms, add a `GraphEdgePath` materialized view (Phase 3).

---

## 4. Semiconductor Knowledge Graph Design

### 4.1 Purpose

The knowledge graph is the **connective tissue** of CPU Viz. It links:

- **Educational concepts** (transistor, pipeline, HBM) to each other via prerequisites
- **Industry entities** (companies, products, technologies) via supply chain relationships
- **Cross-domain bridges** — e.g., Concept "EUV Lithography" → Technology "EUV" → Company "ASML"

This enables: "Show me everything connected to TSMC" and "What do I need to understand before learning about HBM?"

### 4.2 Node Types

| NodeType | Entity table | Example instances | Primary use |
|----------|-------------|-------------------|-------------|
| `CONCEPT` | `Concept` | MOSFET, Moore's Law, Branch Prediction | Learning progression, glossary |
| `COMPANY` | `Company` | TSMC, NVIDIA, ASML | Supply chain graph |
| `TECHNOLOGY` | `Technology` | EUV Lithography, FinFET, CoWoS | Bridge between concepts and companies |
| `PRODUCT` | `Product` | H100, Apple A17, Ryzen 9 7950X | Concrete examples in lessons |
| `PROCESS` | `Process` | Photolithography, Die Attach, Wire Bonding | Manufacturing flow |

Each node type has a **display adapter** in `lib/graph/node-resolver.ts` that normalizes any node into a common shape:

```
GraphNodeDisplay {
  id, type, slug, label, subtitle, category, color, icon, href, metadata
}
```

### 4.3 Edge Types

| EdgeType | Source → Target | Semantics | Example |
|----------|----------------|-----------|---------|
| `SUPPLIES` | Company → Company | A provides goods/services to B | ASML → SUPPLIES → TSMC |
| `CUSTOMER_OF` | Company → Company | A is a customer of B (inverse of SUPPLIES) | Apple → CUSTOMER_OF → TSMC |
| `PARTNERS_WITH` | Company → Company | Strategic partnership | AMD → PARTNERS_WITH → TSMC |
| `COMPETES_WITH` | Company → Company | Market competition | Intel → COMPETES_WITH → AMD |
| `USES_TECHNOLOGY` | Company/Product → Technology | Entity uses this technology | TSMC → USES_TECHNOLOGY → EUV |
| `MANUFACTURES` | Company → Product | Company makes this product | TSMC → MANUFACTURES → Apple A17 |
| `ENABLES` | Technology → Technology | Tech A makes Tech B possible | FinFET → ENABLES → 3nm Process |
| `PART_OF` | Process → Process, Product → Product | Hierarchical composition | Lithography → PART_OF → Fabrication |
| `PREREQUISITE` | Concept → Concept | Must understand A before B | Transistor → PREREQUISITE → Logic Gate |
| `RELATED` | Any → Any | Soft association for cross-domain links | Concept "HBM" → RELATED → Product "H100" |

**Directionality:** All edges are directed. `SUPPLIES` and `CUSTOMER_OF` are inverses — store one, derive the other at query time to avoid duplication.

**Strength (1–5):** Controls visual edge weight and filtering. Strength 5 = critical dependency (e.g., TSMC has no alternative for Apple's leading-edge chips). Strength 1 = minor/indirect relationship.

### 4.4 Graph Views

The same underlying `GraphEdge` table powers multiple **views** — each is a filtered projection:

| View | Node filter | Edge filter | Renderer | Page |
|------|-------------|-------------|----------|------|
| **Supply Chain** | `COMPANY` only | `SUPPLIES`, `CUSTOMER_OF`, `PARTNERS_WITH` | React Flow | `/graph` |
| **Concept Map** | `CONCEPT` only | `PREREQUISITE`, `RELATED` | React Flow | `/concepts` |
| **Manufacturing Flow** | `PROCESS` only | `PART_OF` | React Flow (linear) | `/manufacturing` |
| **Technology Stack** | `TECHNOLOGY`, `PRODUCT` | `USES_TECHNOLOGY`, `ENABLES`, `MANUFACTURES` | React Flow | Lesson-embedded |
| **Full Knowledge Graph** | All types | All types | React Flow (with type filters) | `/graph?mode=full` (Phase 3) |

### 4.5 Query Patterns

#### Q1: Get subgraph around a company (1–2 hops)

```
Input:  { focusSlug: "tsmc", depth: 2, edgeTypes: ["SUPPLIES", "CUSTOMER_OF"] }
Output: { nodes: GraphNodeDisplay[], edges: GraphEdgeDisplay[] }

Strategy:
  1. Resolve focusSlug → Company.id
  2. Recursive CTE on GraphEdge WHERE sourceType='COMPANY' OR targetType='COMPANY'
     up to N hops
  3. Resolve all node IDs via node-resolver
  4. Transform to React Flow format
```

#### Q2: Shortest path between two entities

```
Input:  { fromSlug: "apple", toSlug: "asml", fromType: "COMPANY", toType: "COMPANY" }
Output: { path: GraphNodeDisplay[], edges: GraphEdgeDisplay[] }

Strategy:
  BFS via recursive CTE, constrained by edge type whitelist
  Limit depth to 6 hops (prevent runaway queries)
```

#### Q3: Concept prerequisites (learning path)

```
Input:  { targetSlug: "hbm" }
Output: { orderedConcepts: Concept[] }  // Topological sort of prerequisites

Strategy:
  1. Recursive CTE on ConceptPrerequisite (or GraphEdge with type=PREREQUISITE)
  2. Topological sort
  3. Return ordered list for "learning path" UI
```

#### Q4: Filtered company list with relationship counts

```
Input:  { category: "FOUNDRY", minConnections: 3 }
Output: { companies: Company[], connectionCounts: Record<id, number> }

Strategy:
  Standard Prisma query with _count on edges
```

#### Q5: Cross-domain bridge

```
Input:  { conceptSlug: "euv-lithography" }
Output: { concept, relatedTechnologies, relatedCompanies, relatedProducts }

Strategy:
  1. Find Concept by slug
  2. GraphEdge WHERE (sourceId=concept.id AND type IN ('RELATED','PREREQUISITE'))
     OR targetId=concept.id
  3. Group results by node type
```

### 4.6 Graph Data Maintenance

| Concern | MVP approach | Scale approach |
|---------|-------------|----------------|
| **Adding nodes** | Seed scripts | Admin CMS (Phase 3) |
| **Adding edges** | Seed scripts with validation | Admin edge editor with visual preview |
| **Data freshness** | Manual quarterly review | Automated alerts on company events (Phase 4) |
| **Duplicate detection** | Unique constraints on slug | Fuzzy matching in admin import (Phase 3) |
| **Stale relationships** | `updatedAt` timestamp | `validFrom`/`validUntil` on edges (Phase 3) |

---

## 5. Visualization Framework Design

### 5.1 Division of Responsibility

| Concern | React Flow | D3.js |
|---------|-----------|-------|
| **Node-edge graphs** | Primary | — |
| **Hierarchical layouts** | Via Dagre/ELK layout | Sunburst, treemap, pack |
| **Linear/pipeline flows** | Primary | — |
| **Data-driven charts** | — | Bar, line, area |
| **Custom shapes (HBM stack)** | — | SVG layer composition |
| **Animations** | Framer Motion on nodes | D3 transitions |
| **Interactivity** | Built-in pan/zoom/select | Manual event binding |

**Rule:** If it has discrete nodes connected by edges with a layout → React Flow. If it's a continuous data visualization or custom SVG composition → D3.

### 5.2 View → Renderer Mapping

| View | Renderer | Layout | Interaction |
|------|----------|--------|-------------|
| Supply chain graph | React Flow | Dagre (hierarchical) or force | Pan, zoom, click node → detail panel, category filter |
| CPU pipeline | React Flow | Manual (fixed positions) | Step-through stages, Framer Motion highlight |
| GPU architecture | React Flow | Manual | Click SM → detail, comparison overlay with CPU |
| Manufacturing flow | React Flow | Linear (left-to-right) | Scroll-synced stages, expand stage card |
| Concept map | React Flow | Dagre (top-down) | Click concept → glossary, show prerequisites |
| Memory hierarchy | D3 | Treemap or pyramid | Hover → latency/bandwidth, click → drill down |
| HBM stack | D3 | Layered SVG | Hover → explode layers, annotate bandwidth |
| Company metrics | D3 | Bar/line chart | Time range selector, hover tooltips |
| Bandwidth comparison | D3 | Grouped bar | Hover, toggle memory types |

### 5.3 Integration Architecture

```
┌─────────────────────────────────────────────────────┐
│                  VizContainer                        │
│  (resize observer, loading, error boundary, a11y)   │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │              VizRegistry                       │  │
│  │  slug → lazy-loaded component                 │  │
│  └──────────┬────────────────────┬──────────────┘  │
│             │                    │                   │
│  ┌──────────▼──────────┐  ┌─────▼───────────────┐  │
│  │  ReactFlowRenderer   │  │    D3Renderer       │  │
│  │                      │  │                     │  │
│  │  SupplyChainGraph    │  │  MemoryHierarchy    │  │
│  │  PipelineDiagram     │  │  HBMStack           │  │
│  │  ManufacturingFlow   │  │  CompanyMetrics     │  │
│  │  ConceptMap          │  │                     │  │
│  └──────────────────────┘  └─────────────────────┘  │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  Shared: VizLegend, VizControls, DetailPanel, │  │
│  │          StepController                       │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Data flow into visualizations:**

```
Database → lib/visualizations/to-react-flow.ts → VizConfig (JSON) → VizContainer → Renderer
```

Viz components never query the database. They receive a fully-formed config object.

### 5.4 Config Schema (conceptual)

**React Flow config:**
```
{
  renderer: "REACT_FLOW",
  nodes: [{ id, type, position, data: { label, category, color, ... } }],
  edges: [{ id, source, target, type, data: { label, strength } }],
  layout: "dagre" | "manual" | "force",
  layoutOptions: { rankdir: "TB", nodesep: 50 },
  interaction: { panOnScroll: true, fitViewOnLoad: true }
}
```

**D3 config:**
```
{
  renderer: "D3",
  chartType: "treemap" | "layered" | "bar" | "sunburst",
  data: { hierarchical tree or flat array },
  dimensions: { width: "100%", height: 400 },
  scales: { color: "category10", x: "linear" },
  interaction: { tooltip: true, clickToDrill: true }
}
```

### 5.5 Performance Considerations

#### Large Graph Strategies

| Technique | When | Implementation |
|-----------|------|----------------|
| **Subgraph loading** | >50 nodes on screen | Only render N-hop neighborhood of focus node; fetch more on expand |
| **Node clustering** | >100 nodes | Collapse category groups into super-nodes ("5 Equipment Companies"); expand on click |
| **Level of detail** | Zoom < 0.5 | Show dots instead of labeled nodes; show labels on zoom in |
| **Edge bundling** | Dense graphs | Defer to Phase 3; use edge strength filter in MVP |
| **Virtualization** | >200 nodes | React Flow's built-in viewport culling (only renders visible nodes) |
| **Pre-computed layout** | Any static graph | Run Dagre server-side in `to-react-flow.ts`; store positions in config |
| **Debounced filter** | Category toggle | 300ms debounce on filter changes before re-fetching/re-rendering |

#### Bundle Size

| Library | Approximate size | Loading strategy |
|---------|-----------------|------------------|
| React Flow | ~150KB gzipped | `dynamic(() => import(...), { ssr: false })` per route |
| D3 (full) | ~90KB gzipped | Import only needed modules (`d3-scale`, `d3-hierarchy`, `d3-selection`) |
| D3 (modular) | ~30KB gzipped | Tree-shake unused modules |
| Framer Motion | ~35KB gzipped | Import `motion` only where needed |

**Target:** No route loads more than one viz library. Supply chain page loads React Flow only. Memory lesson loads D3 only.

#### Rendering Performance

- Pre-compute layouts server-side — client receives positioned nodes, no client-side layout calculation on first render
- `requestAnimationFrame` for D3 transitions; no layout thrashing
- `ResizeObserver` debounced to 100ms for responsive D3 charts
- React Flow: `nodesDraggable: false` for read-only graphs (supply chain); enable only for exploration mode
- Memoize node components with `React.memo` — custom node types re-render only on data change

---

## 6. Educational Content Architecture

### 6.1 Content Hierarchy

```
Module                     — Top-level learning domain (8 modules)
  └── Track                — Thematic grouping within a module (1–3 per module)
       └── Lesson          — Atomic learning unit (5–15 min read)
            └── ContentBlock  — Renderable content unit
```

**Module** maps to a PRD learning domain (Fundamentals, CPU, GPU, etc.).
**Track** groups related lessons (e.g., CPU module → "Pipeline" track, "Memory Subsystem" track).
**Lesson** is the smallest navigable unit with a URL.
**ContentBlock** is the smallest renderable unit — a paragraph, a diagram, an interactive viz.

### 6.2 Content Block Types

| Type | Payload | Rendering |
|------|---------|-----------|
| `TEXT` | `{ markdown: string }` | Markdown → HTML (sanitized) |
| `HEADING` | `{ level: 1–3, text: string }` | `<h1>`–`<h3>` |
| `DIAGRAM` | `{ src: string, alt: string, caption?: string }` | Static image/SVG |
| `VISUALIZATION` | `{ vizSlug: string, props?: object }` | VizContainer → registry lookup |
| `CALLOUT` | `{ variant: "info"\|"warning"\|"tip", markdown: string }` | Styled callout box |
| `GLOSSARY_TERM` | `{ conceptSlug: string }` | Inline definition popover |
| `QUIZ` | `{ questions: [...] }` | Phase 3 |

### 6.3 Concept Graph — Learning Progression

The canonical learning path connects concepts across modules:

```
Silicon (crystal structure, wafer)
  │
  ▼
Transistor (MOSFET, switching behavior)
  │
  ▼
Logic Gate (AND, OR, NOT → combinational logic)
  │
  ├──────────────────────┐
  ▼                      ▼
Integrated Circuit    Moore's Law
  │                      │
  ▼                      │
CPU Architecture ◄───────┘
  │  (pipeline, caches, cores, ISA)
  │
  ├──────────────────────┐
  ▼                      ▼
Memory Hierarchy      GPU Architecture
  (SRAM, DRAM,          (SIMT, SMs, warps,
   cache levels)         thread hierarchy)
  │                      │
  └──────────┬───────────┘
             ▼
      Advanced Packaging
        (chiplet, 2.5D, 3D)
             │
             ▼
      HBM (High Bandwidth Memory)
             │
             ▼
      AI Infrastructure
        (GPU clusters, NVLink,
         training vs inference)
             │
             ▼
      Semiconductor Manufacturing
        (fab flow, lithography, yield)
             │
             ▼
      Supply Chain
        (fabless, foundry, IDM,
         equipment, materials)
             │
             ▼
      Industry Landscape
        (company dependencies,
         geographic risk, market dynamics)
```

### 6.4 Cross-Module Linking

Lessons reference concepts and entities across modules via inline links:

- **Concept links** — `[[mosfet]]` in markdown resolves to glossary popover
- **Company links** — `[[tsmc]]` resolves to `/companies/tsmc`
- **Product links** — `[[h100]]` resolves to product detail (Phase 2)
- **Lesson links** — `[[cpu/pipeline]]` resolves to cross-module lesson link

Resolution happens in `lib/content/resolve-blocks.ts` at render time.

### 6.5 Module Sequencing

| Order | Module | Concepts introduced | Unlocks |
|-------|--------|-------------------|---------|
| 1 | Fundamentals | Silicon, Transistor, Logic Gate, Moore's Law | CPU, Manufacturing |
| 2 | CPU Architecture | Pipeline, Cache, ISA, Branch Prediction | GPU, Memory |
| 3 | Memory Systems | SRAM, DRAM, Hierarchy, Bandwidth | HBM/AI |
| 4 | GPU Architecture | SIMT, SM, Warp, Thread | HBM/AI |
| 5 | Manufacturing | Fab Flow, Lithography, Yield | Supply Chain |
| 6 | HBM & AI Infrastructure | HBM, Packaging, AI Cluster | Supply Chain |
| 7 | Supply Chain | Fabless, Foundry, Dependencies | Company Profiles |
| 8 | Company Profiles | (applied knowledge — no new concepts) | — |

Modules 1–4 are **technical foundations**. Modules 5–6 connect technology to physical production. Modules 7–8 connect everything to the industry.

**MVP ships modules 1, 2, and 7** (Fundamentals, CPU, Supply Chain) — see [§8 MVP Scope](#8-mvp-scope).

### 6.6 Glossary System

Every `Concept` is a glossary entry. Inline `GLOSSARY_TERM` blocks and `[[concept-slug]]` markdown links render as interactive popovers showing:

- Term name
- Definition (1–2 sentences)
- "Learn more" link to the lesson that introduces the concept
- Related concepts (from `GraphEdge` with type `RELATED`)

---

## 7. Page Architecture

### 7.1 Complete Page Inventory

#### Marketing

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Landing | Hero, module grid, value proposition, CTA to start learning |

#### Learning — Module Overviews

| Route | Page | Purpose |
|-------|------|---------|
| `/fundamentals` | Fundamentals Overview | Track list, first lesson CTA, module description |
| `/cpu` | CPU Architecture Overview | Track list, pipeline explorer link |
| `/gpu` | GPU Architecture Overview | Track list, comparison with CPU |
| `/memory` | Memory Systems Overview | Track list, hierarchy viz preview |
| `/hbm-ai` | HBM & AI Overview | Track list, infrastructure diagram preview |
| `/manufacturing` | Manufacturing Overview | Track list, fab flow preview |

#### Learning — Lessons

| Route | Page | Purpose |
|-------|------|---------|
| `/fundamentals/[lessonSlug]` | Fundamentals Lesson | Lesson content with blocks and viz |
| `/cpu/[lessonSlug]` | CPU Lesson | Lesson content |
| `/cpu/pipeline` | CPU Pipeline Explorer | Dedicated full-page pipeline visualization with step-through |
| `/gpu/[lessonSlug]` | GPU Lesson | Lesson content |
| `/memory/[lessonSlug]` | Memory Lesson | Lesson content |
| `/hbm-ai/[lessonSlug]` | HBM/AI Lesson | Lesson content |
| `/manufacturing/[lessonSlug]` | Manufacturing Lesson | Lesson content |

#### Exploration

| Route | Page | Purpose |
|-------|------|---------|
| `/graph` | Supply Chain Graph | Full-bleed interactive company dependency graph |
| `/concepts` | Concept Map | [Phase 2] Interactive prerequisite graph |
| `/companies` | Company Directory | Searchable/filterable company list |
| `/companies/[slug]` | Company Detail | Profile, dependencies, products, facilities |

#### Utility

| Route | Page | Purpose |
|-------|------|---------|
| `/glossary` | Glossary Index | [Phase 2] Alphabetical concept list with search |
| `/search` | Search Results | [Phase 2] Cross-content search results |
| `/admin/*` | Admin CMS | [Phase 3] Content management |

### 7.2 User Journeys

#### Journey A — Student: "I want to understand how CPUs work"

```
Landing (/)
  → Click "CPU Architecture" module card
  → CPU Overview (/cpu)
  → Click "Pipeline Deep Dive" track
  → Lesson: "The Fetch Stage" (/cpu/fetch-stage)
  → Read content, interact with pipeline viz
  → Click "Next: Decode Stage"
  → ... complete track ...
  → CPU Pipeline Explorer (/cpu/pipeline) for full interactive experience
  → Sidebar suggests "Memory Systems" module next
```

#### Journey B — Investor: "Who does NVIDIA depend on?"

```
Landing (/)
  → Click "Explore Supply Chain" CTA
  → Supply Chain Graph (/graph)
  → Search/filter for "NVIDIA"
  → Click NVIDIA node → detail panel shows dependencies
  → Click "TSMC" supplier node → re-focus graph on TSMC
  → Click "View Company Profile" → /companies/tsmc
  → See full dependency tree, facilities, products
```

#### Journey C — Career Switcher: "Teach me from scratch"

```
Landing (/)
  → Click "Start Learning" CTA
  → Fundamentals Overview (/fundamentals)
  → Lesson 1: "What is Silicon?" (/fundamentals/what-is-silicon)
  → Complete lessons sequentially (progress tracked)
  → System suggests next module based on learning path
  → ... progresses through Fundamentals → CPU → Memory → GPU → ...
  → Concept Map (/concepts) shows growing knowledge tree
```

#### Journey D — Practicing Engineer: "Refresh on HBM"

```
Landing (/) or direct link
  → HBM & AI Overview (/hbm-ai)
  → Lesson: "HBM Architecture" (/hbm-ai/hbm-architecture)
  → Interact with HBM stack visualization
  → Glossary link to "CoWoS Packaging" → popover
  → "Learn more" → Manufacturing lesson on advanced packaging
  → Cross-link to Supply Chain: SK Hynix, Samsung
```

---

## 8. MVP Scope

### 8.1 Build First (Phase 1 — MVP)

| # | Feature | Rationale |
|---|---------|-----------|
| 1 | **Project scaffold** — Next.js, Tailwind, Prisma, PostgreSQL | Foundation for everything |
| 2 | **Design system** — tokens, Button, Card, Badge, Panel | Consistent UI across all features |
| 3 | **Landing page** — module grid, hero, CTA | Entry point; validates layout system |
| 4 | **Learn layout** — sidebar, breadcrumbs, progress bar | Shell for all lesson pages |
| 5 | **Fundamentals module** — 3 lessons with content blocks | Proves content pipeline end-to-end |
| 6 | **CPU pipeline viz** — React Flow step-through | Proves visualization framework |
| 7 | **Supply chain graph** — 20+ companies, filterable | Core differentiator; proves graph layer |
| 8 | **Company detail page** — profile + dependencies | Connects graph to readable content |
| 9 | **DB seed scripts** — all MVP content | Proves content management approach |
| 10 | **Dark theme** | Brand identity; reduces eye strain for long sessions |

### 8.2 Defer (with reasons)

| Feature | Defer to | Why |
|---------|----------|-----|
| GPU, Memory, HBM, Manufacturing modules | Phase 2 | Content-heavy; MVP proves one module + one viz + graph |
| Concept map page | Phase 2 | Requires concept graph populated; fundamentals seed establishes concepts |
| Glossary index page | Phase 2 | Inline glossary popovers sufficient for MVP |
| User authentication | Phase 3 | Anonymous localStorage progress is simpler and removes signup friction |
| Progress tracking (persistent) | Phase 2 | localStorage for MVP; DB-backed in Phase 2 |
| Search | Phase 2 | <30 pages don't need search; navigation is sufficient |
| Admin CMS | Phase 3 | Seed scripts adequate for small content team |
| HBM 3D visualization | Phase 2 | D3 layered SVG is simpler; true 3D not needed to teach the concept |
| Quiz/assessment | Phase 3 | Learning value without assessment is still high |
| Real-time company data | Phase 4 | Manual curation is accurate and avoids API costs/complexity |
| Technology and Product entities | Phase 2 | Company-only graph is sufficient for MVP supply chain view |
| Full knowledge graph mode | Phase 3 | Supply chain view alone delivers MVP value |
| i18n | Phase 4 | English-only audience for launch |
| Mobile optimization | Phase 2 | Desktop/tablet first; graph viz needs screen real estate |

### 8.3 MVP Success Criteria

| Criteria | Target |
|----------|--------|
| Pages shipped | 10+ (landing, 2 module pages, 3 lessons, pipeline, graph, 2 company profiles) |
| Companies in graph | ≥20 with ≥40 edges |
| Lessons with interactive viz | ≥2 |
| Lighthouse performance | >85 on landing page |
| Time to first meaningful paint | <2s on broadband |
| Graph interaction latency | <100ms for filter changes on 50 nodes |

---

## 9. Execution Roadmap

### Phase 1 — MVP Foundation (4–6 weeks)

**Goal:** Prove the core loop — learn a concept, explore an interactive viz, navigate the supply chain.

| Week | Deliverables |
|------|-------------|
| 1 | Next.js scaffold, Prisma schema + migration, seed framework, design tokens, UI primitives, root layout |
| 2 | Landing page, learn layout (sidebar, nav), fundamentals module page, 3 seeded lessons with content blocks |
| 3 | CPU module page, CPU pipeline visualization (React Flow + step-through), lesson renderer pipeline |
| 4 | Supply chain graph (20+ companies, filters, detail panel), company detail page, graph API endpoints |
| 5 | Polish: dark theme, responsive layout, SEO metadata, error/loading states, accessibility pass |
| 6 | Testing: unit tests for graph-builder and content loader, E2E for Journey A and Journey B |

**Exit criteria:** A user can land on the site, read 3 fundamentals lessons, interact with the CPU pipeline, and explore a supply chain graph with 20+ companies.

### Phase 2 — Content Expansion (4–6 weeks)

**Goal:** Cover the full learning progression from silicon to AI infrastructure.

| Deliverable | Details |
|-------------|---------|
| GPU module | 3–4 lessons, GPU architecture viz, CPU comparison overlay |
| Memory module | 3 lessons, D3 memory hierarchy treemap |
| Manufacturing module | 3 lessons, React Flow manufacturing flow |
| HBM & AI module | 2–3 lessons, D3 HBM stack visualization |
| Concept map page | React Flow prerequisite graph |
| Glossary index | Searchable concept list |
| Technology + Product entities | Expand knowledge graph beyond companies |
| Progress tracking | localStorage → API sync |
| Search | PostgreSQL full-text search across content + entities |
| Mobile/tablet responsive | Collapsible sidebar, touch-friendly graph controls |

**Exit criteria:** All 8 modules have at least 2 lessons. Concept map shows full progression. Search works across content.

### Phase 3 — Platform (4–6 weeks)

**Goal:** Multi-user platform with content management.

| Deliverable | Details |
|-------------|---------|
| Authentication | NextAuth.js — email + Google OAuth |
| Persistent progress | DB-backed, cross-device |
| Bookmarks | Save companies, concepts, lessons |
| Admin CMS | Content block editor, graph edge editor, publish workflow |
| Quiz blocks | Assessment mode for lessons |
| Full knowledge graph view | All node types, cross-domain edges |
| Edge temporal validity | `validFrom`/`validUntil` on GraphEdge |
| Rate limiting | API route protection |

**Exit criteria:** Content team can add/edit lessons without code changes. Users can sign up, track progress, and bookmark entities.

### Phase 4 — Intelligence & Scale (ongoing)

**Goal:** Data-driven insights and production hardening.

| Deliverable | Details |
|-------------|---------|
| External data integration | Company financials, earnings, fab capacity |
| Automated content alerts | Flag stale relationships, new company events |
| Advanced graph analytics | Centrality metrics, dependency risk scoring |
| i18n | Multi-language content support |
| Performance optimization | Materialized graph views, CDN for viz assets |
| Visual regression testing | Playwright screenshot comparison for viz components |
| Analytics | User journey tracking, lesson completion funnels |
| Content versioning | Draft → review → publish workflow |

**Exit criteria:** Platform handles 10K+ monthly users. Supply chain data updated monthly with minimal manual effort.

---

## 10. Risks and Technical Challenges

### 10.1 Graph Complexity

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Graph becomes unreadable with too many nodes | High | High | Subgraph loading (focus + N hops), category clustering, progressive disclosure |
| Circular dependencies in concept prerequisites | Medium | Medium | Validate DAG at seed time; topological sort with cycle detection |
| Inconsistent edge data (duplicate, conflicting) | Medium | Medium | Unique constraint on edges; seed validation script; admin review workflow (Phase 3) |
| Cross-domain edges create visual clutter | Medium | Low | Separate graph views per domain; "full graph" mode is Phase 3 opt-in |

### 10.2 Data Maintenance

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Supply chain data becomes stale | High | High | `updatedAt` timestamps shown in UI; quarterly manual review cadence; Phase 4 automation |
| Content authoring bottleneck (seed scripts) | Medium | Medium | Phase 2 markdown import; Phase 3 admin CMS |
| Incorrect technical content | Medium | High | Domain expert review before publish; disclaimer that content is educational |
| Company mergers/acquisitions break graph | Medium | Medium | Soft-delete nodes; `validUntil` on edges (Phase 3) |

### 10.3 Visualization Performance

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| React Flow slow with 100+ nodes | Medium | Medium | Viewport culling (built-in), pre-computed layouts, subgraph loading |
| D3 bundle size bloat | Low | Medium | Modular D3 imports; dynamic loading per route |
| Layout recalculation on filter change | Medium | Low | Server-side layout; cache computed positions per filter combination |
| Mobile graph interaction poor | High | Medium | Defer mobile optimization to Phase 2; desktop-first with "best on desktop" notice |
| SSR/hydration mismatch with D3 | Medium | Medium | `ssr: false` on all D3 components; loading skeleton during hydration |

### 10.4 Knowledge Graph Scaling

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| PostgreSQL recursive CTEs slow at scale | Low (before 10K edges) | Medium | Monitor query latency; materialized views at threshold; Neo4j migration path documented |
| Polymorphic FK pattern fragile | Medium | Medium | `node-resolver.ts` centralizes resolution; exhaustive switch on `NodeType`; unit tests per type |
| Graph schema evolution breaks viz | Medium | High | Version field on viz config; migration scripts for config format changes |
| Multi-type node rendering complexity | Medium | Medium | `GraphNodeDisplay` normalized shape; custom node components per type in React Flow |

### 10.5 General Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Scope creep beyond MVP | High | High | Strict MVP scope (§8); defer features explicitly |
| Serverless cold starts on graph API | Medium | Low | Edge caching; ISR for graph page shell; keep subgraph queries fast (<100ms) |
| Prisma client bundle size in serverless | Low | Low | Prisma client is server-only; no client bundle impact |
| Content block JSON schema drift | Medium | Medium | Zod validation on block `data` at render time; TypeScript discriminated unions |

---

## Appendix A: Resolved Open Questions

| Question | Decision | Rationale |
|----------|----------|-----------|
| Auth timing | Anonymous localStorage first (Phase 1–2), accounts in Phase 3 | Reduces friction; MVP doesn't need user accounts |
| Content sourcing | Manual curation via seed scripts | Accurate, version-controlled, no licensing issues |
| HBM viz depth | D3 layered SVG (Phase 2) | Sufficient for education; Three.js only if user demand |
| Deployment | Vercel + Neon PostgreSQL | Serverless-native, connection pooling, zero DevOps |
| Graph database | PostgreSQL with recursive CTEs | Sufficient to 10K edges; simpler operations |
| State management | URL params + RSC + local React state | No global store needed |

## Appendix B: Key Dependencies (planned)

| Package | Version target | Purpose |
|---------|---------------|---------|
| `next` | 15.x | Framework |
| `react` / `react-dom` | 19.x | UI |
| `typescript` | 5.x | Type safety |
| `tailwindcss` | 4.x | Styling |
| `@prisma/client` | 6.x | ORM |
| `@xyflow/react` | 12.x | React Flow |
| `d3` | 7.x | Data visualization |
| `framer-motion` | 11.x | Animation |
| `zod` | 3.x | Validation |
| `dagre` | 0.8.x | Graph layout |
| `vitest` | 3.x | Unit testing |
| `@playwright/test` | 1.x | E2E testing |

---

*This document is the single source of truth for system design. Update it when architectural decisions change. Implementation progress is tracked in [PROJECT_STATUS.md](./PROJECT_STATUS.md).*
