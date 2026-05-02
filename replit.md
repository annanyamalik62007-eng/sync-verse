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
- `pnpm --filter @workspace/scripts run seed:syncverse` — seed SYNCVERSE demo data (12 users, 1 squad, 7 events)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## SYNCVERSE AI

Real-time campus connection/collaboration engine for college students.

- Web app: `artifacts/syncverse` (React + Vite + Tailwind + wouter + framer-motion + lucide), served at `/`.
- API: `artifacts/api-server` (Express 5 + Drizzle + Postgres), served at `/api`.
- Schema: `lib/db/src/schema/{users,squads,messages,events}.ts` — `users`, `squads`, `squad_members`, `messages`, `events`, `event_rsvps` (FKs cascade).
- API contract: `lib/api-spec/openapi.yaml`, codegen → `@workspace/api-zod`, `@workspace/api-client-react`.
- Matching: token Jaccard over intent + zone/time/energy/college/major weighting (`artifacts/api-server/src/lib/matching.ts`).
- Identity: **anonymous single user** via `localStorage["syncverse_user_id"]`. By design there is no auth — `userId` is passed as a request parameter, so the API trusts the client. This is acceptable for the prototype; a production deployment would need to bind userId to a server-issued session token to prevent IDOR (reading other users' DMs, spoofing RSVPs/hosts/messages).
- Pages: `/` landing + onboarding hero (live counters, trending, animated steps), `/feed` live signals + insights + FOMO, `/matches` (with Message CTA), `/messages` thread list, `/messages/:userId` chat, `/squads` (suggested + active), `/events` per-college events with RSVP + create dialog, `/major` per-major hub (peers + zone breakdown + top intents + most-active majors bar chart), `/zone/:zone` zone deep-dive.
- Suggested squads: id format `suggested-<uuid>_<uuid>_<uuid>` so on-join the full proposed member set is materialized.
- Direct messages: simple polling (`refetchInterval` 4s in chat, 6s in thread list); thread previews derived server-side from latest message per other-user.
- Events: filtered by user's college; host auto-RSVPs on create; RSVP endpoint toggles.
- Major hub: derives peers (same major, optionally same college), per-zone breakdown, and a top-intents word-phrase summary; college snapshot returns squad count scoped to the college's members and hydrates upcoming-event attendees.
