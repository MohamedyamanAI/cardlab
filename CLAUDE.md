# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (localhost:3000)
pnpm build        # Production build
pnpm lint         # ESLint (v9, flat config)
pnpm seed         # Seed database (tsx scripts/seed.ts)
```

No test runner is configured yet.

## Architecture

Cardlab is a **tabletop card game design tool** built with Next.js 16 (App Router), React 19, TypeScript, Supabase (PostgreSQL + Auth + Storage), and Tailwind CSS 4.

### Data flow: Actions → Repository → Store → UI

All mutations follow a three-layer pattern:

1. **Server Actions** (`src/lib/actions/`) — `"use server"` functions that verify auth via `supabase.auth.getUser()`, check project ownership, then delegate to the repository layer. Every action returns `ActionResult<T>` (`{ success: true, data } | { success: false, error }`).

2. **Repository** (`src/lib/repository/`) — Pure data-access functions that take a `SupabaseClient` and execute Postgrest queries. No auth logic here.

3. **Zustand stores** (`src/lib/store/`) — Client-side state that calls actions and applies optimistic updates with rollback on failure. Three stores: `useCardsStore` (projects/cards/properties), `useLayoutEditorStore` (canvas elements, undo/redo, conditions), `useMediaCacheStore` (signed URL cache).

### Routing

- `src/app/(app)/` — Protected routes (auth-gated in layout). Contains: `cards`, `projects`, `ideator`, `generator`, `tester`, `print-ship`, `docs`.
- `src/app/(public)/` — Public pages (landing, design showcase).
- `src/app/auth/` — Login, signup, password reset, callback.
- `src/app/api/chat/` — AI chat streaming endpoint.

### Database

PostgreSQL via Supabase with RLS. Schema lives in `supabase/migrations/`. Auto-generated types in `src/lib/supabase/database.types.ts`. Core tables: `projects`, `cards` (JSONB `data` column), `properties` (column definitions with `type` enum), `layouts` (JSONB `canvas_elements` and `condition`), `media`, `ai_chats`, `ai_chat_messages`.

### Layout system

Layouts are visual card templates with a canvas editor (`src/components/features/layouts/`). Key concepts:
- Canvas elements are typed in `src/lib/types/canvas-elements.ts` and created via `src/lib/utils/canvas-element-factory.ts`.
- Layouts support **conditions** (`src/lib/types/conditions.ts`) evaluated by `src/lib/utils/condition-engine.ts` — e.g., "use this layout when card HP > 100". First matching layout wins.

### AI integration

Uses Vercel AI SDK (`ai` package) with Google Gemini models. Agent factory in `src/lib/intelligence/core/agent.ts` creates `ToolLoopAgent` instances. Streaming responses via `createAgentUIStreamResponse()`. Features: ideation chat, image generation. See `docs/core/INTELLIGENCE.md` for full details.

**Critical:** `@ai-sdk/google` cannot mix provider-defined tools (e.g. `googleSearch`) with custom function tools — the provider drops custom tools silently. See `docs/core/DECISIONS.md`.

### UI components

- **shadcn/ui** (radix-maia style, Hugeicons icon library) — `src/components/ui/`
- **Aceternity UI** and **Magic UI** — `src/components/aceternity/` and `src/components/magicui/`
- Feature components — `src/components/features/{cards,layouts,ideator}/`
- Path aliases: `@/components`, `@/lib`, `@/hooks`

### Validation

Zod schemas in `src/lib/validations/` for input validation in server actions.

### Auth

Supabase Auth with `@supabase/ssr` for cookie-based sessions. Server client: `src/lib/supabase/server.ts`. Client: `src/lib/supabase/client.ts`. Every server action must call `supabase.auth.getUser()` and verify project ownership before data access.
