# Folder Structure

supabase gen types typescript --project-id uowxkpfwbmxuinfvysij > lib/supabase/database.types.ts

## Top-Level Split

```
src/
├── app/            → Routes, pages, layouts (presentation)
├── components/     → React UI components (presentation)
├── hooks/          → Custom React hooks
└── lib/            → Pure business logic, no JSX (business + data)
```

Nothing in `lib/` renders UI. Nothing in `components/` talks to the database.

Supporting directories:

```
docs/               → Architecture documentation
  core/             → Core architecture (ARCHITECTURE.md, DECISIONS.md, STRUCTURE.md)
  db/               → Database docs (schema.sql, JSONB.md)
  intelligence/     → AI system docs (ARCHITECTURE.md)
scripts/            → CLI utilities (seed.ts)
tests/              → Test suites
public/             → Static assets
```

## Route Groups

Routes are organised by access level using Next.js route groups:

```
app/
├── (app)/          → Authenticated user routes (auth guard + app shell in layout)
├── (public)/       → Public routes (landing, design showcase)
├── auth/           → Authentication routes (login, signup, password reset, route handlers)
└── api/            → API endpoints
```

Each group has its own `layout.tsx`:
- `(app)` layout checks auth, redirects to `/auth/login` if unauthenticated, provides sidebar + header
- `(public)` layout provides the public page shell
- `auth/` layout provides a centered card-style wrapper

### App Routes

The `(app)` layout provides auth guard + the app shell (sidebar, header with user info):

```
(app)/
├── layout.tsx      → Auth guard + sidebar + header
├── projects/       → /projects (project management)
├── cards/          → /cards (card library)
├── ideator/        → /ideator (idea generation)
├── generator/      → /generator (image generation)
│   └── _components/  → Client components (generator-client, tabs, gallery)
├── tester/         → /tester (playtesting)
├── print-ship/     → /print-ship (print & shipping)
└── docs/           → /docs (documentation)
```

### Public Routes

```
(public)/
├── layout.tsx      → Public page shell
├── page.tsx        → / (landing page)
└── design/         → /design (component showcase)
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

### API Routes

```
api/
└── chat/route.ts   → AI chat streaming endpoint
```

## Components

Split by scope and origin:

```
components/
├── ui/             → Generic primitives (button, input, dialog, card) — shadcn/ui
├── magicui/        → Magic UI component library (effects, animations, backgrounds)
├── aceternity/     → Aceternity UI component library (cards, heroes, backgrounds)
├── shared/         → Cross-feature components (sidebar, sign-out button)
├── features/       → Feature-specific components (one subfolder per feature)
│   ├── cards/      → Card library (grid, cells, preview, import, export)
│   │   ├── grid/       → Data grid (columns, cells, headers, context menus)
│   │   │   └── cells/  → Cell renderers by property type (text, number, boolean, color, image, select)
│   │   ├── preview/    → Card visual preview (layout preview, export renderer, media picker)
│   │   ├── import/     → CSV/JSON import wizard (steps: source, target, mapping, result)
│   │   ├── design-import/ → Illustrator (.ai) import wizard (upload, AI analysis, review, result)
│   │   └── export/     → Export dialog (PDF, spritesheet, card grid previews)
│   ├── layouts/    → Layout editor (canvas, panels, renderers, rich text)
│   │   ├── canvas/           → Canvas viewport, element rendering, zoom, rulers, snap guides, marquee
│   │   ├── panels/           → Properties panel, elements panel, alignment toolbar
│   │   ├── property-sections/ → Property editor sections (position, appearance, text, shape, image, shadow, gradient, binding, canvas size)
│   │   ├── element-renderers/ → Render functions by element type (text, shape, image)
│   │   └── rich-text/        → Inline rich text editor + TipTap setup
│   ├── ideator/    → AI ideation chat (client, history, document preview)
│   └── docs/       → Documents editor (list, editor, TipTap setup)
└── auth/           → Authentication form components
```

Import rules:

| Tier | Imports from | Imported by |
|------|-------------|-------------|
| `ui/`, `magicui/`, `aceternity/` | Nothing in the project | Everything |
| `shared/` | `ui/`, `magicui/`, `aceternity/` | Page routes, feature components |
| `features/` | `ui/`, `shared/`, `lib/` | Page routes only (not other features) |
| `auth/` | `ui/`, `lib/` | Auth page routes only |

## Hooks

```
hooks/
├── use-media-resolution.ts   → Track image dimensions for media elements
└── use-outside-click.tsx      → Detect clicks outside a ref (used by Aceternity)
```

## lib/

Organised by domain, with cross-cutting layers at the top:

```
lib/
├── actions/        → Server Actions (mutations for all domains)
│   ├── auth-utils.ts → Shared verifyProjectOwnership helper
│   ├── cards.ts, decks.ts, projects.ts, properties.ts
│   ├── layouts.ts, media.ts, documents.ts, chats.ts
│   ├── image.ts    → AI image generation action
│   └── import.ts   → CSV/JSON import action
├── repository/     → Data access (queries for all domains)
│   ├── cards.ts, decks.ts, projects.ts, properties.ts
│   ├── layouts.ts, media.ts, documents.ts, chats.ts
│   └── error-utils.ts
├── store/          → Client-side state (Zustand)
│   ├── cards-store.ts          → Projects, cards, properties, decks
│   ├── layout-editor-store.ts  → Canvas elements, undo/redo, conditions
│   └── media-cache-store.ts    → Signed URL cache
├── intelligence/   → AI integration (Vercel AI SDK + Google Gemini)
│   ├── core/       → Agent factory, providers, shared types
│   └── features/   → Feature-specific AI logic
│       ├── ideation/           → Chat-based ideation (tools, logic, types)
│       ├── image-generation/   → Image generation (logic, types)
│       └── design-import/      → Illustrator design analysis (logic, schema)
├── types/          → Shared type definitions
│   ├── canvas-elements.ts      → Canvas element types
│   ├── conditions.ts           → Layout condition types
│   ├── export.ts               → Export config types
│   └── import.ts               → Import config types
├── types.ts        → Top-level shared types (ActionResult, etc.)
├── validations/    → Zod schemas for input validation
│   ├── cards.ts, properties.ts, layouts.ts, decks.ts, projects.ts
│   ├── documents.ts, chats.ts
├── supabase/       → Database client config
│   ├── server.ts, client.ts, proxy.ts
│   └── database.types.ts       → Auto-generated DB types
├── utils/          → Generic utilities
│   ├── canvas-element-factory.ts → Create canvas elements
│   ├── condition-engine.ts      → Evaluate layout conditions
│   ├── snap-engine.ts           → Snap guide calculations
│   ├── import-parser.ts         → Parse CSV/JSON imports
│   ├── export-data.ts           → Export card data
│   ├── slugify.ts               → String slugification
│   ├── utils.ts                 → General helpers (cn, etc.)
│   ├── export/                  → Export pipeline
│   │   ├── render-card.ts       → Render card to canvas
│   │   ├── generate-pdf.ts      → PDF generation
│   │   ├── generate-spritesheet.ts → Spritesheet generation
│   │   ├── resolve-cards.ts     → Resolve card data for export
│   │   ├── download.ts          → Download helpers
│   │   └── index.ts             → Export barrel
│   └── design-import/           → Design file parsing pipeline
│       ├── illustrator/         → Adobe Illustrator (.ai) format
│       │   ├── pdf-parser.ts    → Core PDF parsing, text extraction, page rendering
│       │   ├── native-text.ts    → Native PostScript Tx text extraction
│       │   └── pdf-images.ts    → Embedded image extraction, placements, cropping
│       └── index.ts             → Re-exports
└── client/         → Browser-only utilities (empty)
```

## Tests

```
tests/
├── integration/    → Real DB tests (requires live backend)
├── unit/           → Mocked tests (no external deps)
├── e2e/            → End-to-end browser tests
└── fixtures/       → Static test data (e.g. csv/monsters.csv)
```

## Proxy (Middleware)

`src/proxy.ts` handles session refresh and route protection:

- Refreshes Supabase auth session on every request
- Redirects unauthenticated users away from protected routes (`/projects`, `/cards`, `/ideator`, `/generator`, `/tester`, `/print-ship`, `/docs`) → `/auth/login`
- Redirects authenticated users away from auth routes (`/auth/*`) → `/projects`
