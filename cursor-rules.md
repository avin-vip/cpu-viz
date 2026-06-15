# Cursor Rules — CPU Viz

> Coding behavior, workflow rules, and AI assistant guidelines for this project.

## Project Context

CPU Viz is an interactive semiconductor education platform. Before implementing any feature, read:

1. [PRD.md](./PRD.md) — what we're building and why
2. [ARCHITECTURE.md](./ARCHITECTURE.md) — how it's structured
3. [PROJECT_STATUS.md](./PROJECT_STATUS.md) — current progress

## Development Workflow

For every feature, follow this sequence **without skipping steps**:

1. **Explain** — Describe the feature and its user value
2. **Design** — Architecture decisions, data flow, component boundaries
3. **Plan files** — List files to create or modify
4. **Implement** — Write the code
5. **Verify** — Run linter, type-check, manual test
6. **Update status** — Mark complete in PROJECT_STATUS.md
7. **Suggest improvements** — Note future enhancements

## Code Standards

### General

- **TypeScript strict mode** — No `any` unless justified with a comment
- **Minimize scope** — Smallest correct diff; no drive-by refactors
- **Match conventions** — Read surrounding code before writing new code
- **No placeholders** — Production-ready solutions, not stub architecture
- **Comments sparingly** — Code should be self-explanatory; comment non-obvious logic only

### Next.js Conventions

- App Router only (no Pages Router)
- Prefer **Server Components** for data fetching; mark `"use client"` only when needed (interactivity, hooks, browser APIs)
- Colocate route-specific components in route folders; shared components in `src/components/`
- API routes in `src/app/api/` with Zod validation

### Component Rules

- One component per file (except tightly coupled sub-components)
- Props interfaces named `{ComponentName}Props`
- Export named components (not default) except page.tsx files
- Visualization components accept a `config` prop (schema-driven, not hardcoded data)

### Styling

- TailwindCSS utility classes; use `cn()` for conditional classes
- Design tokens via CSS variables — never hardcode hex colors in components
- Responsive by default; test at `md` and `lg` breakpoints

### Database

- All schema changes via Prisma migrations (`prisma migrate dev`)
- Seed data in `prisma/seed/` — keep seed scripts modular
- Use Prisma singleton from `src/lib/prisma/client.ts`
- Follow [schema conventions](.cursor/rules/schema-conventions.mdc) when available

### Visualizations

| Library | Use For | Don't Use For |
|---------|---------|---------------|
| React Flow | Node-edge graphs, pipelines, flows | Charts, treemaps |
| D3.js | Custom charts, hierarchies, layered diagrams | Simple layout (use CSS) |
| Framer Motion | Page transitions, step animations | Data-driven positioning |

- Dynamic import viz libraries: `const SupplyChainGraph = dynamic(() => import(...), { ssr: false })`
- All viz components must support keyboard navigation
- Provide `aria-label` on interactive viz elements

### API Routes

```typescript
// Pattern for all API routes
import { NextResponse } from 'next/server';
import { z } from 'zod';

export async function GET(request: Request) {
  try {
    // validate, fetch, return
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: '...', code: '...' }, { status: 500 });
  }
}
```

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `SupplyChainGraph.tsx` |
| Utilities | kebab-case | `graph-builder.ts` |
| Hooks | kebab-case with `use-` prefix | `use-lesson-progress.ts` |
| Types | kebab-case | `content.ts` |
| Routes | kebab-case folders | `supply-chain/page.tsx` |

## Git & Commits

- Only commit when explicitly asked
- Conventional commit messages: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
- One logical change per commit

## What NOT To Do

- Do not create README or docs files unless asked
- Do not add tests unless requested or they cover real behavior
- Do not introduce state management libraries (Redux, Zustand) without discussion
- Do not hardcode company/lesson data in components — use DB or seed
- Do not use `console.log` in production code — use structured logging if needed
- Do not skip updating PROJECT_STATUS.md after completing a task

## AI Session Startup Checklist

When resuming work on this project:

1. Read `PROJECT_STATUS.md` for current state
2. Check `ARCHITECTURE.md` for relevant component/schema context
3. Review recent git history if available
4. Confirm which phase/feature is in scope before coding

## Key File Locations

| Purpose | Path |
|---------|------|
| Prisma schema | `prisma/schema.prisma` |
| DB client | `src/lib/prisma/client.ts` |
| Site config | `src/config/site.ts` |
| Navigation | `src/config/navigation.ts` |
| UI primitives | `src/components/ui/` |
| Viz components | `src/components/visualizations/` |
| Content types | `src/types/content.ts` |
| Graph builder | `src/lib/visualizations/graph-builder.ts` |
