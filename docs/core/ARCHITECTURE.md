# Complete Architecture Guide: AI-Powered Next.js Startup Stack

Reusable architecture patterns for building AI-powered full-stack apps with Next.js, Supabase, and TypeScript.

## Table of Contents
1. Executive Summary
2. Architecture Overview
3. Technology Choices & Rationale
   - 3.6 AI Intelligence: Generators & SSE
   - 3.7 Real-Time Features: WebSocket vs SSE
   - 3.8 Internationalization: next-intl
   - 3.9 UI Components: shadcn/ui
   - 3.10 Icon Library: Hugeicons
   - 3.11 Intelligence Lifecycle Management
   - 3.12 Error Handling & Observability
4. Implementation Patterns
5. Dos & DONTs
6. File Structure
7. Data Flow Examples
8. Migration Checklist
9. Key Metrics to Track
10. Future Optimizations

---

## 1. Executive Summary

This document describes the **complete architecture** for an AI-powered startup, built on **Next.js** with a focus on:
- **Performance:** Server-first rendering, zero JavaScript for static content
- **Scalability:** Decoupled agents that work everywhere (UI, API, background jobs)
- **Developer Experience:** Type-safe end-to-end, minimal boilerplate
- **Real-time AI:** SSE streaming for live agent progress updates

This stack is production-ready and designed to scale from MVP to Series B.

---

## 2. Architecture Overview

### 2.1 The Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER                                          │
│ ┌──────────────────────┐          ┌──────────────────────┐ │
│ │ Server Components    │          │ Client Components    │ │
│ │ (Data Fetching)      │          │ (Interactivity)      │ │
│ │ - Pages              │          │ - Layouts            │ │
│ │ - Static Content     │          │ - Real-time UI       │ │
│ └──────────────────────┘          └──────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ BUSINESS LOGIC LAYER                                        │
│ ┌──────────────────────┐  ┌──────────────────────┐          │
│ │ Server Actions       │  │ Workflows            │          │
│ │ (lib/actions)        │  │ (lib/workflows)      │          │
│ │ - Mutations          │  │ - Orchestration      │          │
│ │ - Form Handling      │  │ - State & Effects    │          │
│ └──────────────────────┘  └──────────┬───────────┘          │
│                                      │                      │
│                           ┌──────────▼───────────┐          │
│                           │ AI Intelligence      │          │
│                           │ (lib/intelligence)   │          │
│                           │ - Pure Logic         │          │
│                           │ - No Side Effects    │          │
│                           └──────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ DATA ACCESS LAYER                                           │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ Repository Pattern (lib/repository)                 │     │
│ │ - users.ts, products.ts, orders.ts, etc.            │     │
│ │ - All Supabase queries encapsulated here            │     │
│ │ - Imported by: Server Components, Actions, Workflows│     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ EXTERNAL SERVICES                                           │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│ │ Supabase DB  │  │ OpenAI API   │  │ Reducto API  │        │
│ │ (PostgreSQL) │  │ (or Claude)  │  │ (Doc Extract)│        │
│ └──────────────┘  └──────────────┘  └──────────────┘        │
│ ┌──────────────┐                                            │
│ │ Other APIs   │                                            │
│ │ (Stripe, etc)│                                            │
│ └──────────────┘                                            │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Request Flow (Different Scenarios)

#### Scenario A: Initial Page Load (Data Fetch)
```
Browser → Next.js Server
  ↓
Server Component Renders
  ↓
Calls Repository (lib/repository/users.ts)
  ↓
Supabase Query Executes
  ↓
HTML with Data Sent to Browser
  ↓
Browser Hydrates with JS (only for islands)
```
**Result:** No loading states, no waterfalls, instant display.

#### Scenario B: Form Submission (Mutation)
```
User Submits Form (Client Component)
  ↓
Server Action Called (lib/actions/users.ts)
  ↓
Validation Happens on Server
  ↓
Repository Updates Supabase
  ↓
Path Revalidated (ISR)
  ↓
UI Updates with New Data
```
**Result:** Type-safe mutation, no fetch boilerplate, automatic cache invalidation.

#### Scenario C: AI Agent Execution (Real-time Streaming)
```
User Clicks "Analyze" (Client Component)
  ↓
SSE Connection Opens to /api/chat or /api/generate
  ↓
API Route Calls Intelligence Feature (lib/intelligence/features/{feature}/logic.ts)
  ↓
Agent Yields Events:
  - "thinking" → UI shows thinking state
  - "analyzing" → UI shows progress
  - "complete" → UI shows result
  ↓
Client Receives Streamed Events in Real-time
  ↓
Frontend Updates with Each Event
```
**Result:** User sees live progress, not just "loading...".

#### Scenario D: Pre-Auth File Processing (Public Landing Page)

For example, a file extraction feature where unauthenticated users can process files before signing in:

```
User Uploads File on Public Landing Page (Client Component)
  ↓
POST /api/process-public (No Auth — SSE Streaming)
  ↓
Calls processData() Directly (Pure Intelligence, No Workflow)
  ↓
Client Receives SSE Progress Events → Shows Progress in Upload Zone
  ↓
On Complete: Save File + Result to IndexedDB (idb-keyval)
  ↓
User Signs In Naturally
  ↓
PendingDataHydrator (in (app) Layout) Runs on Mount
  ↓
Browser Supabase Client Uploads File to Storage
  ↓
Server Action Creates DB Record (Small Metadata Only)
  ↓
IndexedDB Entry Cleared
```
**Result:** Users experience the full processing flow before signing in. Data persists in the browser and is automatically promoted to the server after authentication.

**Why no workflow?** The public endpoint has no side effects (no DB, no storage), so it calls the intelligence function directly — following the Functional Core / Imperative Shell pattern. The workflow layer is only used by the authenticated endpoint which needs to orchestrate storage + DB writes.

**Key files:**
- `app/api/{feature}-public/route.ts` — Public SSE endpoint
- `lib/client/pending-data.ts` — IndexedDB utilities (save, get, remove, TTL)
- `components/shared/pending-data-hydrator.tsx` — Post-auth persistence
- `lib/actions/{feature}.ts` — Server action for DB persistence

---

## 3. Technology Choices & Rationale

### 3.1 Framework: Next.js (App Router)

**Why Next.js?**
- Server Components (RSC) = zero JavaScript for data fetching
- Server Actions = no API boilerplate for mutations
- Built-in caching (ISR) = automatic performance
- Vercel deployment = seamless DX

**Why NOT Pages Router?**
- Pages Router is legacy; App Router is the future
- Missing Server Components
- No Server Actions

**Why NOT a different framework (Remix, SvelteKit, etc.)?**
- Smaller ecosystems = fewer libraries and integrations
- Agent/streaming support is weaker
- We optimize for startup velocity

---

### 3.2 Rendering Strategy: Server-First (RSC + Islands)

**Why Server Components for Data Fetching?**

| Aspect | CSR (Old) | Server Components (New) |
| :--- | :--- | :--- |
| **Bundle Size** | +50KB (fetch logic) | 0KB (server-only) |
| **Latency** | 3 hops (Client → API → DB) | 1 hop (Server → DB) |
| **Waterfall** | `<Page>` renders empty → calls `useEffect` → fetches data | Data ready when page renders |
| **Security** | API keys exposed in network tab | API keys hidden on server |
| **SEO** | Dynamic content (bad for bots) | Pre-rendered HTML (good for bots) |

**Why Client Components Only for Interactivity?**
- Keeps JavaScript minimal (smaller bundles)
- Hydration faster (less JS to parse)
- State management simpler (Zustand for UI only)

This is called "**Islands Architecture**" — islands of interactivity in a sea of static content.

---

### 3.3 Database & Data Access: Supabase Client + Repository Pattern

**Decision:** Use Supabase Client (with auto-generated types) instead of Drizzle ORM.

**Why Supabase Client?**
```typescript
// Auto-generated types from database schema
import { Database } from '@/lib/supabase/database.types'

const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)

// data is strongly typed: User | null
// TypeScript knows what fields exist
```

| Feature | Supabase Client | Drizzle ORM |
| :--- | :--- | :--- |
| **Setup Time** | 5 minutes | 30 minutes |
| **Type Safety** | Auto-generated | Manual schema |
| **Learning Curve** | Gentle | Steep |
| **Complex Queries** | RPC (Postgres functions) | Native support |
| **Bundle Size** | ~15KB | ~25KB |
| **For Startups** | 95% sufficient | Overkill |

**Why Repository Pattern?**
- **Single Responsibility:** All user queries in `lib/repository/users.ts`
- **Reusability:** Same function used by Server Components, Actions, and Agents
- **Testability:** Can mock repository in unit tests
- **Flexibility:** Can swap Supabase for another provider without rewriting components

**Dependency Injection Pattern:**

Repository functions receive `SupabaseClient` as the **first parameter**. This is critical for:
- **Streaming contexts (SSE):** `cookies()` from `next/headers` loses async context inside generators
- **Testability:** Easy to pass a mock client
- **Efficiency:** One client per request, shared across all repository calls

```typescript
// lib/repository/users.ts
import { SupabaseClient } from '@supabase/supabase-js'
import { sanitizeError } from './error-utils'

export async function getUser(
  supabase: SupabaseClient<Database>,
  id: string
) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw sanitizeError(error, 'getUser', { userId: id })
  }

  return data
}

// Usage in Server Action:
export async function updateProfile(formData: FormData) {
  const supabase = await createClient()  // Create once
  const user = await getUser(supabase, userId)  // Pass to repo
  await updateUser(supabase, userId, updates)   // Reuse same client
}

// Usage in Streaming Workflow:
export async function* processFile(file, userId, supabase) {
  // supabase passed from API route (created before streaming starts)
  const record = await createRecord(supabase, data)
}
```

**Why NOT create client inside repository functions?**

```typescript
// ❌ BAD: Creates client internally
export async function getUser(id: string) {
  const supabase = await createClient()  // Uses cookies() - fails in streaming!
  ...
}

// ✅ GOOD: Receives client as parameter
export async function getUser(supabase: SupabaseClient, id: string) {
  ...  // Works everywhere
}
```

When `cookies()` is called inside an async generator (SSE streaming), the Next.js request context is lost, causing auth failures. Creating the client at the API route level (before streaming) and passing it down solves this.

**Why NOT Drizzle?**
- Extra layer of abstraction for a startup that needs speed
- Supabase's auto-generated types give you 99% of Drizzle's safety
- If we need raw SQL later, we can add Drizzle alongside Supabase (not a replacement)

**Database Migrations:**

All schema changes are managed through Supabase CLI migrations:

```bash
# Create a new migration
supabase migration new add_analytics_table

# Apply migrations locally
supabase db reset

# Push to production
supabase db push

# Generate TypeScript types
supabase gen types typescript --project-id <your-project-id> > lib/supabase/database.types.ts
```

**Directory Structure:**

| Directory | Purpose | Examples |
|-----------|---------|----------|
| `/supabase/migrations/` | Production database schema (SQL) | Timestamped migration files |
| `/lib/supabase/` | Application TypeScript clients | `client.ts`, `server.ts`, `database.types.ts` |
| `/docs/db/` | Schema documentation | Annotated reference for developers |

**Workflow:**
1. Create migration file in `/supabase/migrations/`
2. Apply with `supabase db push`
3. Generate types: `supabase gen types` → `/lib/supabase/database.types.ts`
4. Use types in `/lib/repository/` and throughout the app

---

### 3.4 Mutations: Server Actions (Not API Routes)

**Old Way: API Routes**
```typescript
// app/api/users/route.ts
export async function POST(request: Request) {
  const { name, email } = await request.json()
  // 20 lines of boilerplate...
  const user = await db.insert(users).values({ name, email })
  return Response.json(user)
}

// components/CreateUserForm.tsx
const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email })
})
const user = await response.json()
// No type safety between client and server
```

**New Way: Server Actions**
```typescript
// lib/actions/users.ts
'use server'

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string

  const user = await userRepo.createUser(name, email)
  revalidatePath('/users')
  return user
}

// components/CreateUserForm.tsx
<form action={createUser}>
  <input name="name" required />
  <input name="email" type="email" required />
  <button type="submit">Create</button>
</form>

// Arguments and return type are automatically typed
```

**Why Server Actions?**
- No URL management (not HTTP)
- Type-safe from client to server
- Automatic serialization
- Works with forms and JavaScript
- Less boilerplate

**Why NOT API Routes (for mutations)?**
- Extra boilerplate (routing, parsing, serialization)
- Manual typing required
- Easier to make mistakes (status codes, headers)

**Exception:** API Routes are still used for:
- Third-party webhooks (Stripe, GitHub)
- SSE streaming (agent progress)
- Public APIs

---

### 3.5 State Management: Zustand (UI) + Server (Data)

**Decision:** Split state into two domains.

| State Type | Storage | Tool | Example |
| :--- | :--- | :--- | :--- |
| **UI State** | Client Memory | Zustand | Sidebar open/closed, Modal visible |
| **Data State** | Server + Cache | Server Components | Users, Products, Orders |
| **Form State** | Client Memory | React Hooks | Input values while typing |
| **URL State** | URL Bar | Next.js Router | Filters, Pagination, Search |
| **Pending Data** | IndexedDB | idb-keyval | Pre-auth processing (bridged to server after login) |

**Why NOT React Context?**
```typescript
// ❌ BAD: Context re-renders entire tree
const [user, setUser] = useState(null)
export const UserContext = createContext()

<UserContext.Provider value={{ user, setUser }}>
  <ExpensiveComponent />  // Re-renders even if user didn't change
  <Table />              // Re-renders
  <Sidebar />            // Re-renders
</UserContext.Provider>
```

**Why Zustand?**
```typescript
// ✅ GOOD: Only components using the store re-render
export const useUIStore = create((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen }))
}))

// Only <Sidebar /> re-renders when sidebarOpen changes
function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  return <div className={sidebarOpen ? 'open' : 'closed'}>{...}</div>
}
```

**Why Server Components for Data?**
- No need to store server data in state
- Data fetched on server, rendered on server
- Client receives HTML, not empty div waiting for fetch

```typescript
// ✅ GOOD: Data ready when page renders
export default async function UserList() {
  const users = await userRepo.getUsers()  // On server
  return <ul>{users.map(u => <li>{u.name}</li>)}</ul>
}

// ❌ BAD: This pattern doesn't exist in new stack
// function UserList() {
//   const [users, setUsers] = useState([])
//   useEffect(() => {
//     fetch('/api/users').then(r => r.json()).then(setUsers)
//   }, [])
//   return <ul>{users.map(...)}</ul>  // Empty initially
// }
```

**Zustand Persistence:**

To persist UI preferences across page reloads, wrap your store with `persist()`:

```typescript
// lib/stores/ui-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUIStore = create()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'system',
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'ui-preferences' } // localStorage key
  )
)
```

That's it! Preferences survive page reloads.

**For database-backed user settings** (e.g., notification preferences), don't use Zustand persistence — just fetch in Server Components and update via Server Actions:

```typescript
export default async function SettingsPage() {
  const prefs = await userRepo.getUserPreferences()
  return <SettingsForm initialPrefs={prefs} />
}
```

---

### 3.6 Workflows & AI Intelligence: Orchestration vs Pure Logic

**Decision:** Split AI features into two layers:
1. **Intelligence** (`lib/intelligence/`): Pure business logic (determinism, no side effects).
2. **Workflows** (`lib/workflows/`): Orchestration layer (connects Intelligence with DB/Storage).

**Why this separation?**
- **Testability:** Intelligence functions are pure and easy to unit test.
- **Reusability:** Workflows can be called from API Routes, Server Actions, or Background Jobs.
- **Clarity:** Separates "how to think" (Intelligence) from "what to do" (Workflow).

**Architectural Pattern: Functional Core, Imperative Shell**

This separation follows a well-established software architecture pattern known by several names:

| Name | Author | Core Idea |
|------|--------|-----------|
| Functional Core, Imperative Shell | Gary Bernhardt | Pure center, impure shell |
| Clean Architecture | Robert Martin | Use cases + entities |
| Hexagonal Architecture | Alistair Cockburn | Ports & Adapters |
| Onion Architecture | Jeffrey Palermo | Dependencies point inward |

**Dependency Flow:**
```
API Route (transport)
    ↓
Workflow (orchestration + side effects)
    ↓
Intelligence Feature (pure logic)
    ↓
External APIs (Reducto, OpenAI)
```

**Mapping to Our Codebase:**
```
Clean Architecture          Our Codebase
─────────────────          ──────────────
Entities/Core              lib/intelligence/features (pure)
Use Cases                  lib/workflows (orchestration)
Controllers/Gateways       app/api routes (transport)
Frameworks                 Supabase, external SDKs
```

**Workflow Pattern (Orchestrator):**
```typescript
// lib/workflows/analysis.ts
export async function* runUserAnalysisWorkflow(userId: string, supabase: SupabaseClient) {
  // 1. Side Effect: Fetch Data
  yield { status: 'gathering_context', progress: 10 }
  const user = await userRepo.getUser(userId)

  // 2. Pure Intelligence: Analyze
  // Translate inner events — never blindly re-yield `complete` from intelligence
  let analysisResult: AnalysisOutput | undefined
  for await (const event of analyzeUserBehavior({ userData: user })) {
    if (event.status === 'complete' && event.result) {
      analysisResult = event.result
      yield { status: 'processing', progress: 90, message: 'Analysis complete, saving results' }
    } else {
      yield { ...event, progress: 10 + Math.floor(event.progress * 0.8) }
    }
  }

  // 3. Deliver first: send `complete` to the client immediately
  yield { status: 'complete', progress: 100, result: analysisResult }

  // 4. Persist after: save results after the client has the data
  await userRepo.saveAnalysis(userId, analysisResult)
}
```

**Intelligence Pattern (Pure Generator):**
```typescript
// lib/intelligence/features/user-analysis/logic.ts
export async function* analyzeUserBehavior({ userData }: { userData: User }) {
  // Pure logic, no database calls
  // Calls external AI APIs (stateless)

  yield { status: 'thinking', progress: 40 }
  const analysis = await openai.chat.completions.create({ /* ... */ })

  yield { status: 'complete', result: analysis }
}
```

**Why Generators?**
Generators allow workflows and intelligence features to yield intermediate states, not just final results.

**Why SSE Streaming?**
SSE (Server-Sent Events) allows the server to push real-time updates to the client.

**Server-Side Pattern:**
```typescript
// app/api/chat/route.ts (or /api/generate/route.ts)
export async function POST(request: Request) {
  const { userId } = await request.json()

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of runUserAnalysis(userId)) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
        }
      } catch (error) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'error', error: error.message })}\n\n`))
      } finally {
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}
```

**Client-Side Pattern (POST with fetch):**
```typescript
// components/AgentRunner.tsx
'use client'

async function runAgent(userId: string, signal: AbortSignal) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
    signal
  })

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader!.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n').filter(line => line.startsWith('data: '))

    for (const line of lines) {
      const event = JSON.parse(line.slice(6))
      setState(event)
      if (event.status === 'error') throw new Error(event.error)
    }
  }
}

// Usage with cleanup
useEffect(() => {
  const controller = new AbortController()

  runAgent(userId, controller.signal).catch(err => {
    if (err.name !== 'AbortError') setError(err.message)
  })

  return () => controller.abort()  // Cleanup on unmount
}, [userId])
```

**User Experience:**
```
Thinking... (10% progress)
  ↓
Analyzing... (50% progress)
  ↓
Complete (100% progress + result)
```

Instead of just:
```
Loading... (forever)
```

**Why This Matters for Agents:**
- Users see real progress (not just "loading")
- Agents are reusable (Server Component, Server Action, API, or background job)
- Agents are observable (can log each step)
- Agents are testable (pure functions)

**Parallel Operations for Latency Optimization**

When a workflow involves multiple independent operations (e.g., storage upload + AI processing), run them in parallel to minimize user wait time:

```
Sequential (slow):
[Upload to Storage]──▶[AI Processing]──▶[DB Persist]──▶ Done

Parallel (fast):
[Upload to Storage]───────────┐
                              ├──▶[DB Persist]──▶ Done
[AI Processing]───────────────┘
        │
        ▼
   Yield result to user
```

**Pattern:**
```typescript
export async function* processFile(file, userId, supabase) {
  // Start both operations in parallel
  const storagePromise = uploadToStorage(file, userId, supabase)

  // Stream processing progress to user
  let result
  for await (const event of processWithAI(file)) {
    yield event
    if (event.status === 'complete') result = event.result
  }

  // Wait for storage (likely already complete)
  const storagePath = await storagePromise

  // Persist to database
  await persistRecord(supabase, storagePath, result)
}
```

**Key Insight:** The user sees results as soon as processing completes. Storage upload runs concurrently, so it doesn't add to perceived latency.

---

### 3.7 Real-Time Features: WebSocket vs SSE

**Decision:** Use SSE for agents (simpler), WebSocket for true bidirectional (future).

| Feature | SSE | WebSocket |
| :--- | :--- | :--- |
| **Setup** | 10 minutes | 1 hour |
| **Use Case** | Server → Client (agent updates) | Bidirectional (chat) |
| **Scaling** | Easy | Requires Redis/Pub-Sub |
| **For MVP** | Perfect | Overkill |

**SSE is sufficient for:**
- Agent progress updates
- Live notifications
- Data stream updates

**WebSocket needed for:**
- Real-time chat
- Collaborative editing
- Live cursors

Use SSE initially, upgrade to WebSocket if you need bidirectional communication later.

**SSE Production Best Practices:**

```typescript
// Reusable SSE hook with error handling
function useSSEAgent<T>(endpoint: string, payload: Record<string, any>) {
  const [state, setState] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    let retryCount = 0

    async function connectSSE() {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        })

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const reader = response.body!.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const lines = decoder.decode(value).split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const event = JSON.parse(line.slice(6))
              if (event.status === 'error') throw new Error(event.error)
              setState(event)
            }
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return
        setError(err.message)

        // Exponential backoff retry
        if (retryCount < 3) {
          retryCount++
          setTimeout(connectSSE, 1000 * Math.pow(2, retryCount))
        }
      }
    }

    connectSSE()
    return () => controller.abort()
  }, [endpoint, JSON.stringify(payload)])

  return { state, error }
}
```

**Key Production Patterns:**
- Use `AbortController` for cleanup and cancellation
- Handle network errors with exponential backoff retry
- Check HTTP status before reading stream
- Parse SSE format correctly (`data: ` prefix)
- Clean up on component unmount

---

### 3.8 Internationalization: next-intl

**Decision:** Use next-intl for type-safe internationalization in Next.js App Router.

**Why next-intl?**
```typescript
// Type-safe translations with autocomplete
import { useTranslations } from 'next-intl'

export function WelcomeMessage() {
  const t = useTranslations('HomePage')
  return <h1>{t('welcome')}</h1>  // TypeScript knows available keys
}
```

| Feature | next-intl | next-i18next | react-intl |
| :--- | :--- | :--- | :--- |
| **App Router Support** | Native | Pages Router only | Requires setup |
| **Server Components** | Full support | No support | No support |
| **Type Safety** | Auto-generated types | Manual | Partial |
| **Setup Time** | 10 minutes | 30 minutes | 20 minutes |
| **Bundle Size** | ~8KB | ~25KB | ~15KB |
| **For Startups** | Perfect | Legacy | Overkill |

**Why next-intl Fits This Stack:**
- **Server-First:** Works seamlessly with Server Components
- **Type-Safe:** Auto-completes translation keys
- **Zero Client JS:** Translations resolved on server (reduces bundle size)
- **Dynamic Routes:** Supports `/en/dashboard` and `/ar/dashboard` patterns

**Architecture Integration:**

```typescript
// i18n/request.ts
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../messages/${locale}.json`)).default
}))

// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  let messages
  try {
    messages = (await import(`@/messages/${locale}.json`)).default
  } catch (error) {
    notFound()
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

// Server Component usage
import { getTranslations } from 'next-intl/server'

export default async function ProfilePage() {
  const t = await getTranslations('ProfilePage')

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  )
}

// Client Component usage
'use client'

import { useTranslations } from 'next-intl'

export function ProfileForm() {
  const t = useTranslations('ProfilePage')

  return (
    <form>
      <input placeholder={t('namePlaceholder')} />
      <button>{t('submit')}</button>
    </form>
  )
}
```

**Translation File Structure:**
```
messages/
├── en.json       (English translations)
├── ar.json       (Arabic translations)
└── es.json       (Spanish translations)

// messages/en.json
{
  "HomePage": {
    "welcome": "Welcome to our platform",
    "description": "Build amazing things"
  },
  "ProfilePage": {
    "title": "Your Profile",
    "namePlaceholder": "Enter your name",
    "submit": "Save Changes"
  }
}
```

**RTL Support (Right-to-Left):**
```typescript
// app/[locale]/layout.tsx
export default async function LocaleLayout({ params: { locale } }) {
  const direction = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={direction}>
      <body>{children}</body>
    </html>
  )
}
```

**Scaling Translation Files:**

As your app grows, split translations by feature/module to keep files maintainable:

```
messages/
├── en/
│   ├── common.json      (shared UI, buttons, labels)
│   ├── dashboard.json   (dashboard-specific)
│   ├── admin.json       (admin panel)
│   └── errors.json      (error messages)
└── ar/
    ├── common.json
    ├── dashboard.json
    ├── admin.json
    └── errors.json
```

Update your `i18n/request.ts` to merge files:

```typescript
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => {
  const [common, dashboard, admin, errors] = await Promise.all([
    import(`../messages/${locale}/common.json`),
    import(`../messages/${locale}/dashboard.json`),
    import(`../messages/${locale}/admin.json`),
    import(`../messages/${locale}/errors.json`)
  ])

  return {
    messages: {
      ...common.default,
      ...dashboard.default,
      ...admin.default,
      ...errors.default
    }
  }
})
```

**When to split:**
- **Start**: Single file per locale (`en.json`, `ar.json`)
- **Split at ~300 lines**: Group by feature/domain
- **Split at ~100 lines per file**: Further break down large modules

**Benefits:**
- SEO-friendly (each locale has its own route)
- No flash of untranslated content
- Type-safe (catches missing translations at compile time)
- Works with Server Actions (validated translations on server)

---

### 3.9 UI Components: shadcn/ui

**Decision:** Use shadcn/ui for accessible, customizable component primitives.

**Why shadcn/ui?**

shadcn/ui is **NOT** a component library — it's a collection of **copy-paste components** built on top of Radix UI + Tailwind CSS.

| Aspect | shadcn/ui | Material UI | Chakra UI | Ant Design |
| :--- | :--- | :--- | :--- | :--- |
| **Ownership** | You own the code | Package dependency | Package dependency | Package dependency |
| **Customization** | 100% flexible | Limited theming | Good theming | Heavy overrides |
| **Bundle Size** | Only what you use | ~100KB min | ~80KB min | ~150KB min |
| **Accessibility** | Radix UI (WCAG) | Good | Good | Partial |
| **TypeScript** | Full support | Full support | Full support | Partial |
| **Styling** | Tailwind CSS | Emotion/CSS-in-JS | Emotion | Less/CSS |
| **For Startups** | Perfect | Heavy | Good | Overkill |

**Why NOT a traditional component library?**
```typescript
// ❌ Traditional library: locked into their design system
import { Button } from '@mui/material'

<Button variant="contained">Click Me</Button>
// You're stuck with their styles, hard to customize

// ✅ shadcn/ui: you own the component
// components/ui/button.tsx exists in YOUR codebase
import { Button } from '@/components/ui/button'

<Button>Click Me</Button>
// You can edit button.tsx directly, add variants, change colors
```

**Setup:**
```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Add individual components (copy-pasted into your project)
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
npx shadcn-ui@latest add table

# Components are now in components/ui/
# You can modify them directly
```

**Integration with Server Actions:**
```typescript
// components/CreateUserDialog.tsx
'use client'

import { createUserAction } from '@/lib/actions/users'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function CreateUserDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create User</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New User</DialogTitle>
        </DialogHeader>
        <form action={createUserAction}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

**Why shadcn/ui Fits This Stack:**
- **Owns the code:** No black-box dependencies, full control
- **Minimal bundle:** Only imports what you use (tree-shakable)
- **Accessible:** Built on Radix UI (keyboard navigation, ARIA, focus management)
- **Type-safe:** Full TypeScript support
- **Composable:** Works perfectly with Server Components and Client Components
- **Customizable:** Edit components directly in your codebase

**Configuration (`components.json`):**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

---

### 3.10 Icon Library: Hugeicons

**Decision:** Use Hugeicons for consistent, high-quality iconography.

**Why Hugeicons?**

```typescript
import { Search01Icon, ArrowRight01Icon } from '@hugeicons/react'

export function SearchButton() {
  return (
    <button>
      <Search01Icon size={20} />
      Search
      <ArrowRight01Icon size={16} />
    </button>
  )
}
```

| Feature | Hugeicons | Lucide React | Heroicons | React Icons |
| :--- | :--- | :--- | :--- | :--- |
| **Icon Count** | 4,000+ | 1,000+ | 500+ | 20,000+ |
| **Consistency** | Unified design | Good | Good | Mixed sources |
| **Tree-Shaking** | Per-icon import | Yes | Yes | Partial |
| **TypeScript** | Full support | Full support | Full support | Varies |
| **Modern Design** | Contemporary | Good | Good | Mixed |

**Integration with shadcn/ui:**

The `iconLibrary` setting in `components.json` ensures that when you add new shadcn components via CLI, they automatically use your chosen icon library:

```bash
npx shadcn@latest add button
# Generates button component using your configured icon library
```

---

### 3.11 Agent Lifecycle Management

**Production Concerns:** Agents can fail mid-stream, be canceled by users, or run concurrently creating race conditions.

**Cancellation Pattern:**
```typescript
// Agents should respect AbortSignal
export async function* runAnalysisAgent(userId: string, signal?: AbortSignal) {
  yield { status: 'thinking', progress: 10 }

  if (signal?.aborted) return

  const user = await userRepo.getUser(userId)
  yield { status: 'analyzing', progress: 50 }

  if (signal?.aborted) return

  const analysis = await openai.chat.completions.create({
    /* ... */
  }, { signal })

  yield { status: 'complete', progress: 100, result: analysis }
}
```

**Failure Handling:**
```typescript
// Server: Yield errors as events instead of throwing
export async function* runAnalysisAgent(userId: string) {
  try {
    yield { status: 'thinking', progress: 10 }
    const result = await riskyOperation()
    yield { status: 'complete', result }
  } catch (error) {
    yield { status: 'error', error: error.message, progress: 0 }
  }
}
```

**Preventing Race Conditions:**
```typescript
// Client: Cancel previous runs when input changes
function useAgentRunner(userId: string) {
  const [state, setState] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    runAgent(userId, controller.signal)
      .then(setState)
      .catch(err => {
        if (err.name !== 'AbortError') console.error(err)
      })

    return () => controller.abort()  // Cancels previous run
  }, [userId])  // New userId = cancel old agent

  return state
}
```

**Key Patterns:**
- Pass `AbortSignal` to agents and check periodically
- Yield errors as events, don't throw mid-stream
- Return cleanup function from `useEffect` to cancel on unmount
- Cancel outdated requests when dependencies change

---

### 3.12 Error Handling & Observability

**Philosophy:** Use existing tools, keep it simple, optimize for startup velocity.

**Don't Build These (Yet):**
- Custom error class hierarchies
- Circuit breakers (premature optimization)
- Complex retry middleware

**Do This Instead:**
- Simple error sanitization (don't leak DB details)
- Sentry for production error tracking (15-minute setup)
- Structured logging with `console.error()`

---

#### Simple Error Sanitization

**Add this helper to repositories:**

```typescript
// lib/repository/error-utils.ts
export function sanitizeError(error: any, operation: string, context?: Record<string, any>) {
  // Log full error details server-side
  console.error(`[Repository Error: ${operation}]`, {
    operation,
    context,
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint
  })

  // Map common Supabase error codes to user-friendly messages
  if (error.code === 'PGRST116') {
    return new Error('Resource not found')
  }

  if (error.code?.startsWith('23')) {  // Postgres constraint violations
    return new Error('Invalid data provided')
  }

  if (error.code === '42501') {  // Insufficient privilege
    return new Error('You do not have permission to access this resource')
  }

  // Generic fallback (never show internal error details)
  return new Error('Something went wrong. Please try again.')
}
```

**Updated Repository Pattern:**

```typescript
// lib/repository/users.ts
import { sanitizeError } from './error-utils'

export async function getUser(supabase: SupabaseClient<Database>, id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw sanitizeError(error, 'getUser', { userId: id })
  }

  return data
}
```

**Benefits:**
- User sees: "Invalid data provided"
- Logs show: Full PostgreSQL error with context
- No sensitive internal details leaked
- Easy to debug with operation name and context

---

#### Server Action Error Handling

```typescript
// lib/actions/users.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createUser } from '@/lib/repository/users'

export async function createUserAction(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const email = formData.get('email') as string

    if (!name || !email) {
      return { success: false, error: 'Name and email are required' }
    }

    const user = await createUser(name, email)

    revalidatePath('/users')
    return { success: true, data: user }
  } catch (error: any) {
    // Error already sanitized by repository
    return { success: false, error: error.message }
  }
}
```

**Client-Side Error Display:**

```typescript
// components/CreateUserForm.tsx
'use client'

import { useActionState } from 'react'
import { createUserAction } from '@/lib/actions/users'
import { Button } from '@/components/ui/button'

export function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(
    createUserAction,
    { success: false, error: null }
  )

  return (
    <form action={formAction}>
      <input name="name" required />
      <input name="email" type="email" required />

      {state?.error && (
        <div className="text-red-500">{state.error}</div>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create User'}
      </Button>
    </form>
  )
}
```

---

#### Sentry Integration (Production Error Tracking)

**15-Minute Setup:**

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**What you get automatically:**
- Error tracking with stack traces
- User context (which user hit the error)
- Breadcrumbs (what actions led to the error)
- Performance monitoring
- Source maps for production debugging
- Generous free tier (5K errors/month)

---

#### Structured Logging Best Practices

```typescript
// ❌ BAD: Strings are hard to parse
console.error('Error in getUser for user 123: Database connection failed')

// ✅ GOOD: Objects are structured and parseable
console.error('[getUser]', {
  operation: 'getUser',
  userId: '123',
  error: 'Database connection failed',
  timestamp: new Date().toISOString()
})
```

---

#### Optional: Simple Retry Logic

**When to Use Retries:**
- External API calls (OpenAI, Stripe, etc.)
- Network flakiness
- NOT database queries (RLS should handle permissions, not retries)
- NOT user input validation errors

```typescript
// lib/utils/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxAttempts?: number; delayMs?: number } = {}
): Promise<T> {
  const { maxAttempts = 3, delayMs = 1000 } = options
  let lastError: Error

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error

      const isRetryable =
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT' ||
        error.message?.includes('fetch failed')

      if (!isRetryable || attempt === maxAttempts) {
        throw error
      }

      const delay = delayMs * Math.pow(2, attempt - 1)
      console.warn(`[Retry] Attempt ${attempt}/${maxAttempts} failed, retrying in ${delay}ms`, {
        error: error.message
      })

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}
```

---

#### Summary: What to Do When

| Scenario | Action | Example |
| :--- | :--- | :--- |
| **Repository error** | Sanitize with `sanitizeError()` | Database constraint violation → "Invalid data" |
| **Server Action error** | Return `{ success: false, error: message }` | Form validation failure |
| **External API call** | Wrap with `withRetry()` | OpenAI, Stripe API calls |
| **Unexpected error** | Log with Sentry + structured console.error | Null pointer, unexpected state |
| **Client-side error** | Display user-friendly message | Toast notification, inline error |

**Production Checklist:**
- All repository functions use `sanitizeError()`
- Server Actions return `{ success, error }` objects
- Sentry installed and configured
- All errors logged with structured context
- External API calls wrapped with retry logic
- Client components display errors gracefully

---

### 3.13 Architectural Decisions & Trade-offs

---

#### Intentional Coupling with Supabase

**Decision:** We are **intentionally tightly coupled** to Supabase for both auth and database.

**Why This Is Acceptable:**

```
┌─────────────────────────────────────────────────────┐
│ Traditional Approach: Decoupled                      │
│ ┌──────────┐   ┌──────────┐   ┌──────────┐          │
│ │ App Code │ → │ Auth     │ → │ Auth0    │          │
│ │          │   │ Interface│   │ Clerk    │(swappable)│
│ │          │   │          │   │ NextAuth │          │
│ └──────────┘   └──────────┘   └──────────┘          │
│                                                      │
│ Pros: Can swap providers easily                      │
│ Cons: Abstraction overhead, slower, complex          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Our Approach: Intentionally Coupled                  │
│ ┌──────────┐   ┌──────────────────────────┐          │
│ │ App Code │ → │ Supabase (Auth + DB + RLS)│          │
│ │          │   │ - Auth APIs              │          │
│ │          │   │ - Database Queries       │          │
│ │          │   │ - Row Level Security     │          │
│ └──────────┘   └──────────────────────────┘          │
│                                                      │
│ Pros: Simpler, faster, RLS integration               │
│ Cons: Harder to switch providers                     │
└─────────────────────────────────────────────────────┘
```

**Reasons for Tight Coupling:**

1. **RLS Integration**: Supabase Auth's `auth.uid()` function is used in Row Level Security policies. This is a **database-level feature** that requires auth and database to be the same service.

2. **Type Safety**: Auto-generated types from database schema work seamlessly with Supabase client.

3. **Unified Platform**: Auth, database, storage, and edge functions in one service = simpler ops.

4. **Startup Velocity**: No abstraction layer = faster development.

**When This Decision Would Be Wrong:**
- Building a multi-tenant SaaS where tenants choose their auth provider
- Enterprise requirements for specific auth (e.g., Auth0 for corporate SSO)
- Building a platform that resells auth as a service

**Core Principle:**

> **Optimize for velocity now, flexibility later.**
> Premature abstraction is the root of all complexity.
> Ship fast, refactor when you have real requirements.

---

## 4. Implementation Patterns

### 4.1 Server Component Pattern

```typescript
// app/users/page.tsx
import { getUsersWithStats } from '@/lib/repository/users'

export default async function UsersPage() {
  const users = await getUsersWithStats()

  return (
    <div>
      <h1>Users ({users.length})</h1>
      <UsersList users={users} />
    </div>
  )
}

// components/UsersList.tsx - Can be Client or Server Component
export function UsersList({ users }: { users: User[] }) {
  return (
    <ul>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </ul>
  )
}
```

### 4.2 Server Action Pattern

```typescript
// lib/actions/users.ts
'use server'

import { createUser as createUserInDb } from '@/lib/repository/users'
import { revalidatePath } from 'next/cache'

export async function createUserAction(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string

  if (!name || !email) throw new Error('Missing fields')

  const user = await createUserInDb(name, email)
  revalidatePath('/users')
  return user
}

// components/CreateUserForm.tsx
'use client'

import { createUserAction } from '@/lib/actions/users'

export function CreateUserForm() {
  return (
    <form action={createUserAction}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit">Create</button>
    </form>
  )
}
```

### 4.3 Repository Pattern (Dependency Injection)

Repository functions receive `SupabaseClient` as the first parameter. This makes them:
- **Context-agnostic:** Work in Server Components, Actions, streaming, workers, tests
- **Efficient:** One client per request, shared across all calls
- **Testable:** Easy to mock the Supabase client

```typescript
// lib/repository/users.ts
import { SupabaseClient } from '@supabase/supabase-js'
import { sanitizeError } from './error-utils'
import { Database } from '@/lib/supabase/database.types'

type User = Database['public']['Tables']['users']['Row']

export async function getUsers(
  supabase: SupabaseClient<Database>
): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw sanitizeError(error, 'getUsers')
  return data ?? []
}

export async function getUserById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw sanitizeError(error, 'getUserById', { id })
  }
  return data
}
```

**Usage in Server Action:**
```typescript
// lib/actions/users.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserById, updateUser } from '@/lib/repository/users'

export async function updateProfile(userId: string, updates: UserUpdate) {
  const supabase = await createClient()  // Create once at entry point

  const user = await getUserById(supabase, userId)  // Pass to all repo calls
  if (!user) throw new Error('User not found')

  return await updateUser(supabase, userId, updates)  // Reuse same client
}
```

**Usage in Streaming Workflow:**
```typescript
// lib/workflows/processing.ts
export async function* processAndPersist(
  file: File,
  userId: string,
  supabase: SupabaseClient<Database>  // Passed from API route
) {
  // ... processing logic ...

  // Deliver first: send results to the client immediately
  yield { status: 'complete', progress: 100, result }

  // Persist after: save to database after the client has the data
  const record = await createRecord(supabase, data)
}
```

**Why this pattern?**

When `createClient()` calls `cookies()` from `next/headers` inside an async generator, the Next.js request context is lost. By creating the client at the API route level (before streaming starts) and passing it to workflows/repositories, we avoid this issue.

### 4.4 Agent Pattern

```typescript
// lib/intelligence/types.ts
export interface AgentState {
  status: 'thinking' | 'running' | 'analyzing' | 'complete' | 'error'
  progress: number
  currentStep: string
  message?: string
  result?: unknown
  error?: string
}

// lib/intelligence/features/user-analysis/logic.ts
import * as userRepo from '@/lib/repository/users'

export async function* runUserAnalysisAgent(userId: string) {
  yield { status: 'thinking', progress: 10, currentStep: 'Loading user...' }

  const user = await userRepo.getUserById(userId)

  yield { status: 'analyzing', progress: 50, currentStep: 'AI processing...' }

  const analysis = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'user', content: `Analyze: ${JSON.stringify(user)}` }
    ]
  })

  yield { status: 'complete', progress: 100, result: analysis.choices[0].message.content }
}
```

### 4.5 Authentication Pattern

```typescript
// Server Component with authentication
import { createClient, requireUser } from '@/lib/supabase/server'
import { getUserDocuments } from '@/lib/repository/documents'

export default async function DocumentsPage() {
  const user = await requireUser()  // Throws if not authenticated
  const supabase = await createClient()

  const documents = await getUserDocuments(supabase, user.id)

  return (
    <div>
      <h1>Your Documents</h1>
      <DocumentList documents={documents} />
    </div>
  )
}

// Server Action with authentication
'use server'

import { createClient, requireUser } from '@/lib/supabase/server'
import { createDocument } from '@/lib/repository/documents'
import { revalidatePath } from 'next/cache'

export async function createDocumentAction(formData: FormData) {
  const user = await requireUser()
  const supabase = await createClient()

  const title = formData.get('title') as string
  const content = formData.get('content') as string

  await createDocument(supabase, { title, content, user_id: user.id })

  revalidatePath('/documents')
  return { success: true }
}
```

### 4.6 Zustand Store Pattern

```typescript
// lib/store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'light',
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-preferences',
    }
  )
)

// Usage in Client Component
'use client'

import { useUIStore } from '@/lib/store'

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  return <aside className={sidebarOpen ? 'open' : 'closed'}>{...}</aside>
}
```

---

## 4.7 Authentication & Authorization: Supabase Auth

**Decision:** Use Supabase Auth for authentication with Row Level Security (RLS) for authorization.

**The Three-Layer Security Model:**

```
┌───────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER (Browser)                              │
│ - Session cookie (httpOnly, secure)                       │
│ - No access tokens in localStorage                        │
└───────────────────────────────────────────────────────────┘
                          ↓
┌───────────────────────────────────────────────────────────┐
│ MIDDLEWARE LAYER (Edge Runtime)                           │
│ - Validates session on every request                      │
│ - Refreshes tokens if needed                              │
│ - Redirects unauthenticated users                         │
└───────────────────────────────────────────────────────────┘
                          ↓
┌───────────────────────────────────────────────────────────┐
│ APPLICATION LAYER (Server Components & Actions)           │
│ - Gets authenticated user from Supabase                   │
│ - Checks permissions via RLS policies                     │
│ - Business logic for authenticated requests               │
└───────────────────────────────────────────────────────────┘
                          ↓
┌───────────────────────────────────────────────────────────┐
│ DATABASE LAYER (PostgreSQL + RLS)                         │
│ - Row Level Security enforced on ALL queries              │
│ - auth.uid() available in RLS policies                    │
│ - Users can only access their own data                    │
└───────────────────────────────────────────────────────────┘
```

**Core Implementation:**

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './database.types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options) { cookieStore.set({ name, value, ...options }) },
        remove(name: string, options) { cookieStore.set({ name, value: '', ...options }) },
      },
    }
  )
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function requireUser() {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')
  return user
}
```

```typescript
// lib/supabase/client.ts (for Client Components)
import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Middleware for Session Management:**

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const publicRoutes = ['/', '/login', '/signup', '/forgot-password']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '')
  const isPublicRoute = publicRoutes.includes(pathnameWithoutLocale)

  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && ['/login', '/signup'].includes(pathnameWithoutLocale)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}
```

---

#### Authorization with Row Level Security (RLS)

**Decision:** Use **Defense in Depth** — both application-level filters AND database-level RLS.

**Security Principle:**

> **Never rely on a single layer of defense.**
> Always assume any layer can fail.
> Use multiple independent security controls.

```
┌────────────────────────────────────────────────────────────┐
│ Request Flow with Defense in Depth                        │
│                                                            │
│  User Request                                              │
│       ↓                                                    │
│  [Layer 1] Application Filter                              │
│       ↓     .eq('user_id', userId)                        │
│  [Layer 2] Database RLS Policy                             │
│       ↓     USING (auth.uid() = user_id)                  │
│  Response (only if BOTH layers approve)                    │
│                                                            │
│  If either layer blocks → Access denied                    │
└────────────────────────────────────────────────────────────┘
```

**Best Practice: Both Layers Always**

```typescript
// lib/repository/documents.ts
/**
 * Security (Defense in Depth):
 * - Layer 1 (Application): Explicit user_id filter
 * - Layer 2 (Database): RLS policy enforces same rule
 */
export async function getUserDocuments(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)  // Layer 1: Application filter
    .order('created_at', { ascending: false })

  if (error) throw error
  // RLS policy ALSO active (Layer 2)
  return data ?? []
}
```

```sql
-- Layer 2: RLS policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);
```

**Anti-Patterns to Avoid:**

```typescript
// ❌ WRONG: RLS only, no application filter
export async function getDocuments(supabase: SupabaseClient) {
  return await supabase.from('documents').select('*')
  // Hard to test, hard to debug, not portable
}

// ❌ WRONG: Application only, no RLS
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;  // DON'T DO THIS!
// One forgotten filter = data leak
```

---

#### Security Best Practices

**1. Never expose service role key to client:**

```typescript
// ❌ NEVER DO THIS
const supabase = createClient(URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// ✅ CORRECT: Use service role ONLY on server
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
```

**2. Always validate user input in Server Actions:**

```typescript
// ✅ GOOD: Use Zod for validation
import { z } from 'zod'

const profileSchema = z.object({
  name: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
})

export async function updateProfile(formData: FormData) {
  const user = await requireUser()
  const parsed = profileSchema.parse({
    name: formData.get('name'),
    bio: formData.get('bio'),
  })
  const supabase = await createClient()
  await updateUserProfile(supabase, user.id, parsed)
}
```

**3. Use RLS policies on ALL tables**

**4. Implement rate limiting for auth endpoints:**

```typescript
// lib/auth/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'),
})

export async function checkAuthRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier)
  return success
}
```

---

## 5. Dos & DONTs

### DO's

1. **DO fetch data in Server Components**
   ```typescript
   export default async function Page() {
     const data = await getData()
     return <Component data={data} />
   }
   ```

2. **DO use Server Actions for mutations**
   ```typescript
   'use server'
   export async function updateUser(formData: FormData) {
     await db.update(formData)
     revalidatePath('/users')
   }
   ```

3. **DO keep agents pure (no Next.js dependencies)**
   ```typescript
   export async function* runAgent(input: Input) {
     const result = await someLogic()
     yield result
   }
   ```

4. **DO use Repository Pattern for all database access**

5. **DO use Zustand only for UI state**

6. **DO mark files with 'use server' or 'use client' explicitly**

7. **DO stream agents via SSE for real-time updates**

8. **DO revalidate paths after mutations**

9. **DO type everything with TypeScript**

---

### DON'Ts

1. **DON'T fetch data in Client Components**
   ```typescript
   // ❌ BAD
   'use client'
   useEffect(() => {
     fetch('/api/users').then(setUsers)
   }, [])
   ```

2. **DON'T use React Context for global state** — causes unnecessary re-renders

3. **DON'T use useState for server data**

4. **DON'T import Supabase directly in components** — use repository functions

5. **DON'T put agent logic in API routes** — agents go in `lib/intelligence/`, API routes just transport

6. **DON'T use API Routes for simple mutations** — use Server Actions

7. **DON'T make agents dependent on Next.js headers/cookies** — pass what you need as arguments

8. **DON'T forget to revalidate after mutations**

9. **DON'T store database credentials in environment variables without caution**
   ```typescript
   // ❌ BAD - Service role key exposed to client
   const supabase = createClient(URL, process.env.NEXT_PUBLIC_SERVICE_KEY)

   // ✅ GOOD - Use anon key on client, service key only on server
   ```

10. **DON'T make agents too large** — break into smaller, focused agents

---

## 6. Testing Strategy

### 6.1 Testing Pyramid

```
     /\      E2E (10%)       - Slow, brittle, high confidence
    /  \     Critical user journeys only
   /────\
  /──────\   Integration (30%) - Medium speed, stable
 /────────\  Verify data flow and database operations
/──────────\
Unit (60%)   - Fast, focused, low-level
Pure logic and business rules
```

### 6.2 Test Types

**Unit Tests (`tests/unit/`)** — Pure logic with mocked dependencies
- Utility functions (error sanitization, data transformations)
- AI agent decision logic
- Business rule validation

**Integration Tests (`tests/integration/`)** — Database queries and API calls
- Repository CRUD operations
- Server Actions with database
- RLS policies and data relationships

**E2E Tests (`tests/e2e/`)** — Full user journeys with Playwright
- Authentication flows (signup, login, password reset)
- Critical business flows
- Internationalization (language switching)

### 6.3 Conventions

```
tests/
├── integration/
│   ├── users.test.ts
│   └── documents.test.ts
├── unit/
│   ├── lib/
│   │   ├── error-utils.test.ts
│   │   └── utils.test.ts
│   └── intelligence/
│       └── analysis.test.ts
├── e2e/
│   ├── auth.test.ts
│   └── core-workflow.test.ts
└── setup.ts
```

- Use `.test.ts` suffix for all test files
- Follow AAA pattern (Arrange, Act, Assert)
- Each test runs independently
- Test edge cases and error conditions, not just happy paths

---

## 7. File Structure

```
project-root/
├── app/
│   ├── [locale]/                (Internationalization wrapper)
│   │   ├── layout.tsx           (Root layout with next-intl provider)
│   │   ├── page.tsx             (Home page - Server Component)
│   │   │
│   │   ├── (app)/               (Authenticated app routes - route group)
│   │   │   ├── layout.tsx       (Layout for authenticated routes)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx     (Dashboard - Server Component)
│   │   │   ├── {feature}/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx (Dynamic feature page)
│   │   │   ├── profile/
│   │   │   │   └── page.tsx     (User profile)
│   │   │   └── settings/
│   │   │       └── page.tsx     (Settings)
│   │   │
│   │   ├── (public)/            (Public routes - route group)
│   │   │   ├── layout.tsx       (Layout for public routes)
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   ├── privacy/
│   │   │   └── terms/
│   │   │
│   │   └── auth/                (Authentication routes)
│   │       ├── confirm/
│   │       ├── login/
│   │       ├── sign-up/
│   │       ├── forgot-password/
│   │       └── update-password/
│   │
│   ├── api/                     (API routes)
│   │   ├── chat/
│   │   │   └── route.ts         (AI chat endpoint - SSE streaming)
│   │   └── generate/
│   │       └── route.ts         (AI generation endpoint - SSE streaming)
│   │
│   ├── globals.css              (Global styles)
│   └── layout.tsx               (Root layout)
│
├── tests/
│   ├── integration/             (Integration tests - real database)
│   ├── unit/                    (Unit tests - mocked dependencies)
│   ├── e2e/                     (End-to-end tests - Playwright)
│   └── setup.ts                 (Shared test utilities)
│
├── lib/
│   ├── intelligence/            (AI/Intelligence features)
│   │   ├── core/                (Shared AI infrastructure)
│   │   │   ├── providers.ts     (Provider registry, model definitions)
│   │   │   └── types.ts         (Shared AI types)
│   │   └── features/
│   │       ├── {feature-name}/  (Each feature is a self-contained module)
│   │       │   ├── index.ts     (Barrel exports)
│   │       │   ├── logic.ts     (Core logic)
│   │       │   └── types.ts     (Type definitions)
│   │       └── ...
│   │
│   ├── workflows/               (Orchestration layer)
│   │   └── {workflow}.ts        (Connects intelligence with DB/storage)
│   │
│   ├── actions/                 (Server Actions - mutations)
│   │   └── {entity}.ts
│   │
│   ├── repository/              (Data access layer)
│   │   ├── {entity}.ts
│   │   └── error-utils.ts
│   │
│   ├── supabase/
│   │   ├── server.ts            (Server-side Supabase client)
│   │   ├── client.ts            (Client-side Supabase client)
│   │   └── database.types.ts    (Auto-generated from Supabase)
│   │
│   ├── store/                   (State management)
│   │   └── ui-store.ts          (Zustand UI state store)
│   │
│   └── utils/
│       └── utils.ts
│
├── components/
│   ├── ui/                      (shadcn/ui components - you own these)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── ...
│   │
│   ├── auth/                    (Authentication components)
│   │   ├── login-form.tsx
│   │   ├── sign-up-form.tsx
│   │   └── ...
│   │
│   ├── features/                (Feature-specific components)
│   │   └── {feature}/
│   │       ├── index.ts         (Barrel export)
│   │       └── ...
│   │
│   └── shared/                  (Shared/common components)
│       ├── footer.tsx
│       └── header.tsx
│
├── i18n/
│   └── request.ts               (next-intl configuration)
│
├── messages/                    (Translation files)
│   ├── en.json
│   └── ar.json
│
├── docs/                        (Project documentation)
│
├── supabase/                    (Database migrations & Supabase CLI)
│   ├── migrations/
│   └── config.toml
│
├── proxy.ts                     (Middleware configuration)
├── components.json              (shadcn/ui configuration)
├── tsconfig.json
└── package.json
```

---

## 8. Data Flow Examples

### Example 1: Load and Display Data

```
User visits /users → Server Component renders → Calls repository →
Supabase query → HTML with data sent → Browser displays instantly
```
**Result:** No loading spinner, no waterfall.

### Example 2: Form Mutation

```
User submits form → Server Action validates → Repository updates DB →
revalidatePath() clears cache → UI updates with new data
```
**Result:** Type-safe mutation, automatic cache invalidation.

### Example 3: Auth Login Flow

```
Visit protected route → Middleware redirects to /login → User submits →
Supabase Auth validates → Session cookie set → Redirect to dashboard →
Server Component fetches with RLS enforced
```
**Result:** Secure session-based auth with database-level access control.

### Example 4: Stream Agent Progress

```
User clicks "Analyze" → SSE connection opens → API route calls agent →
Agent yields events (thinking → analyzing → complete) → Client updates in real-time
```
**Result:** Real-time feedback, not just "loading...".

---

## 9. Migration Checklist

### Phase 1: Setup
- [ ] Initialize Next.js project with `create-next-app`
- [ ] Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `zustand`, `next-intl`, `zod`
- [ ] Initialize shadcn/ui
- [ ] Set up Supabase project and CLI
- [ ] Create `lib/supabase/server.ts` and `lib/supabase/client.ts`
- [ ] Create middleware.ts with auth and i18n logic
- [ ] Set up Zustand store with persist middleware
- [ ] Configure next-intl
- [ ] Set up environment variables

### Phase 2: Repository Pattern
- [ ] Create `lib/repository/{entity}.ts` with all queries
- [ ] Create `lib/repository/error-utils.ts`
- [ ] Test repository functions in isolation

### Phase 3: Server Components
- [ ] Migrate pages to fetch data in Server Components
- [ ] Remove all `useEffect` data fetching
- [ ] Remove `useState` for server data

### Phase 4: Server Actions
- [ ] Create `lib/actions/{entity}.ts` with mutations
- [ ] Convert forms to `<form action={serverAction}>`
- [ ] Add `revalidatePath()` after each mutation

### Phase 5: AI Intelligence
- [ ] Create `lib/intelligence/` with feature modules
- [ ] Create `lib/workflows/` for orchestration
- [ ] Create SSE API routes
- [ ] Create client components to consume streams

### Phase 6: Testing
- [ ] Set up test directory structure
- [ ] Write unit tests for utilities
- [ ] Write integration tests for repositories
- [ ] Set up E2E tests for critical flows

### Phase 7: Deployment
- [ ] Deploy to Vercel
- [ ] Set up error tracking (Sentry)
- [ ] Monitor Core Web Vitals

---

## 10. Key Metrics to Track

| Metric | Target | Why |
| :--- | :--- | :--- |
| **TTFB** | < 200ms | Time to first byte (server rendering speed) |
| **LCP** | < 2.5s | Largest contentful paint (visual load speed) |
| **CLS** | < 0.1 | Cumulative layout shift (visual stability) |
| **Bundle Size** | < 150KB | Total JS shipped to client |
| **Agent Latency** | < 500ms per step | Agent execution speed |
| **Error Rate** | < 0.1% | Monitoring for bugs |

---

## 11. Future Optimizations (Post-MVP)

1. **WebSocket for Real-Time Chat** (instead of SSE)
2. **Edge Functions** (for low-latency APIs)

---

## Conclusion

This architecture is built for **growth**. It's simple enough for a small team to maintain, but structured enough to scale to 20+ engineers and millions of users.

The key principles:
- **Server-first rendering** = fast, secure, SEO-friendly
- **Decoupled agents** = reusable IP, portable logic
- **Repository pattern** = flexible, testable, maintainable
- **Type-safe end-to-end** = catch bugs at compile time
- **Real-time streaming** = engaging user experience

Ship fast, scale smart.