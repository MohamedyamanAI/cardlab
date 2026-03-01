# Folder Structure

## Top-Level Split

```
src/
├── app/            → Routes, pages, layouts (presentation)
├── components/     → React UI components (presentation)
└── lib/            → Pure business logic, no JSX (business + data)
```

Nothing in `lib/` renders UI. Nothing in `components/` talks to the database.

Supporting directories:

```
docs/               → Architecture documentation
scripts/            → CLI utilities (seeding, codegen)
tests/              → Test suites
public/             → Static assets
```

## Route Groups

Routes are organised by access level using Next.js route groups:

```
app/
├── (app)/          → Authenticated user routes (auth guard + app shell in layout)
├── (public)/       → Public routes (landing, about, legal)
├── auth/           → Authentication routes (login, signup, password reset, route handlers)
└── api/            → API endpoints
```

Each group has its own `layout.tsx`:
- `(app)` layout checks auth, redirects to `/auth/login` if unauthenticated, provides sidebar + header
- `(public)` layout provides the public page shell
- `auth/` layout provides a centered card-style wrapper

### App Routes

The `(app)` layout provides auth guard + the app shell (sidebar with Games and Cards, header with user info):

```
(app)/
├── layout.tsx      → Auth guard + sidebar + header
├── games/          → /games
└── cards/          → /cards
```

### Auth Routes

All auth routes share the `/auth/` URL prefix and a centered card layout:

```
auth/
├── layout.tsx              → Centered card layout
├── login/                  → /auth/login
├── signup/                 → /auth/signup
├── forgot-password/        → /auth/forgot-password
├── update-password/        → /auth/update-password
├── check-email/            → /auth/check-email
├── error/                  → /auth/error
├── confirm/route.ts        → /auth/confirm (email confirmation token handler)
└── callback/route.ts       → /auth/callback (OAuth code exchange)
```

## Components

Split into four tiers by scope:

```
components/
├── ui/             → Generic primitives (button, input, dialog, card)
├── shared/         → Cross-feature components (navbar, sidebar, footer)
├── features/       → Feature-specific components (one subfolder per feature)
│   ├── games/
│   └── cards/
└── auth/           → Authentication form components
```

Import rules:

| Tier | Imports from | Imported by |
|------|-------------|-------------|
| `ui/` | Nothing in the project | Everything |
| `shared/` | `ui/` | Page routes, feature components |
| `features/` | `ui/`, `shared/`, `lib/` | Page routes only (not other features) |
| `auth/` | `ui/`, `lib/` | Auth page routes only |

## lib/

Organised by domain, with cross-cutting layers at the top:

```
lib/
├── actions/        → Server Actions (mutations for all domains)
├── repository/     → Data access (queries for all domains)
├── supabase/       → Database client config (server, browser, proxy)
├── games/          → Game domain engine (schemas, processing)
├── cards/          → Card domain engine
├── store/          → Client-side state (Zustand)
├── client/         → Browser-only utilities
└── utils/          → Generic utilities
```

### Data Flow

```
Page Routes / API Routes  (app/)
  ↓ imports actions for mutations
  ↓ imports repository for reads
         ↓                ↓
  lib/actions/      lib/repository/
  (mutations)       (queries)
         ↓                ↓
         └────────────────┘
                  ↓
           lib/supabase/
           (DB clients)
```

- **Actions** call repository functions — they never construct Supabase queries directly
- **Repository** is the only code that touches the database query builder
- **Domain folders** (games, cards) contain schemas, processing logic, constants — no DB access

### Repository Functions

Every repository function receives `SupabaseClient<Database>` as its first parameter (dependency injection):

```typescript
export async function getGamesByUser(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Game[]> { ... }
```

## Tests

```
tests/
├── integration/    → Real DB tests (requires live backend)
├── unit/           → Mocked tests (no external deps)
├── e2e/            → End-to-end browser tests
└── fixtures/       → Static test data
```

## Proxy (Middleware)

`src/proxy.ts` handles session refresh and route protection:

- Refreshes Supabase auth session on every request
- Redirects `/` to `/games` (authenticated) or `/auth/login` (unauthenticated)
- Redirects unauthenticated users away from protected routes (`/games`, `/cards`) → `/auth/login`
- Redirects authenticated users away from auth routes (`/auth/*`) → `/games`
