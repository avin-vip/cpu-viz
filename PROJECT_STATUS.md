# Project Status — Semiconductor Dependency Explorer

> Last updated: 2026-06-15

## Current Phase

**MVP Prototype — Finance Analyst Dependency Explorer** ✅ **Complete**

## Product Vision (Current)

Interactive semiconductor dependency explorer for finance analysts. Static JSON knowledge graph, no database required for the demo surface. Optimized for working prototype, demo quality, and fast iteration.

**In scope:** graph visualization, search, node details, upstream/downstream tracing, scenario simulations.

**Out of scope:** lessons, auth, stock dashboards, news, AI chat, enterprise backend.

---

## MVP Feature Status

| Feature | Status | Implementation |
|---------|--------|----------------|
| Interactive graph visualization | ✅ | React Flow + dagre layout, reused `SupplyChainGraph` |
| Search | ✅ | `DependencyGraphToolbar` with autocomplete over static nodes |
| Node details panel | ✅ | `GraphDetailPanel` — description, counts, upstream/downstream lists |
| Upstream dependency tracing | ✅ | `traceSubgraph(id, "upstream")` + toolbar button |
| Downstream dependency tracing | ✅ | `traceSubgraph(id, "downstream")` + toolbar button |
| Scenario simulations | ✅ | 4 scenarios in `knowledge-graph.json`, filters graph to highlight set |

---

## Punch List — Remaining Work (Post-MVP)

| Priority | Task | Notes |
|----------|------|-------|
| P2 | Expand graph data (more companies, edges) | Add nodes via `src/data/knowledge-graph.json` only |
| P2 | Scenario impact annotations | Show affected/revenue-at-risk labels on nodes during scenarios |
| P2 | Shareable trace URLs | Extend URL state with `trace=upstream\|downstream` |
| P3 | Remove or archive learn routes | Routes still exist but unlinked from nav |
| P3 | Deprecate DB graph API for demo | `/api/graph/supply-chain` still Prisma-backed; demo uses static JSON |
| P3 | E2E tests for `/graph` | Playwright: search, select node, run scenario |
| P4 | Lighthouse benchmark | Target LCP < 2.5s on `/graph` |

---

## Completed (This Session — Product Pivot)

### Static knowledge graph
- [x] `src/data/knowledge-graph.json` — 18 nodes, 33 edges, 4 scenarios
- [x] Node types: Company, Technology, Product, Process, End Market
- [x] Example nodes: NVIDIA, TSMC, ASML, SK Hynix, HBM3E, CoWoS, EUV, B200, AI Training, Data Centers

### Graph engine (no DB)
- [x] `src/lib/graph/static-graph.ts` — load, search, trace, filter, scenarios
- [x] `src/types/dependency-graph.ts` — node/edge type labels and colors
- [x] Unit tests: `tests/unit/static-graph.test.ts` (6 tests)

### UI
- [x] `DependencyGraphPage` — main explorer surface at `/graph`
- [x] `DependencyGraphToolbar` — search, type filters, trace controls, scenarios
- [x] `DependencyGraphLegend` — node type legend
- [x] Updated `GraphDetailPanel` for all node types

### Product shell
- [x] Landing page pivoted to analyst messaging (no DB dependency)
- [x] `siteConfig` and navigation updated
- [x] `/graph` is **static** — runs without Postgres

---

## Verification

| Criteria | Status |
|----------|--------|
| `npm run build` | ✅ Passes (8 static pages including `/` and `/graph`) |
| `npm test` | ✅ 34/34 passing |
| DB required for demo | ✅ No — `/graph` uses static JSON |
| Core MVP features | ✅ All 6 complete |

---

## Legacy Codebase (Reused, Not Removed)

| Area | Status |
|------|--------|
| Learn routes (`/fundamentals`, `/cpu`) | Present, unlinked from nav |
| Prisma schema + seed | Present; not needed for demo |
| Company pages (`/companies`) | Present; DB-backed |
| Old `SupplyChainGraphPage` | Present; superseded by `DependencyGraphPage` on `/graph` |

---

## Known Issues

| Issue | Impact | Workaround |
|-------|--------|------------|
| Learn/company routes need Postgres | Broken without DB | Use `/graph` for demo |
| E2E not updated for new UI | CI gap | Manual demo on `/graph` |
| Graph edge direction semantics | "Downstream" follows edge direction (supplier → consumer) | Document in UI tooltip (future) |

---

## Session Log

| Date | Summary |
|------|---------|
| 2026-06-15 | Initial architecture docs and folder structure |
| 2026-06-15 | Phase 0 + Phase 1 implemented — education platform MVP |
| 2026-06-15 | P2-001/P2-002 — Technology, Product, Process Prisma models + seed |
| 2026-06-15 | **Product pivot** — static JSON dependency explorer MVP shipped; build + 34 tests green |
