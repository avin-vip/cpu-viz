# Product Requirements Document — CPU Viz

> Interactive semiconductor education platform teaching chip architecture, manufacturing, and supply chain through visual learning.

## 1. Vision

CPU Viz helps engineers, investors, students, and technical professionals **understand how semiconductors work** — from transistor physics to global supply chains — through interactive, explorable visualizations rather than static textbooks.

## 2. Problem Statement

Semiconductor knowledge is fragmented across textbooks, whitepapers, earnings calls, and industry blogs. Supply chain relationships are especially opaque. Learners struggle to connect:

- **Fundamentals** (how transistors scale) → **Architecture** (how CPUs/GPUs are organized) → **Manufacturing** (how chips are fabricated) → **Economics** (who depends on whom)

CPU Viz unifies these layers into a single navigable learning experience.

## 3. Target Users

| Persona | Goal | Primary Features |
|---------|------|------------------|
| **Engineering student** | Understand CPU/GPU internals | Architecture explorers, memory hierarchy viz |
| **Investor / analyst** | Map company dependencies | Supply chain graph, company profiles |
| **Career switcher** | Learn industry landscape | Fundamentals track, glossary |
| **Practicing engineer** | Refresh adjacent domains | HBM/AI infra, manufacturing flow |

## 4. Core Learning Domains

### 4.1 Semiconductor Fundamentals
- Transistor basics (MOSFET, scaling, Moore's Law)
- Logic gates → combinational/sequential circuits
- Fabrication overview (wafer → die)
- Key metrics: nm process node, transistor density, power/performance

### 4.2 CPU Architecture
- Instruction pipeline (fetch → decode → execute → writeback)
- Cores, caches (L1/L2/L3), coherence
- Branch prediction, out-of-order execution
- ISA concepts (RISC vs CISC at a high level)
- Interactive pipeline diagram with step-through mode

### 4.3 GPU Architecture
- SIMT execution model
- Streaming multiprocessors (SMs), warps, threads
- Memory hierarchy (registers → shared → global)
- Comparison overlay with CPU architecture

### 4.4 Memory Systems
- DRAM vs SRAM
- Memory hierarchy pyramid
- Bandwidth vs latency tradeoffs
- Cache line behavior, prefetching

### 4.5 HBM & AI Infrastructure
- High Bandwidth Memory stack (2.5D/3D packaging)
- AI accelerator topology (GPU clusters, NVLink, InfiniBand)
- Training vs inference memory requirements
- Data center rack-level visualization

### 4.6 Semiconductor Manufacturing
- End-to-end fab flow (design → mask → lithography → etch → packaging)
- EUV vs DUV lithography
- Yield, defect density, binning
- Foundry vs IDM vs fabless model

### 4.7 Supply Chain Relationships
- Interactive node-edge graph of companies, fabs, equipment makers
- Filter by layer: design, EDA, foundry, OSAT, equipment, materials
- Dependency paths (e.g., TSMC → ASML → Zeiss)

### 4.8 Public Company Dependencies
- Company profiles linked to supply chain nodes
- Revenue exposure, geographic risk, customer concentration
- Earnings-driven data updates (future phase)

## 5. Feature Requirements

### 5.1 MVP (Phase 1)

| ID | Feature | Priority | Acceptance Criteria |
|----|---------|----------|---------------------|
| F-01 | Landing page with module overview | P0 | All 8 domains listed with descriptions |
| F-02 | Fundamentals lesson track | P0 | ≥3 lessons with interactive content |
| F-03 | CPU pipeline visualization | P0 | React Flow diagram, step-through animation |
| F-04 | Supply chain graph | P0 | ≥20 companies, filterable by category |
| F-05 | Responsive layout | P0 | Works on desktop and tablet |
| F-06 | Content served from DB | P0 | Lessons and graph data via Prisma/API |
| F-07 | Dark theme UI | P1 | Consistent design system |

### 5.2 Phase 2

| ID | Feature | Priority |
|----|---------|----------|
| F-08 | GPU architecture explorer | P1 |
| F-09 | Memory hierarchy interactive | P1 |
| F-10 | Manufacturing flow timeline | P1 |
| F-11 | HBM stack 3D visualization | P2 |
| F-12 | User progress tracking | P2 |
| F-13 | Search across content | P2 |

### 5.3 Phase 3

| ID | Feature | Priority |
|----|---------|----------|
| F-14 | Authentication (NextAuth) | P2 |
| F-15 | Bookmarks and notes | P3 |
| F-16 | Admin content CMS | P3 |
| F-17 | Real-time company data integration | P3 |
| F-18 | Quiz / assessment mode | P3 |

## 6. Visualization Requirements

| Visualization | Library | Interaction Model |
|---------------|---------|-------------------|
| Supply chain graph | React Flow | Pan, zoom, click node for detail panel, category filter |
| CPU/GPU pipeline | React Flow + Framer Motion | Step-through stages, highlight active stage |
| Memory hierarchy | D3.js (treemap/sunburst) | Hover for metrics, click to drill down |
| Manufacturing flow | React Flow (linear) | Scroll-synced stages with detail cards |
| HBM stack | D3.js (layered) | Rotate/explode layers on hover |
| Company metrics | D3.js (bar/line) | Time range selector |
| Lesson transitions | Framer Motion | Page and section enter/exit animations |

## 7. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | LCP < 2.5s on 4G; visualization bundles code-split per route |
| **Accessibility** | WCAG 2.1 AA; keyboard navigation for all interactive viz |
| **SEO** | SSR for lesson pages; metadata per route |
| **Maintainability** | Modular viz components; content schema-driven |
| **Scalability** | DB-backed content; CDN for static assets |
| **Browser support** | Chrome, Firefox, Safari, Edge (last 2 versions) |

## 8. Content Model (Conceptual)

```
Module (e.g., "CPU Architecture")
  └── Track (e.g., "Pipeline Deep Dive")
       └── Lesson (e.g., "Fetch Stage")
            └── ContentBlock[] (text, diagram, quiz, viz-config)
```

Supply chain data model:

```
Company ──depends_on──► Company
Company ──operates──► Facility (fab, OSAT, R&D)
Company ──produces──► ProductCategory
```

## 9. Success Metrics

| Metric | Target (6 months post-launch) |
|--------|-------------------------------|
| Monthly active users | 1,000 |
| Avg session duration | > 5 min |
| Lesson completion rate | > 40% |
| Supply chain graph interactions/session | > 3 node clicks |

## 10. Out of Scope (v1)

- Mobile-native apps
- Real-time stock price integration
- User-generated content / forums
- Multi-language support (i18n scaffold only)
- Offline mode

## 11. Open Questions

1. **Auth timing** — Anonymous progress via localStorage first, or require accounts from day one?
2. **Content sourcing** — Manual curation vs licensed datasets for company data?
3. **3D viz depth** — CSS 3D transforms sufficient for HBM, or Three.js later?
4. **Deployment target** — Vercel + Neon/Supabase Postgres, or self-hosted?

*Decisions tracked in [ARCHITECTURE.md](./ARCHITECTURE.md).*
