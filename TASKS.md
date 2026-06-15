# Implementation Backlog — CPU Viz

> Atomic tasks sized for **30–90 minute** sessions. Ordered by dependency.
> Track completion in [PROJECT_STATUS.md](./PROJECT_STATUS.md).

**Complexity key:** `S` ≈ 30 min · `M` ≈ 60 min · `L` ≈ 90 min

**Status key:** `⬜` Not started · `🟡` In progress · `✅` Done · `⏸` Deferred

---

## Dependency Graph (summary)

```
Phase 0: Scaffold → Schema → Types → Design System → Config
                          ↓
Phase 1: Seed Data → Content Layer → Layouts → Pages → Viz Framework → Graph → APIs → Polish → Tests
                          ↓
Phase 2: More Content → D3 Viz → Concept Map → Progress → Search → Responsive
                          ↓
Phase 3: Auth → CMS → Quizzes → Full Graph → Bookmarks
                          ↓
Phase 4: External Data → Analytics → i18n → Scale
```

---

## Phase 0 — Foundation & Scaffolding

### P0-001 · Initialize Next.js project
| Field | Value |
|-------|-------|
| **Goal** | Create a runnable Next.js 15 app with TypeScript, Tailwind, App Router, and `src/` directory |
| **Files** | `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css` |
| **Dependencies** | None |
| **Acceptance criteria** | `npm run dev` starts without errors; default page renders at `localhost:3000` |
| **Complexity** | M |

### P0-002 · Install core dependencies
| Field | Value |
|-------|-------|
| **Goal** | Add production and dev dependencies defined in ARCHITECTURE.md Appendix B |
| **Files** | `package.json`, `package-lock.json` |
| **Dependencies** | P0-001 |
| **Acceptance criteria** | `@prisma/client`, `zod`, `clsx`, `tailwind-merge` installed; dev deps include `prisma`, `vitest`, `@playwright/test` |
| **Complexity** | S |

### P0-003 · Configure TypeScript strict mode and path aliases
| Field | Value |
|-------|-------|
| **Goal** | Enable `strict: true` and `@/*` path alias pointing to `src/*` |
| **Files** | `tsconfig.json` |
| **Dependencies** | P0-001 |
| **Acceptance criteria** | Imports like `@/lib/utils/cn` resolve; `tsc --noEmit` passes on scaffold |
| **Complexity** | S |

### P0-004 · Prisma schema — learning content models
| Field | Value |
|-------|-------|
| **Goal** | Define `Module`, `Track`, `Lesson`, `ContentBlock`, `Concept`, `ConceptPrerequisite` models and enums per ARCHITECTURE.md §3.3 |
| **Files** | `prisma/schema.prisma` |
| **Dependencies** | P0-002 |
| **Acceptance criteria** | `prisma validate` passes; all learning enums and relations match architecture doc |
| **Complexity** | M |

### P0-005 · Prisma schema — knowledge graph models (MVP subset)
| Field | Value |
|-------|-------|
| **Goal** | Define `Company`, `Facility`, `GraphEdge` models with indexes for MVP supply chain graph |
| **Files** | `prisma/schema.prisma` |
| **Dependencies** | P0-004 |
| **Acceptance criteria** | `Company`, `Facility`, `GraphEdge` models with `NodeType`, `EdgeType`, `CompanyCategory` enums; indexes on `GraphEdge(sourceType, sourceId)` and `(targetType, targetId)` |
| **Complexity** | M |

### P0-006 · Prisma schema — visualization model + first migration
| Field | Value |
|-------|-------|
| **Goal** | Add `Visualization` model; run initial migration against local/dev PostgreSQL |
| **Files** | `prisma/schema.prisma`, `prisma/migrations/*/migration.sql`, `.env` |
| **Dependencies** | P0-005 |
| **Acceptance criteria** | `prisma migrate dev` succeeds; all tables created in PostgreSQL; `prisma generate` produces client |
| **Complexity** | M |

### P0-007 · Prisma client singleton
| Field | Value |
|-------|-------|
| **Goal** | Create server-only Prisma client with dev hot-reload guard |
| **Files** | `src/lib/prisma/client.ts` |
| **Dependencies** | P0-006 |
| **Acceptance criteria** | Client imports without error; singleton pattern prevents multiple instances in dev |
| **Complexity** | S |

### P0-008 · Shared utility functions
| Field | Value |
|-------|-------|
| **Goal** | Add `cn()` className merger and basic format helpers |
| **Files** | `src/lib/utils/cn.ts`, `src/lib/utils/format.ts` |
| **Dependencies** | P0-002 |
| **Acceptance criteria** | `cn('foo', condition && 'bar')` works; `formatNumber(1500000)` returns readable output |
| **Complexity** | S |

### P0-009 · TypeScript domain types — content
| Field | Value |
|-------|-------|
| **Goal** | Define types for Module, Track, Lesson, ContentBlock payloads with discriminated unions per block type |
| **Files** | `src/types/content.ts` |
| **Dependencies** | P0-004 |
| **Acceptance criteria** | All `ContentBlockType` variants have typed `data` shapes; exports used by no runtime code yet |
| **Complexity** | M |

### P0-010 · TypeScript domain types — graph, company, visualization, API
| Field | Value |
|-------|-------|
| **Goal** | Define `GraphNodeDisplay`, `GraphEdgeDisplay`, `CompanyProfile`, `VizConfig`, API response wrappers |
| **Files** | `src/types/graph.ts`, `src/types/company.ts`, `src/types/visualization.ts`, `src/types/api.ts` |
| **Dependencies** | P0-005 |
| **Acceptance criteria** | Types cover all MVP node/edge enums; `VizConfig` discriminates on `renderer` field |
| **Complexity** | M |

### P0-011 · Site and navigation config
| Field | Value |
|-------|-------|
| **Goal** | Centralize site metadata and navigation structure for all 8 modules |
| **Files** | `src/config/site.ts`, `src/config/navigation.ts`, `src/lib/constants/modules.ts`, `src/lib/constants/categories.ts` |
| **Dependencies** | P0-009 |
| **Acceptance criteria** | Navigation array includes all 8 modules with slug, title, icon, order; company categories exported |
| **Complexity** | S |

### P0-012 · Design tokens — CSS variables and dark theme
| Field | Value |
|-------|-------|
| **Goal** | Define color, typography, and viz-category tokens in `globals.css` with dark theme as default |
| **Files** | `src/app/globals.css`, `tailwind.config.ts` |
| **Dependencies** | P0-001 |
| **Acceptance criteria** | CSS variables for `--background`, `--foreground`, `--primary`, `--viz-node-*` categories; Tailwind extends colors from variables |
| **Complexity** | M |

### P0-013 · UI primitive — Button
| Field | Value |
|-------|-------|
| **Goal** | Build accessible Button with variants (default, outline, ghost) and sizes |
| **Files** | `src/components/ui/button.tsx` |
| **Dependencies** | P0-008, P0-012 |
| **Acceptance criteria** | Renders all variants; keyboard focusable; uses design tokens |
| **Complexity** | S |

### P0-014 · UI primitive — Card
| Field | Value |
|-------|-------|
| **Goal** | Build Card with Header, Title, Description, Content subcomponents |
| **Files** | `src/components/ui/card.tsx` |
| **Dependencies** | P0-012 |
| **Acceptance criteria** | Card composes correctly; used as base for module cards later |
| **Complexity** | S |

### P0-015 · UI primitive — Badge and Panel
| Field | Value |
|-------|-------|
| **Goal** | Build Badge (category labels) and Panel (side detail container) |
| **Files** | `src/components/ui/badge.tsx`, `src/components/ui/panel.tsx` |
| **Dependencies** | P0-012 |
| **Acceptance criteria** | Badge supports category color variants; Panel has header/body/footer slots |
| **Complexity** | S |

### P0-016 · Root layout with fonts and metadata
| Field | Value |
|-------|-------|
| **Goal** | Configure root layout with site fonts, default metadata, and global styles |
| **Files** | `src/app/layout.tsx` |
| **Dependencies** | P0-011, P0-012 |
| **Acceptance criteria** | Page title template set; fonts load; dark background applied globally |
| **Complexity** | S |

### P0-017 · Error and not-found pages
| Field | Value |
|-------|-------|
| **Goal** | Create styled 404 and error boundary pages |
| **Files** | `src/app/not-found.tsx`, `src/app/error.tsx` |
| **Dependencies** | P0-013, P0-014 |
| **Acceptance criteria** | `/nonexistent` shows 404; error page has retry button |
| **Complexity** | S |

### P0-018 · Vitest configuration
| Field | Value |
|-------|-------|
| **Goal** | Set up Vitest with TypeScript path aliases for unit testing |
| **Files** | `vitest.config.ts`, `package.json` (test script) |
| **Dependencies** | P0-003 |
| **Acceptance criteria** | `npm test` runs; sample test in `tests/unit/` passes |
| **Complexity** | S |

### P0-019 · Seed orchestrator skeleton
| Field | Value |
|-------|-------|
| **Goal** | Create seed entry point wired in `package.json` with empty module seed functions |
| **Files** | `prisma/seed/index.ts`, `package.json` (prisma.seed) |
| **Dependencies** | P0-006, P0-007 |
| **Acceptance criteria** | `npx prisma db seed` runs without error (no-op or minimal data) |
| **Complexity** | S |

---

## Phase 1 — MVP

### P1-001 · Seed — modules and tracks
| Field | Value |
|-------|-------|
| **Goal** | Seed all 8 modules with tracks; mark Fundamentals, CPU, and Supply Chain as published |
| **Files** | `prisma/seed/modules.ts`, `prisma/seed/index.ts` |
| **Dependencies** | P0-019 |
| **Acceptance criteria** | DB contains 8 modules, each with ≥1 track; 3 modules have `published: true` |
| **Complexity** | M |

### P1-002 · Seed — fundamentals concepts
| Field | Value |
|-------|-------|
| **Goal** | Seed core concepts (Silicon, Transistor, Logic Gate, Moore's Law) with prerequisites |
| **Files** | `prisma/seed/concepts.ts`, `prisma/seed/index.ts` |
| **Dependencies** | P1-001 |
| **Acceptance criteria** | ≥4 concepts with prerequisite chain; no cycles (validated at seed time) |
| **Complexity** | M |

### P1-003 · Seed — fundamentals lessons (3 lessons)
| Field | Value |
|-------|-------|
| **Goal** | Seed 3 fundamentals lessons with TEXT, HEADING, CALLOUT, and DIAGRAM blocks |
| **Files** | `prisma/seed/lessons/fundamentals.ts`, `prisma/seed/index.ts` |
| **Dependencies** | P1-001, P1-002 |
| **Acceptance criteria** | 3 published lessons with ≥5 content blocks each; blocks ordered correctly |
| **Complexity** | L |

### P1-004 · Seed — CPU module lessons
| Field | Value |
|-------|-------|
| **Goal** | Seed 2–3 CPU lessons covering pipeline stages with glossary term references |
| **Files** | `prisma/seed/lessons/cpu.ts`, `prisma/seed/index.ts` |
| **Dependencies** | P1-001 |
| **Acceptance criteria** | ≥2 published CPU lessons; at least one references a VISUALIZATION block placeholder |
| **Complexity** | L |

### P1-005 · Seed — companies (20+)
| Field | Value |
|-------|-------|
| **Goal** | Seed ≥20 real semiconductor companies across all major categories |
| **Files** | `prisma/seed/companies.ts`, `prisma/seed/index.ts` |
| **Dependencies** | P0-006 |
| **Acceptance criteria** | ≥20 companies with slug, name, category, description; spans FABLESS, FOUNDRY, EQUIPMENT, EDA, etc. |
| **Complexity** | L |

### P1-006 · Seed — supply chain graph edges (40+)
| Field | Value |
|-------|-------|
| **Goal** | Seed ≥40 `GraphEdge` records connecting companies with SUPPLIES, PARTNERS_WITH edges |
| **Files** | `prisma/seed/graph-edges.ts`, `prisma/seed/index.ts` |
| **Dependencies** | P1-005 |
| **Acceptance criteria** | ≥40 edges; no duplicate `(source, target, type)` tuples; strength values 1–5 assigned |
| **Complexity** | M |

### P1-007 · Seed — facilities for key companies
| Field | Value |
|-------|-------|
| **Goal** | Seed fabs and HQ facilities for TSMC, Intel, Samsung, ASML |
| **Files** | `prisma/seed/companies.ts` (extend), `prisma/seed/index.ts` |
| **Dependencies** | P1-005 |
| **Acceptance criteria** | ≥8 facilities across ≥4 companies; fab entries include location |
| **Complexity** | S |

### P1-008 · Seed — CPU pipeline visualization config
| Field | Value |
|-------|-------|
| **Goal** | Seed `Visualization` record for CPU pipeline with manual node positions |
| **Files** | `prisma/seed/visualizations.ts`, `prisma/seed/index.ts` |
| **Dependencies** | P1-004 |
| **Acceptance criteria** | Viz slug `cpu-pipeline` exists; config has ≥5 nodes (Fetch, Decode, Execute, Memory, Writeback) with manual layout |
| **Complexity** | M |

### P1-009 · Seed — supply chain visualization config
| Field | Value |
|-------|-------|
| **Goal** | Seed default supply chain viz config with layout options |
| **Files** | `prisma/seed/visualizations.ts` |
| **Dependencies** | P1-006 |
| **Acceptance criteria** | Viz slug `supply-chain` exists; config specifies `layout: "dagre"` and category color map |
| **Complexity** | S |

### P1-010 · Content service — getModule
| Field | Value |
|-------|-------|
| **Goal** | Implement `getModule(slug)` returning module with tracks and lesson summaries |
| **Files** | `src/lib/content/get-module.ts` |
| **Dependencies** | P0-007, P0-009 |
| **Acceptance criteria** | Returns only published tracks/lessons; throws or returns null for missing slug |
| **Complexity** | S |

### P1-011 · Content service — getLesson
| Field | Value |
|-------|-------|
| **Goal** | Implement `getLesson(moduleSlug, lessonSlug)` with ordered content blocks |
| **Files** | `src/lib/content/get-lesson.ts` |
| **Dependencies** | P0-007, P0-009 |
| **Acceptance criteria** | Returns lesson with blocks sorted by `order`; includes track and module context for breadcrumbs |
| **Complexity** | M |

### P1-012 · Content service — resolveBlocks
| Field | Value |
|-------|-------|
| **Goal** | Resolve `[[concept-slug]]` in markdown and attach viz configs to VISUALIZATION blocks |
| **Files** | `src/lib/content/resolve-blocks.ts` |
| **Dependencies** | P1-011, P0-010 |
| **Acceptance criteria** | TEXT blocks have concept links parsed; VISUALIZATION blocks include full viz config from DB |
| **Complexity** | M |

### P1-013 · Graph service — node resolver
| Field | Value |
|-------|-------|
| **Goal** | Implement polymorphic `resolveNode(type, id)` → `GraphNodeDisplay` for COMPANY type (MVP) |
| **Files** | `src/lib/graph/node-resolver.ts` |
| **Dependencies** | P0-010, P0-007 |
| **Acceptance criteria** | Company nodes resolve with label, category color, href `/companies/[slug]` |
| **Complexity** | M |

### P1-014 · Graph service — getSupplyChainSubgraph
| Field | Value |
|-------|-------|
| **Goal** | Query company subgraph with focus, depth, and category filters |
| **Files** | `src/lib/graph/get-subgraph.ts` |
| **Dependencies** | P1-013, P1-006 |
| **Acceptance criteria** | Returns nodes + edges for 2-hop neighborhood; filters by `CompanyCategory`; empty focus returns top-connected nodes |
| **Complexity** | L |

### P1-015 · Viz transform — toReactFlow
| Field | Value |
|-------|-------|
| **Goal** | Transform `GraphNodeDisplay[]` + edges into React Flow node/edge format with Dagre layout |
| **Files** | `src/lib/visualizations/to-react-flow.ts`, `src/lib/visualizations/layout-algorithms.ts`, `src/lib/visualizations/color-scales.ts` |
| **Dependencies** | P0-010 |
| **Acceptance criteria** | Output includes positioned nodes; edge stroke width maps to strength; unit test with 5-node fixture |
| **Complexity** | L |

### P1-016 · Company service — getCompany
| Field | Value |
|-------|-------|
| **Goal** | Fetch company by slug with facilities and connected edges |
| **Files** | `src/lib/companies/get-company.ts` |
| **Dependencies** | P0-007, P1-005 |
| **Acceptance criteria** | Returns company profile with suppliers, customers, partners grouped by edge type |
| **Complexity** | M |

### P1-017 · Layout — SiteHeader and SiteFooter
| Field | Value |
|-------|-------|
| **Goal** | Build marketing header with nav links and footer with module links |
| **Files** | `src/components/layout/site-header.tsx`, `src/components/layout/site-footer.tsx` |
| **Dependencies** | P0-011, P0-013 |
| **Acceptance criteria** | Header links to Learn and Explore sections; footer shows copyright and doc links |
| **Complexity** | M |

### P1-018 · Layout — Marketing layout
| Field | Value |
|-------|-------|
| **Goal** | Create `(marketing)` route group layout with header/footer |
| **Files** | `src/app/(marketing)/layout.tsx` |
| **Dependencies** | P1-017 |
| **Acceptance criteria** | Marketing pages render with header/footer; no sidebar |
| **Complexity** | S |

### P1-019 · Layout — LearnSidebar and Breadcrumbs
| Field | Value |
|-------|-------|
| **Goal** | Build sidebar with module/track/lesson navigation and breadcrumb component |
| **Files** | `src/components/layout/learn-sidebar.tsx`, `src/components/layout/breadcrumbs.tsx` |
| **Dependencies** | P0-011, P1-010 |
| **Acceptance criteria** | Sidebar highlights active module; breadcrumbs show Module > Track > Lesson |
| **Complexity** | M |

### P1-020 · Layout — Learn layout shell
| Field | Value |
|-------|-------|
| **Goal** | Create `(learn)` route group layout with sidebar and main content area |
| **Files** | `src/app/(learn)/layout.tsx` |
| **Dependencies** | P1-019 |
| **Acceptance criteria** | Learn pages render with sidebar; content area scrolls independently |
| **Complexity** | S |

### P1-021 · Layout — Explore layout shell
| Field | Value |
|-------|-------|
| **Goal** | Create `(explore)` route group layout with minimal chrome for full-bleed viz |
| **Files** | `src/app/(explore)/layout.tsx` |
| **Dependencies** | P1-017 |
| **Acceptance criteria** | Graph pages use full viewport height; header collapses or minimal |
| **Complexity** | S |

### P1-022 · Learn — ModuleCard component
| Field | Value |
|-------|-------|
| **Goal** | Build card showing module title, description, lesson count, and CTA |
| **Files** | `src/components/learn/module-card.tsx` |
| **Dependencies** | P0-014, P0-015 |
| **Acceptance criteria** | Card links to module page; shows published lesson count; disabled state for unpublished modules |
| **Complexity** | S |

### P1-023 · Page — Landing page
| Field | Value |
|-------|-------|
| **Goal** | Build landing page with hero, 8-module grid, and CTAs to learn and explore |
| **Files** | `src/app/(marketing)/page.tsx` |
| **Dependencies** | P1-018, P1-022, P1-001 |
| **Acceptance criteria** | All 8 modules displayed; "Start Learning" → `/fundamentals`; "Explore Supply Chain" → `/graph`; ISR revalidate set |
| **Complexity** | M |

### P1-024 · Page — Fundamentals module overview
| Field | Value |
|-------|-------|
| **Goal** | Build `/fundamentals` page listing tracks and lessons |
| **Files** | `src/app/(learn)/fundamentals/page.tsx` |
| **Dependencies** | P1-020, P1-010 |
| **Acceptance criteria** | Shows module description, track list, lesson links; first lesson CTA prominent |
| **Complexity** | S |

### P1-025 · Page — CPU module overview
| Field | Value |
|-------|-------|
| **Goal** | Build `/cpu` page with track list and link to pipeline explorer |
| **Files** | `src/app/(learn)/cpu/page.tsx` |
| **Dependencies** | P1-020, P1-010 |
| **Acceptance criteria** | Pipeline explorer link visible; lessons listed by track |
| **Complexity** | S |

### P1-026 · Learn — TextBlock and HeadingBlock
| Field | Value |
|-------|-------|
| **Goal** | Render TEXT (markdown) and HEADING content blocks |
| **Files** | `src/components/learn/content-blocks/text-block.tsx`, `src/components/learn/content-blocks/heading-block.tsx` |
| **Dependencies** | P0-009, P0-012 |
| **Acceptance criteria** | Markdown renders with prose styles; headings use correct level; XSS sanitized |
| **Complexity** | M |

### P1-027 · Learn — CalloutBlock and DiagramBlock
| Field | Value |
|-------|-------|
| **Goal** | Render CALLOUT (info/warning/tip) and DIAGRAM (static image) blocks |
| **Files** | `src/components/learn/content-blocks/callout-block.tsx`, `src/components/learn/content-blocks/diagram-block.tsx` |
| **Dependencies** | P0-014 |
| **Acceptance criteria** | Callout variants styled distinctly; diagrams use `next/image` with alt text |
| **Complexity** | S |

### P1-028 · Learn — ConceptLink and GlossaryPanel
| Field | Value |
|-------|-------|
| **Goal** | Inline concept links with hover popover showing definition |
| **Files** | `src/components/learn/concept-link.tsx`, `src/components/learn/glossary-panel.tsx` |
| **Dependencies** | P1-002 |
| **Acceptance criteria** | Clicking `[[transistor]]` shows popover with definition and "learn more" link |
| **Complexity** | M |

### P1-029 · Learn — LessonRenderer and LessonNav
| Field | Value |
|-------|-------|
| **Goal** | Orchestrate content block rendering and prev/next lesson navigation |
| **Files** | `src/components/learn/lesson-renderer.tsx`, `src/components/learn/lesson-nav.tsx` |
| **Dependencies** | P1-026, P1-027 |
| **Acceptance criteria** | All block types dispatch to correct component; prev/next links work within track |
| **Complexity** | M |

### P1-030 · Page — Fundamentals lesson page
| Field | Value |
|-------|-------|
| **Goal** | Build `/fundamentals/[lessonSlug]` dynamic lesson page |
| **Files** | `src/app/(learn)/fundamentals/[lessonSlug]/page.tsx` |
| **Dependencies** | P1-029, P1-011, P1-012 |
| **Acceptance criteria** | 3 fundamentals lessons render from DB; metadata/SEO title per lesson; 404 for invalid slug |
| **Complexity** | M |

### P1-031 · Page — CPU lesson page
| Field | Value |
|-------|-------|
| **Goal** | Build `/cpu/[lessonSlug]` dynamic lesson page |
| **Files** | `src/app/(learn)/cpu/[lessonSlug]/page.tsx` |
| **Dependencies** | P1-029, P1-011 |
| **Acceptance criteria** | CPU lessons render; breadcrumbs correct |
| **Complexity** | S |

### P1-032 · Viz — VizContainer wrapper
| Field | Value |
|-------|-------|
| **Goal** | Build shared viz wrapper with loading skeleton, error boundary, resize observer |
| **Files** | `src/components/visualizations/viz-container.tsx` |
| **Dependencies** | P0-012 |
| **Acceptance criteria** | Shows skeleton while loading; catches render errors gracefully; resizes with parent |
| **Complexity** | M |

### P1-033 · Viz — VizRegistry
| Field | Value |
|-------|-------|
| **Goal** | Map viz slugs to lazy-loaded components |
| **Files** | `src/components/visualizations/viz-registry.ts` |
| **Dependencies** | P0-010 |
| **Acceptance criteria** | Registry returns component for `cpu-pipeline` and `supply-chain` slugs; unknown slug shows fallback |
| **Complexity** | S |

### P1-034 · Viz — Shared StepController
| Field | Value |
|-------|-------|
| **Goal** | Build step-through UI (prev/next/step indicator) for pipeline viz |
| **Files** | `src/components/visualizations/shared/step-controller.tsx`, `src/components/visualizations/shared/viz-controls.tsx` |
| **Dependencies** | P0-013 |
| **Acceptance criteria** | Controller emits `onStepChange(index)`; keyboard arrow keys work |
| **Complexity** | M |

### P1-035 · Viz — PipelineDiagram (React Flow)
| Field | Value |
|-------|-------|
| **Goal** | Build CPU pipeline diagram with step-through highlighting via Framer Motion |
| **Files** | `src/components/visualizations/react-flow/pipeline-diagram.tsx`, `src/components/visualizations/react-flow/nodes/pipeline-stage-node.tsx` |
| **Dependencies** | P1-032, P1-034, P1-008, P1-015 |
| **Acceptance criteria** | 5 stages render; active stage highlighted; step controller advances stages; dynamic import with `ssr: false` |
| **Complexity** | L |

### P1-036 · Learn — VisualizationBlock
| Field | Value |
|-------|-------|
| **Goal** | Content block that renders viz via VizRegistry inside VizContainer |
| **Files** | `src/components/learn/content-blocks/visualization-block.tsx` |
| **Dependencies** | P1-033, P1-032 |
| **Acceptance criteria** | VISUALIZATION blocks in lessons render embedded pipeline diagram |
| **Complexity** | M |

### P1-037 · Page — CPU Pipeline Explorer
| Field | Value |
|-------|-------|
| **Goal** | Full-page `/cpu/pipeline` with pipeline viz and explanatory sidebar |
| **Files** | `src/app/(learn)/cpu/pipeline/page.tsx` |
| **Dependencies** | P1-035 |
| **Acceptance criteria** | Full-width pipeline viz; step descriptions update in sidebar; URL `?step=2` syncs with active stage |
| **Complexity** | M |

### P1-038 · Viz — Supply chain custom nodes and edges
| Field | Value |
|-------|-------|
| **Goal** | Build CompanyNode and DependencyEdge components with category colors |
| **Files** | `src/components/visualizations/react-flow/nodes/company-node.tsx`, `src/components/visualizations/react-flow/edges/dependency-edge.tsx` |
| **Dependencies** | P0-012, P1-015 |
| **Acceptance criteria** | Nodes show company name, category badge; edges vary width by strength |
| **Complexity** | M |

### P1-039 · Viz — SupplyChainGraph component
| Field | Value |
|-------|-------|
| **Goal** | Build interactive supply chain graph with pan/zoom and node selection |
| **Files** | `src/components/visualizations/react-flow/supply-chain-graph.tsx`, `src/components/visualizations/react-flow/hooks/use-fit-view.ts` |
| **Dependencies** | P1-038, P1-032 |
| **Acceptance criteria** | Graph renders 20+ nodes; pan/zoom works; clicking node emits `onNodeSelect`; `nodesDraggable: false` |
| **Complexity** | L |

### P1-040 · Graph UI — GraphToolbar and GraphLegend
| Field | Value |
|-------|-------|
| **Goal** | Build filter toolbar (category toggles) and color legend for graph page |
| **Files** | `src/components/graph/graph-toolbar.tsx`, `src/components/graph/graph-legend.tsx` |
| **Dependencies** | P0-011, P0-015 |
| **Acceptance criteria** | Category checkboxes filter graph; legend shows all company categories with colors |
| **Complexity** | M |

### P1-041 · Graph UI — GraphDetailPanel
| Field | Value |
|-------|-------|
| **Goal** | Side panel showing selected company summary with link to profile |
| **Files** | `src/components/graph/graph-detail-panel.tsx` |
| **Dependencies** | P0-015, P1-016 |
| **Acceptance criteria** | Panel shows name, category, description, supplier/customer counts; "View Profile" link works |
| **Complexity** | M |

### P1-042 · Hook — useGraphUrlState
| Field | Value |
|-------|-------|
| **Goal** | Sync graph filters and focus node with URL search params |
| **Files** | `src/hooks/use-graph-url-state.ts` |
| **Dependencies** | P0-010 |
| **Acceptance criteria** | `?category=FOUNDRY&focus=tsmc` parsed and updatable; browser back/forward works |
| **Complexity** | M |

### P1-043 · Page — Supply Chain Graph
| Field | Value |
|-------|-------|
| **Goal** | Build `/graph` page with SSR initial graph and client interactivity |
| **Files** | `src/app/(explore)/graph/page.tsx` |
| **Dependencies** | P1-039, P1-040, P1-041, P1-042, P1-014, P1-021 |
| **Acceptance criteria** | Graph loads with all companies; filters update URL and graph; detail panel opens on node click |
| **Complexity** | L |

### P1-044 · Page — Company directory
| Field | Value |
|-------|-------|
| **Goal** | Build `/companies` listing page with category filter |
| **Files** | `src/app/(explore)/companies/page.tsx` |
| **Dependencies** | P1-021, P1-005 |
| **Acceptance criteria** | Lists all companies; filter by category; each row links to detail page |
| **Complexity** | M |

### P1-045 · Page — Company detail
| Field | Value |
|-------|-------|
| **Goal** | Build `/companies/[slug]` with profile, facilities, and dependency lists |
| **Files** | `src/app/(explore)/companies/[slug]/page.tsx` |
| **Dependencies** | P1-016, P1-021 |
| **Acceptance criteria** | Shows company info, facilities, suppliers, customers; links to graph focus view; 404 for invalid slug |
| **Complexity** | M |

### P1-046 · API — GET /api/content/modules
| Field | Value |
|-------|-------|
| **Goal** | REST endpoint returning published modules with track summaries |
| **Files** | `src/app/api/content/modules/route.ts` |
| **Dependencies** | P1-010 |
| **Acceptance criteria** | Returns JSON array; Zod-validated response; cache headers set |
| **Complexity** | S |

### P1-047 · API — GET /api/content/lessons/[slug]
| Field | Value |
|-------|-------|
| **Goal** | REST endpoint returning lesson with resolved blocks |
| **Files** | `src/app/api/content/lessons/[slug]/route.ts` |
| **Dependencies** | P1-012 |
| **Acceptance criteria** | Returns full lesson JSON; 404 for unpublished/missing |
| **Complexity** | S |

### P1-048 · API — GET /api/graph/supply-chain
| Field | Value |
|-------|-------|
| **Goal** | REST endpoint returning React Flow-ready subgraph |
| **Files** | `src/app/api/graph/supply-chain/route.ts` |
| **Dependencies** | P1-014, P1-015 |
| **Acceptance criteria** | Accepts `focus`, `depth`, `category` query params; returns `{ nodes, edges }` |
| **Complexity** | M |

### P1-049 · API — GET /api/companies and /api/companies/[slug]
| Field | Value |
|-------|-------|
| **Goal** | REST endpoints for company list and detail |
| **Files** | `src/app/api/companies/route.ts`, `src/app/api/companies/[slug]/route.ts` |
| **Dependencies** | P1-016 |
| **Acceptance criteria** | List supports `?category=` filter; detail includes relationships |
| **Complexity** | M |

### P1-050 · API — GET /api/visualizations/[slug]
| Field | Value |
|-------|-------|
| **Goal** | REST endpoint returning viz config by slug |
| **Files** | `src/app/api/visualizations/[slug]/route.ts` |
| **Dependencies** | P1-008 |
| **Acceptance criteria** | Returns viz config JSON; 404 for unknown slug |
| **Complexity** | S |

### P1-051 · Static assets — fundamentals diagrams
| Field | Value |
|-------|-------|
| **Goal** | Add SVG diagrams for silicon wafer, transistor, and logic gate |
| **Files** | `public/assets/diagrams/silicon-wafer.svg`, `public/assets/diagrams/transistor.svg`, `public/assets/diagrams/logic-gate.svg` |
| **Dependencies** | None |
| **Acceptance criteria** | SVGs render in DIAGRAM blocks; file size <50KB each |
| **Complexity** | M |

### P1-052 · Polish — SEO metadata for all MVP pages
| Field | Value |
|-------|-------|
| **Goal** | Add `generateMetadata` to all pages with title, description, OG tags |
| **Files** | All `page.tsx` files in MVP routes |
| **Dependencies** | P1-023 through P1-045 |
| **Acceptance criteria** | Each page has unique title; OG image uses site default |
| **Complexity** | M |

### P1-053 · Polish — Loading and suspense states
| Field | Value |
|-------|-------|
| **Goal** | Add `loading.tsx` skeletons for lesson and graph routes |
| **Files** | `src/app/(learn)/fundamentals/[lessonSlug]/loading.tsx`, `src/app/(explore)/graph/loading.tsx` |
| **Dependencies** | P1-030, P1-043 |
| **Acceptance criteria** | Skeleton UI shows during data fetch; no layout shift on load |
| **Complexity** | S |

### P1-054 · Polish — Tablet responsive layout
| Field | Value |
|-------|-------|
| **Goal** | Ensure learn sidebar collapses and graph is usable at 768px+ |
| **Files** | `src/components/layout/learn-sidebar.tsx`, `src/app/(learn)/layout.tsx`, graph components |
| **Dependencies** | P1-020, P1-043 |
| **Acceptance criteria** | Sidebar toggles on tablet; graph toolbar wraps; no horizontal overflow on lesson pages |
| **Complexity** | M |

### P1-055 · Test — Unit tests for toReactFlow and getSubgraph
| Field | Value |
|-------|-------|
| **Goal** | Vitest tests for graph transform and subgraph query logic |
| **Files** | `tests/unit/to-react-flow.test.ts`, `tests/unit/get-subgraph.test.ts` |
| **Dependencies** | P1-014, P1-015, P0-018 |
| **Acceptance criteria** | ≥8 test cases; all pass; edge cases for empty graph and single node |
| **Complexity** | M |

### P1-056 · Test — Unit tests for content loader
| Field | Value |
|-------|-------|
| **Goal** | Vitest tests for getLesson and resolveBlocks |
| **Files** | `tests/unit/get-lesson.test.ts`, `tests/unit/resolve-blocks.test.ts` |
| **Dependencies** | P1-011, P1-012, P0-018 |
| **Acceptance criteria** | Block ordering verified; concept link parsing tested |
| **Complexity** | M |

### P1-057 · Test — E2E Journey A (student learns CPU)
| Field | Value |
|-------|-------|
| **Goal** | Playwright test: landing → fundamentals → CPU lesson → pipeline explorer |
| **Files** | `tests/e2e/journey-student.spec.ts`, `playwright.config.ts` |
| **Dependencies** | P1-037, P1-030 |
| **Acceptance criteria** | Test passes headless; verifies lesson content visible and pipeline step changes |
| **Complexity** | M |

### P1-058 · Test — E2E Journey B (investor explores supply chain)
| Field | Value |
|-------|-------|
| **Goal** | Playwright test: landing → graph → click node → company profile |
| **Files** | `tests/e2e/journey-investor.spec.ts` |
| **Dependencies** | P1-043, P1-045 |
| **Acceptance criteria** | Test passes; verifies graph renders, node click opens panel, profile link navigates |
| **Complexity** | M |

### P1-059 · Polish — Accessibility pass (MVP pages)
| Field | Value |
|-------|-------|
| **Goal** | Keyboard navigation, aria labels, focus management for viz and nav |
| **Files** | Layout, graph, and viz components |
| **Dependencies** | P1-043, P1-035, P1-019 |
| **Acceptance criteria** | Tab navigates all interactive elements; pipeline steps keyboard-accessible; graph nodes focusable |
| **Complexity** | M |

---

## Phase 2 — Content Expansion

### P2-001 · Prisma schema — Technology, Product, Process models
| Field | Value |
|-------|-------|
| **Goal** | Add deferred knowledge graph entity tables and run migration |
| **Files** | `prisma/schema.prisma`, `prisma/migrations/` |
| **Dependencies** | P1-006 (Phase 1 complete) |
| **Acceptance criteria** | New models migrated; `GraphEdge` supports new `NodeType` values |
| **Complexity** | M |

### P2-002 · Seed — Technology and Product entities
| Field | Value |
|-------|-------|
| **Goal** | Seed key technologies (EUV, FinFET, HBM, CoWoS) and products (H100, A17, Ryzen) |
| **Files** | `prisma/seed/technologies.ts`, `prisma/seed/products.ts`, `prisma/seed/index.ts` |
| **Dependencies** | P2-001 |
| **Acceptance criteria** | ≥8 technologies, ≥6 products with company links |
| **Complexity** | M |

### P2-003 · Seed — GPU module lessons (3–4)
| Field | Value |
|-------|-------|
| **Goal** | Seed GPU lessons covering SIMT, SMs, warps, memory hierarchy |
| **Files** | `prisma/seed/lessons/gpu.ts` |
| **Dependencies** | P2-001 |
| **Acceptance criteria** | ≥3 published GPU lessons with content blocks |
| **Complexity** | L |

### P2-004 · Seed — Memory module lessons (3)
| Field | Value |
|-------|-------|
| **Goal** | Seed memory lessons covering SRAM, DRAM, hierarchy, bandwidth |
| **Files** | `prisma/seed/lessons/memory.ts` |
| **Dependencies** | P2-001 |
| **Acceptance criteria** | ≥3 published memory lessons |
| **Complexity** | L |

### P2-005 · Seed — Manufacturing module lessons (3)
| Field | Value |
|-------|-------|
| **Goal** | Seed manufacturing lessons covering fab flow, lithography, yield |
| **Files** | `prisma/seed/lessons/manufacturing.ts` |
| **Dependencies** | P2-001 |
| **Acceptance criteria** | ≥3 published manufacturing lessons |
| **Complexity** | L |

### P2-006 · Seed — HBM & AI module lessons (2–3)
| Field | Value |
|-------|-------|
| **Goal** | Seed HBM/AI lessons covering HBM stack, GPU clusters, training vs inference |
| **Files** | `prisma/seed/lessons/hbm-ai.ts` |
| **Dependencies** | P2-002 |
| **Acceptance criteria** | ≥2 published HBM/AI lessons |
| **Complexity** | L |

### P2-007 · Seed — expanded concept graph
| Field | Value |
|-------|-------|
| **Goal** | Seed full concept prerequisite chain per ARCHITECTURE.md §6.3 |
| **Files** | `prisma/seed/concepts.ts` (extend) |
| **Dependencies** | P2-003 through P2-006 |
| **Acceptance criteria** | ≥20 concepts with DAG prerequisites covering all modules |
| **Complexity** | M |

### P2-008 · Graph service — extend node resolver for all types
| Field | Value |
|-------|-------|
| **Goal** | Add Technology, Product, Process, Concept resolution to node-resolver |
| **Files** | `src/lib/graph/node-resolver.ts` |
| **Dependencies** | P2-001, P2-002 |
| **Acceptance criteria** | All 5 node types resolve to `GraphNodeDisplay`; unit tests per type |
| **Complexity** | M |

### P2-009 · Graph service — findPath (shortest path)
| Field | Value |
|-------|-------|
| **Goal** | Implement BFS shortest path between two entities via recursive CTE |
| **Files** | `src/lib/graph/find-path.ts` |
| **Dependencies** | P2-008 |
| **Acceptance criteria** | Returns path between Apple and ASML; respects 6-hop limit; returns empty if no path |
| **Complexity** | L |

### P2-010 · Viz — GPU architecture diagram (React Flow)
| Field | Value |
|-------|-------|
| **Goal** | Build GPU architecture explorer with SM nodes and warp visualization |
| **Files** | `src/components/visualizations/react-flow/gpu-architecture.tsx`, `prisma/seed/visualizations.ts` |
| **Dependencies** | P1-035, P2-003 |
| **Acceptance criteria** | GPU diagram renders; clicking SM shows detail; CPU comparison toggle |
| **Complexity** | L |

### P2-011 · Viz — D3 hooks (useD3, useResizeObserver)
| Field | Value |
|-------|-------|
| **Goal** | Build reusable D3 lifecycle and resize hooks |
| **Files** | `src/components/visualizations/d3/hooks/use-d3.ts`, `src/components/visualizations/d3/hooks/use-resize-observer.ts` |
| **Dependencies** | P0-002 |
| **Acceptance criteria** | Hooks manage D3 join pattern and cleanup; resize debounced at 100ms |
| **Complexity** | M |

### P2-012 · Viz — MemoryHierarchy (D3 treemap)
| Field | Value |
|-------|-------|
| **Goal** | Build interactive memory hierarchy treemap with latency/bandwidth tooltips |
| **Files** | `src/components/visualizations/d3/memory-hierarchy.tsx`, `src/lib/visualizations/to-d3-hierarchy.ts` |
| **Dependencies** | P2-011, P2-004 |
| **Acceptance criteria** | Treemap renders L1–L4 cache + RAM; hover shows metrics; dynamic import `ssr: false` |
| **Complexity** | L |

### P2-013 · Viz — ManufacturingFlow (React Flow linear)
| Field | Value |
|-------|-------|
| **Goal** | Build left-to-right manufacturing flow with scroll-synced stage cards |
| **Files** | `src/components/visualizations/react-flow/manufacturing-flow.tsx` |
| **Dependencies** | P1-039, P2-005 |
| **Acceptance criteria** | ≥8 process stages; scroll highlights active stage; stage detail card expands |
| **Complexity** | L |

### P2-014 · Viz — HBMStack (D3 layered SVG)
| Field | Value |
|-------|-------|
| **Goal** | Build HBM stack visualization with hover explode layers |
| **Files** | `src/components/visualizations/d3/hbm-stack.tsx` |
| **Dependencies** | P2-011, P2-006 |
| **Acceptance criteria** | Shows DRAM stack layers; hover separates layers with bandwidth annotations |
| **Complexity** | L |

### P2-015 · Viz — ConceptMap (React Flow)
| Field | Value |
|-------|-------|
| **Goal** | Build concept prerequisite graph with Dagre top-down layout |
| **Files** | `src/components/visualizations/react-flow/concept-map.tsx` |
| **Dependencies** | P2-007, P2-008 |
| **Acceptance criteria** | Renders concept DAG; click opens glossary panel; prerequisite arrows shown |
| **Complexity** | L |

### P2-016 · Pages — GPU, Memory, Manufacturing, HBM module pages
| Field | Value |
|-------|-------|
| **Goal** | Build module overview and `[lessonSlug]` pages for 4 new modules |
| **Files** | `src/app/(learn)/gpu/`, `memory/`, `manufacturing/`, `hbm-ai/` page files |
| **Dependencies** | P2-003 through P2-006, P1-029 |
| **Acceptance criteria** | All 4 modules have overview + lesson pages; viz blocks render in lessons |
| **Complexity** | L |

### P2-017 · Page — Concept map (/concepts)
| Field | Value |
|-------|-------|
| **Goal** | Full-page concept prerequisite explorer |
| **Files** | `src/app/(explore)/concepts/page.tsx` |
| **Dependencies** | P2-015, P1-021 |
| **Acceptance criteria** | Concept map renders full DAG; click navigates to lesson or glossary |
| **Complexity** | M |

### P2-018 · Page — Glossary index (/glossary)
| Field | Value |
|-------|-------|
| **Goal** | Alphabetical searchable concept list |
| **Files** | `src/app/(learn)/glossary/page.tsx` or `src/app/glossary/page.tsx` |
| **Dependencies** | P2-007 |
| **Acceptance criteria** | Lists all concepts; click opens definition; links to introducing lesson |
| **Complexity** | M |

### P2-019 · API — GET /api/graph/concepts and /api/graph/path
| Field | Value |
|-------|-------|
| **Goal** | REST endpoints for concept graph and shortest path |
| **Files** | `src/app/api/graph/concepts/route.ts`, `src/app/api/graph/path/route.ts` |
| **Dependencies** | P2-008, P2-009 |
| **Acceptance criteria** | Concepts endpoint returns DAG; path endpoint returns ordered node list |
| **Complexity** | M |

### P2-020 · Progress — localStorage store
| Field | Value |
|-------|-------|
| **Goal** | Track lesson completion and last block in localStorage |
| **Files** | `src/lib/progress/progress-store.ts`, `src/hooks/use-lesson-progress.ts` |
| **Dependencies** | P1-030 |
| **Acceptance criteria** | Completing a lesson persists; revisiting shows completion badge in sidebar |
| **Complexity** | M |

### P2-021 · Layout — LearnProgress bar
| Field | Value |
|-------|-------|
| **Goal** | Show module completion percentage in learn layout |
| **Files** | `src/components/layout/learn-progress.tsx`, `src/app/(learn)/layout.tsx` |
| **Dependencies** | P2-020 |
| **Acceptance criteria** | Progress bar updates as lessons completed; per-module percentage shown |
| **Complexity** | S |

### P2-022 · Prisma schema — User and LessonProgress models
| Field | Value |
|-------|-------|
| **Goal** | Add user progress tables for API-backed sync |
| **Files** | `prisma/schema.prisma`, `prisma/migrations/` |
| **Dependencies** | P2-020 |
| **Acceptance criteria** | Models migrated; ready for API sync (auth not required yet) |
| **Complexity** | S |

### P2-023 · API — POST /api/progress
| Field | Value |
|-------|-------|
| **Goal** | Upsert lesson progress by anonymous session ID |
| **Files** | `src/app/api/progress/route.ts`, `src/lib/progress/progress-store.ts` |
| **Dependencies** | P2-022 |
| **Acceptance criteria** | POST accepts `{ lessonId, completed, lastBlock, sessionId }`; upserts to DB |
| **Complexity** | M |

### P2-024 · Search — PostgreSQL full-text search
| Field | Value |
|-------|-------|
| **Goal** | Add tsvector columns and GIN indexes; implement search service |
| **Files** | `prisma/migrations/`, `src/lib/content/search.ts` |
| **Dependencies** | P2-007, P1-005 |
| **Acceptance criteria** | Search returns lessons, concepts, and companies ranked by relevance |
| **Complexity** | L |

### P2-025 · API — GET /api/search
| Field | Value |
|-------|-------|
| **Goal** | REST search endpoint with query param |
| **Files** | `src/app/api/search/route.ts` |
| **Dependencies** | P2-024 |
| **Acceptance criteria** | `?q=tsmc` returns matching companies and related content |
| **Complexity** | S |

### P2-026 · Page — Search results (/search)
| Field | Value |
|-------|-------|
| **Goal** | Search results page with grouped results by type |
| **Files** | `src/app/search/page.tsx` |
| **Dependencies** | P2-025 |
| **Acceptance criteria** | Results grouped by Lessons, Concepts, Companies; empty state for no results |
| **Complexity** | M |

### P2-027 · Polish — Mobile/tablet graph touch controls
| Field | Value |
|-------|-------|
| **Goal** | Pinch-zoom and touch pan for graph; collapsible sidebar on mobile |
| **Files** | Graph components, learn layout |
| **Dependencies** | P1-043, P1-054 |
| **Acceptance criteria** | Graph usable on iPad; sidebar collapses on <768px |
| **Complexity** | M |

### P2-028 · Test — E2E Journey C (career switcher full path)
| Field | Value |
|-------|-------|
| **Goal** | Playwright test: fundamentals → CPU → memory progression with progress tracking |
| **Files** | `tests/e2e/journey-switcher.spec.ts` |
| **Dependencies** | P2-020, P2-016 |
| **Acceptance criteria** | Test verifies progress persists across page navigations |
| **Complexity** | M |

---

## Phase 3 — Platform

### P3-001 · Auth — NextAuth.js setup
| Field | Value |
|-------|-------|
| **Goal** | Configure NextAuth v5 with email and Google OAuth providers |
| **Files** | `src/app/api/auth/[...nextauth]/route.ts`, `src/lib/auth/config.ts`, `.env` |
| **Dependencies** | Phase 2 complete |
| **Acceptance criteria** | Sign in/out works; session available in server components |
| **Complexity** | L |

### P3-002 · Auth — Prisma User model adapter
| Field | Value |
|-------|-------|
| **Goal** | Wire NextAuth to Prisma User model with accounts/sessions tables |
| **Files** | `prisma/schema.prisma`, `prisma/migrations/` |
| **Dependencies** | P3-001, P2-022 |
| **Acceptance criteria** | User records created on first sign-in; session persists across devices |
| **Complexity** | M |

### P3-003 · Progress — migrate anonymous to authenticated
| Field | Value |
|-------|-------|
| **Goal** | On sign-in, merge localStorage progress into user's DB records |
| **Files** | `src/lib/progress/progress-store.ts`, `src/hooks/use-lesson-progress.ts` |
| **Dependencies** | P3-002, P2-023 |
| **Acceptance criteria** | Pre-login progress preserved after sign-up; no duplicate records |
| **Complexity** | M |

### P3-004 · Bookmarks — schema and API
| Field | Value |
|-------|-------|
| **Goal** | Add Bookmark model and CRUD API endpoints |
| **Files** | `prisma/schema.prisma`, `src/app/api/bookmarks/route.ts` |
| **Dependencies** | P3-002 |
| **Acceptance criteria** | Users can bookmark companies, concepts, lessons; list/delete works |
| **Complexity** | M |

### P3-005 · Bookmarks — UI toggle on detail pages
| Field | Value |
|-------|-------|
| **Goal** | Add bookmark button to company, lesson, and concept pages |
| **Files** | Company detail, lesson header components |
| **Dependencies** | P3-004 |
| **Acceptance criteria** | Bookmark icon toggles state; requires auth (prompt sign-in if anonymous) |
| **Complexity** | S |

### P3-006 · Admin — protected layout and auth guard
| Field | Value |
|-------|-------|
| **Goal** | Create `/admin` route group with role-based access (admin role) |
| **Files** | `src/app/admin/layout.tsx`, `src/lib/auth/guards.ts` |
| **Dependencies** | P3-001 |
| **Acceptance criteria** | Non-admin users redirected; admin role checked from session |
| **Complexity** | M |

### P3-007 · Admin — lesson list and editor
| Field | Value |
|-------|-------|
| **Goal** | Admin page listing lessons with block editor (add/remove/reorder blocks) |
| **Files** | `src/app/admin/lessons/page.tsx`, `src/app/admin/lessons/[id]/page.tsx`, `src/components/admin/lesson-editor.tsx` |
| **Dependencies** | P3-006 |
| **Acceptance criteria** | Admin can edit lesson title, add TEXT block, reorder blocks, save to DB |
| **Complexity** | L |

### P3-008 · Admin — publish workflow
| Field | Value |
|-------|-------|
| **Goal** | Draft/publish toggle with `revalidatePath` on publish |
| **Files** | `src/app/api/admin/content/route.ts`, lesson editor |
| **Dependencies** | P3-007 |
| **Acceptance criteria** | Unpublished lessons invisible on public site; publish triggers ISR revalidation |
| **Complexity** | M |

### P3-009 · Admin — graph edge editor
| Field | Value |
|-------|-------|
| **Goal** | Admin UI to add/remove GraphEdge records with visual preview |
| **Files** | `src/app/admin/graph/page.tsx`, `src/components/admin/edge-editor.tsx` |
| **Dependencies** | P3-006, P1-039 |
| **Acceptance criteria** | Admin can create edge between two companies; preview shows edge on graph |
| **Complexity** | L |

### P3-010 · Content — QUIZ block type
| Field | Value |
|-------|-------|
| **Goal** | Add QUIZ block rendering and seed example quiz |
| **Files** | `src/types/content.ts`, `src/components/learn/content-blocks/quiz-block.tsx`, `prisma/schema.prisma` |
| **Dependencies** | P3-007 |
| **Acceptance criteria** | Quiz renders multiple-choice questions; shows correct/incorrect feedback |
| **Complexity** | L |

### P3-011 · Graph — full knowledge graph view
| Field | Value |
|-------|-------|
| **Goal** | `/graph?mode=full` showing all node types with type filter toggles |
| **Files** | `src/app/(explore)/graph/page.tsx`, `src/lib/graph/get-subgraph.ts` |
| **Dependencies** | P2-008 |
| **Acceptance criteria** | All 5 node types render; type toggles filter nodes; cross-domain edges visible |
| **Complexity** | L |

### P3-012 · Graph — edge temporal validity
| Field | Value |
|-------|-------|
| **Goal** | Add `validFrom`/`validUntil` to GraphEdge; filter expired edges |
| **Files** | `prisma/schema.prisma`, `src/lib/graph/get-subgraph.ts` |
| **Dependencies** | P3-009 |
| **Acceptance criteria** | Expired edges hidden from graph; admin can set validity dates |
| **Complexity** | M |

### P3-013 · API — rate limiting middleware
| Field | Value |
|-------|-------|
| **Goal** | Add rate limiting to all public API routes |
| **Files** | `src/lib/api/rate-limit.ts`, API route files |
| **Dependencies** | P1-046 through P1-050 |
| **Acceptance criteria** | 429 returned after threshold; configurable per route |
| **Complexity** | M |

### P3-014 · Test — E2E admin content workflow
| Field | Value |
|-------|-------|
| **Goal** | Playwright test: admin creates lesson, publishes, visible on public site |
| **Files** | `tests/e2e/admin-cms.spec.ts` |
| **Dependencies** | P3-008 |
| **Acceptance criteria** | Full create → publish → verify cycle passes |
| **Complexity** | M |

---

## Phase 4 — Intelligence & Scale

### P4-001 · External data — company financials schema
| Field | Value |
|-------|-------|
| **Goal** | Extend Company metadata schema for revenue, market cap, quarterly updates |
| **Files** | `prisma/schema.prisma`, `src/types/company.ts` |
| **Dependencies** | Phase 3 complete |
| **Acceptance criteria** | Schema supports structured financial data with `asOf` date |
| **Complexity** | S |

### P4-002 · Viz — CompanyMetrics D3 chart
| Field | Value |
|-------|-------|
| **Goal** | Build bar/line chart for company revenue and market cap on detail page |
| **Files** | `src/components/visualizations/d3/company-metrics.tsx` |
| **Dependencies** | P4-001, P2-011 |
| **Acceptance criteria** | Chart renders on company page when financial data exists |
| **Complexity** | L |

### P4-003 · Data pipeline — external company data import script
| Field | Value |
|-------|-------|
| **Goal** | CLI script to import company data from CSV/API snapshot |
| **Files** | `scripts/import-company-data.ts`, `docs/api/data-import.md` |
| **Dependencies** | P4-001 |
| **Acceptance criteria** | Script upserts company metadata; idempotent; logs changes |
| **Complexity** | L |

### P4-004 · Graph analytics — centrality metrics
| Field | Value |
|-------|-------|
| **Goal** | Compute degree centrality for companies; show "most connected" ranking |
| **Files** | `src/lib/graph/analytics.ts`, `src/app/(explore)/companies/page.tsx` |
| **Dependencies** | P2-009 |
| **Acceptance criteria** | Company directory sortable by connection count; top 10 displayed |
| **Complexity** | M |

### P4-005 · Graph analytics — dependency risk scoring
| Field | Value |
|-------|-------|
| **Goal** | Score company risk based on supplier concentration and geographic exposure |
| **Files** | `src/lib/graph/risk-score.ts`, company detail page |
| **Dependencies** | P4-004 |
| **Acceptance criteria** | Risk badge shown on company profile; score explanation tooltip |
| **Complexity** | L |

### P4-006 · Content alerts — stale data detection
| Field | Value |
|-------|-------|
| **Goal** | Admin dashboard widget flagging entities not updated in >90 days |
| **Files** | `src/app/admin/dashboard/page.tsx`, `src/lib/admin/stale-check.ts` |
| **Dependencies** | P3-006 |
| **Acceptance criteria** | Dashboard lists stale companies and edges; links to edit |
| **Complexity** | M |

### P4-007 · Performance — materialized graph views
| Field | Value |
|-------|-------|
| **Goal** | Create materialized view for pre-computed 2-hop subgraphs of top companies |
| **Files** | `prisma/migrations/`, `src/lib/graph/get-subgraph.ts` |
| **Dependencies** | P4-004 |
| **Acceptance criteria** | Graph page load <100ms for top 20 companies; refresh job documented |
| **Complexity** | L |

### P4-008 · i18n — scaffold next-intl
| Field | Value |
|-------|-------|
| **Goal** | Add i18n framework with English default; extract UI strings |
| **Files** | `src/i18n/`, `next.config.ts`, layout files |
| **Dependencies** | Phase 3 complete |
| **Acceptance criteria** | UI strings externalized; adding a new locale requires only translation files |
| **Complexity** | L |

### P4-009 · Analytics — user journey tracking
| Field | Value |
|-------|-------|
| **Goal** | Integrate privacy-friendly analytics (Plausible or Vercel Analytics) |
| **Files** | `src/app/layout.tsx`, `src/lib/analytics.ts` |
| **Dependencies** | P1-023 |
| **Acceptance criteria** | Page views tracked; custom events for lesson completion and graph node clicks |
| **Complexity** | S |

### P4-010 · Test — visual regression for viz components
| Field | Value |
|-------|-------|
| **Goal** | Playwright screenshot tests for pipeline, supply chain, and memory viz |
| **Files** | `tests/e2e/visual-regression.spec.ts` |
| **Dependencies** | P1-057, P2-012 |
| **Acceptance criteria** | Screenshots captured and compared; CI fails on visual diff >1% |
| **Complexity** | M |

### P4-011 · Content versioning — draft snapshots
| Field | Value |
|-------|-------|
| **Goal** | Store lesson version history on publish; admin can view diffs |
| **Files** | `prisma/schema.prisma`, `src/lib/content/versioning.ts`, admin UI |
| **Dependencies** | P3-008 |
| **Acceptance criteria** | Each publish creates version snapshot; admin can view previous version |
| **Complexity** | L |

### P4-012 · Performance — CDN and ISR tuning
| Field | Value |
|-------|-------|
| **Goal** | Audit and optimize revalidation intervals, cache headers, and static asset delivery |
| **Files** | `next.config.ts`, API routes, page files |
| **Dependencies** | P4-007 |
| **Acceptance criteria** | Lighthouse performance >90 on landing; LCP <2s on 4G |
| **Complexity** | M |

---

## Task Index by Phase

| Phase | Task range | Count | Estimated hours |
|-------|-----------|-------|-----------------|
| 0 — Foundation | P0-001 → P0-019 | 19 | ~16h |
| 1 — MVP | P1-001 → P1-059 | 59 | ~58h |
| 2 — Expansion | P2-001 → P2-028 | 28 | ~38h |
| 3 — Platform | P3-001 → P3-014 | 14 | ~22h |
| 4 — Intelligence | P4-001 → P4-012 | 12 | ~18h |
| **Total** | | **132** | **~152h** |

---

## Critical Path (MVP)

The minimum sequence to reach a demoable MVP:

```
P0-001 → P0-006 → P0-007 → P0-012 → P0-013–015
  → P1-001 → P1-005 → P1-006 → P1-003
  → P1-010–012 → P1-026–029 → P1-030
  → P1-008 → P1-015 → P1-032–035 → P1-037
  → P1-013–014 → P1-038–039 → P1-040–043
  → P1-016 → P1-045 → P1-023
```

**MVP milestone:** Complete through **P1-045** for a demoable product. Tasks P1-046–P1-059 are API exposure, polish, and testing.

---

*Update task status in [PROJECT_STATUS.md](./PROJECT_STATUS.md) as work progresses.*
