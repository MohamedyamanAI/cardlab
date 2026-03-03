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

All mutations follow: **Actions** (`src/lib/actions/`) → **Repository** (`src/lib/repository/`) → **Zustand stores** (`src/lib/store/`). Every action returns `ActionResult<T>`, validates with Zod, checks auth + project ownership via `verifyProjectOwnership()` from `auth-utils.ts`. Repository functions use `sanitizeError()` for all thrown errors.

For full architecture details see `docs/core/ARCHITECTURE.md`. For folder structure see `docs/core/STRUCTURE.md`. For gotchas see `docs/core/DECISIONS.md`.

### Key conventions

- **Auth:** Every server action must call `supabase.auth.getUser()` and `verifyProjectOwnership()` before data access.
- **Validation:** Every mutating action validates input with a Zod schema from `src/lib/validations/`.
- **Errors:** Repository throws `sanitizeError()`, actions catch and return `{ success: false, error }`. Never throw to client.
- **Optimistic updates:** Zustand stores save prev state, apply optimistically, rollback on failure.
- **AI:** Vercel AI SDK + Google Gemini. `@ai-sdk/google` cannot mix provider tools with custom tools (see `docs/core/DECISIONS.md`).
- **UI:** shadcn/ui (Radix), Hugeicons, path aliases `@/components`, `@/lib`, `@/hooks`.
