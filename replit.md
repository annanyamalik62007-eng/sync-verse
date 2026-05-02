# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/scripts run seed:syncverse` — seed SYNCVERSE demo data (12 users + 1 squad)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## SYNCVERSE AI

Real-time campus connection/collaboration engine for college students.

- Web app: `artifacts/syncverse` (React + Vite + Tailwind + wouter), served at `/`.
- API: `artifacts/api-server` (Express 5 + Drizzle + Postgres), served at `/api`.
- Schema: `lib/db/src/schema/{users,squads}.ts` — `users`, `squads`, `squad_members` (FKs cascade).
- API contract: `lib/api-spec/openapi.yaml`, codegen → `@workspace/api-zod`, `@workspace/api-client-react`.
- Matching: token Jaccard over intent + zone/time/energy/college/major weighting (`artifacts/api-server/src/lib/matching.ts`).
- Identity: anonymous single user via `localStorage["syncverse_user_id"]` (no auth, by spec).
- Pages: `/` onboarding, `/feed` live signals + insights + FOMO, `/matches`, `/squads` (suggested + active), `/zone/:zone` zone deep-dive.
- Suggested squads: id format `suggested-<uuid>_<uuid>_<uuid>` so on-join the full proposed member set is materialized.
