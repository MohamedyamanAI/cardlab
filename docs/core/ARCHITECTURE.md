# Architecture

Cardlab is a tabletop card game design tool. Next.js 16 (App Router), React 19, TypeScript, Supabase (PostgreSQL + Auth + Storage), Tailwind CSS 4, Vercel AI SDK with Google Gemini.

For folder structure and import rules, see [STRUCTURE.md](./STRUCTURE.md).
For implementation decisions and gotchas, see [DECISIONS.md](./DECISIONS.md).

---

## 1. Three-Layer Architecture

All mutations flow through three layers: **Actions → Repository → Store**.

```
┌─────────────────────────────────────────────────┐
│  UI (React Server & Client Components)          │
│  Zustand stores for client state                │
└──────────────┬──────────────────────────────────┘
               │ calls
┌──────────────▼──────────────────────────────────┐
│  Server Actions ("use server")                  │
│  Auth check → ownership check → delegate        │
│  Returns ActionResult<T>                        │
└──────────────┬──────────────────────────────────┘
               │ delegates
┌──────────────▼──────────────────────────────────┐
│  Repository (pure data access)                  │
│  Receives SupabaseClient, runs Postgrest queries│
│  No auth logic                                  │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│  Supabase (PostgreSQL + RLS + Storage)          │
└─────────────────────────────────────────────────┘
```

**Why three layers, not two?** Actions handle auth + error shaping. Repository stays pure and testable. Stores provide optimistic UI. Each layer has one job.

---

## 2. Request Flows

### Page load (server-rendered)

```
Browser → Next.js route → Server Component
  → createClient() (reads cookies)
  → supabase.auth.getUser()
  → repository.getCardsByProject(supabase, projectId)
  → render RSC with data
```

The `(app)` route group layout gates auth — if no user, redirect to `/auth/login`.

### Mutation (optimistic)

```
User clicks "delete card" → Zustand store:
  1. Save prev state:  prevCards = get().cards
  2. Optimistic update: set({ cards: cards.filter(...) })
  3. Call server action: cardActions.deleteCard(cardId)
  4. On failure:        set({ cards: prevCards }); toast.error(...)
```

### AI streaming

```
Client sends POST /api/chat → route handler:
  1. Auth check (supabase.auth.getUser())
  2. Validate model against allowlist
  3. createIdeationAgent({ model, supabase, userId })
  4. Return createAgentUIStreamResponse({ agent, uiMessages, abortSignal: req.signal })
```

Uses Vercel AI SDK's `useChat()` on client, `createAgentUIStreamResponse()` on server. Abort via `req.signal`.

---

## 3. Key Decisions

### 3.1 Supabase Client (Dependency Injection)

Repository functions receive `SupabaseClient` as the first argument — no global client import. This keeps data access decoupled from auth mechanics.

```typescript
// repository — pure data access
export async function getCardsByProject(
  supabase: SupabaseClient,
  projectId: string
): Promise<Card[]> {
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as Card[];
}
```

Server client creation (`src/lib/supabase/server.ts`) uses `@supabase/ssr` with cookie-based sessions. The `setAll` callback has a `try/catch` because it throws when called from Server Components (read-only context) — this is expected and safe to ignore.

### 3.2 Server Actions + ActionResult

Every action returns `ActionResult<T>`, never throws to the client.

```typescript
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
```

Every action follows the same structure:

```typescript
export async function deleteCard(cardId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  // Verify ownership before touching data
  const card = await cardsRepo.getCard(supabase, cardId);
  if (!(await verifyProjectOwnership(supabase, card.project_id, user.id))) {
    return { success: false, error: "Project not found" };
  }

  try {
    await cardsRepo.deleteCard(supabase, cardId);
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to delete card" };
  }
}
```

### 3.3 Zustand (Optimistic Updates)

Three stores: `useCardsStore` (projects, cards, properties, decks), `useLayoutEditorStore` (canvas elements, undo/redo, conditions), `useMediaCacheStore` (signed URL cache).

The optimistic pattern is consistent across all mutations:

```typescript
updateProperty: async (propertyId, input) => {
  const prevProperties = get().properties;

  // Optimistic: apply immediately
  set((state) => ({
    properties: state.properties.map((p) =>
      p.id === propertyId ? { ...p, ...input } : p
    ),
  }));

  // Server: validate and persist
  const result = await propertyActions.updateProperty(propertyId, input);

  // Rollback on failure
  if (!result.success) {
    set({ properties: prevProperties });
    toast.error(result.error);
  }
},
```

### 3.4 AI Intelligence

Uses Vercel AI SDK (`ai` package) with Google Gemini models. Agent factory in `src/lib/intelligence/core/agent.ts` creates `ToolLoopAgent` instances.

```typescript
export function createAgent({ instructions, model, maxSteps, tools }: CreateAgentOptions) {
  const hasCustomTools = tools && Object.keys(tools).length > 0;
  return new ToolLoopAgent({
    model: google(model),
    instructions,
    tools: hasCustomTools
      ? tools
      : { google_search: google.tools.googleSearch({}) },
    stopWhen: stepCountIs(maxSteps),
  });
}
```

**Critical constraint:** `@ai-sdk/google` cannot mix provider-defined tools (e.g., `googleSearch`) with custom function tools. The provider drops custom tools silently when provider tools are present. The factory handles this by choosing one or the other. See [DECISIONS.md](./DECISIONS.md) for details.

### 3.5 Error Handling

Repository errors are sanitized before surfacing to the client via `sanitizeError()` in `src/lib/repository/error-utils.ts`. It maps PostgreSQL error codes to user-friendly messages:

- `PGRST116` → "Resource not found"
- `23xxx` (integrity violations) → "Invalid data provided"
- `42501` (permission denied) → "You do not have permission..."
- Everything else → "Something went wrong. Please try again."

Raw error details (code, message, hint) are logged server-side. Users never see Postgrest internals.

### 3.6 Auth & Route Protection

Middleware (`src/lib/supabase/proxy.ts`) refreshes the session and protects routes:

- **Protected routes** (`/projects`, `/cards`, `/ideator`, etc.) → redirect to `/auth/login` if no user.
- **Auth routes** (`/auth/login`, `/auth/signup`, etc.) → redirect to `/projects` if already authenticated.

Defense in depth: middleware handles route-level gating, server actions verify `getUser()` + project ownership, and Supabase RLS enforces row-level access at the database. All three must pass.

### 3.7 UI Components

- **shadcn/ui** (Radix primitives) in `src/components/ui/`
- **Hugeicons** for icons
- **Aceternity UI** and **Magic UI** for landing page effects
- Zod schemas in `src/lib/validations/` for input validation in server actions
