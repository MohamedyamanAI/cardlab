# Implementation Decisions & Gotchas

Decisions made during development and issues discovered. Newest first.

---

## 2026-03-03: Versioning Strategy for Cards, Documents, and Decks

**Context:** Need version history for cards, documents, and decks so users can view past states and roll back changes.

**Approach considered:**
1. **Per-entity snapshot tables** — separate `_versions` table per entity, main table stays current
2. **Polymorphic versions table** — single `entity_versions` table with `entity_type` discriminator
3. **Same-table versioning (SCD Type 2)** — add `version`/`is_current` columns to existing tables
4. **JSONB diff storage** — store only deltas between versions

**Decision:** Per-entity snapshot tables (`card_versions`, `document_versions`, `deck_versions`). Each stores a full snapshot of the entity state at that version.

**Why:** Zero disruption to existing queries, actions, stores, and optimistic updates. Main tables remain the source of truth for current state. JSONB content (cards `data`, documents `content`) snapshots naturally. Deck versions capture card composition at a point in time. Strong FK constraints (unlike the polymorphic approach). No need to retrofit `WHERE is_current = true` across the codebase.

**When to create versions — per entity:**

| Entity | Automatic triggers | Manual trigger |
|---|---|---|
| Cards | Status change (draft→active→archived), before bulk operations (import overwrite, AI batch edit) | Explicit "Save snapshot" |
| Documents | Periodic auto-save (time-based during active editing), before AI modifications | Explicit "Save version" |
| Decks | Status change (draft→active→archived) | Explicit "Save snapshot" |

**Reason is a Postgres enum** (`version_reason_enum`): `manual`, `status_change`, `pre_import`, `pre_restore`, `pre_ai_edit`, `periodic_auto_save`. Prevents typos and makes querying reliable. Each version also has an optional `label` for user-facing names (e.g., "Before playtesting", "Final v2").

**Rationale for trigger policy:**
- **Cards:** Cell-by-cell edits in the data grid are too granular/frequent to version individually. Status transitions and pre-bulk-operation snapshots protect against destructive changes.
- **Documents:** Continuous typing in TipTap has no natural "save point." Periodic auto-save (like Google Docs version history) captures progress without user effort. Pre-AI snapshots protect against unwanted rewrites.
- **Decks:** Composition changes (add/remove card, adjust quantity) are discrete but frequent during deck building. Status transitions capture meaningful milestones. Explicit snapshots let users bookmark a composition before experimenting.

---

## 2026-03-02: AI SDK Tool Part Type Encodes Tool Name

**Context:** Needed to persist tool call results in the database and reconstruct them when reloading chat history. The AI SDK's `isToolUIPart()` and `getToolName()` helpers determine tool identity from the part's `type` field.

**Discovery:** `isStaticToolUIPart` checks `part.type.startsWith("tool-")`. `getStaticToolName` extracts the name via `part.type.split("-").slice(1).join("-")`. So a `create_document` tool has type `"tool-create_document"`.

**Decision:** Persist tool results in the `tool_calls` JSONB column of `ai_chat_messages`. On reload, reconstruct parts with `type: "tool-{name}"` plus `toolCallId`, `state: "output-available"`, and `output`. This passes `isToolUIPart()` and renders the `DocumentPreviewCard`.

**Files:** `src/components/features/ideator/ideator-client.tsx`, `src/lib/actions/chats.ts`, `src/lib/validations/chats.ts`

---

## 2026-03-02: Markdown for AI Document Creation, Not HTML

**Context:** The `create_document` tool initially asked the AI to produce HTML, then used a custom regex parser (`htmlToTiptapJson`) to convert to TipTap JSON. The regex parser was fragile — bold marks inside list items weren't converted.

**Decision:** AI now produces Markdown. `marked.lexer()` tokenizes it into an AST, then `markdownToTiptap()` maps tokens directly to TipTap JSON nodes. No HTML intermediary, no DOM dependency, fully server-safe. Handles headings, bold, italic, strikethrough, lists, blockquotes, code blocks, links, and horizontal rules.

**Files:** `src/lib/intelligence/features/ideation/tools.ts`, `src/lib/intelligence/features/ideation/logic.ts`

---

## 2026-03-02: react-resizable-panels v4.7 Uses Pixels by Default

**Context:** `ResizablePanel` `defaultSize`, `minSize`, `maxSize` were set as numbers (e.g. `defaultSize={20}`), expecting percentages. The sidebar rendered at 20 pixels wide.

**Discovery:** In v4.7, numeric values are pixels. Percentages must be strings: `defaultSize="20%"`.

**Decision:** Use string values with `%` suffix for percentage-based panel sizing.

**Files:** `src/components/features/docs/docs-client.tsx`

---

## 2026-03-02: Google Provider Tools Cannot Mix

**Context:** The ideator agent had both `google.tools.googleSearch()` and a custom `create_document` tool. The AI model would say the tool was "unavailable" — it was never sent to the API.

**Discovery:** In `@ai-sdk/google`, when provider-defined tools exist, the tool serializer returns early after processing only provider tools, skipping all custom `functionDeclarations`.

**Decision:** Exclude Google Search when custom tools are present. Trade-off: ideation loses web search when document tools are available.

**Files:** `src/lib/intelligence/core/agent.ts`

---

## 2026-03-02: TipTap generateHTML Hydration Mismatch

**Context:** `DocumentCard` used `generateHTML()` in a `useMemo` to create content previews. Server rendered empty string, client rendered `<p></p>`.

**Decision:** Move `generateHTML()` into a `useEffect` so it only runs on the client. Both server and client start with empty string, preview fills in after mount.

**Files:** `src/components/features/docs/document-card.tsx`

---

## 2026-03-02: Radix useId Hydration Mismatch

**Context:** `DropdownMenu` triggers generated different Radix `id` attributes on server vs client.

**Decision:** Wrap Radix-based interactive components in a `mounted` state guard (`useState(false)` + `useEffect(() => setMounted(true), [])`). These are interactive-only elements with no SSR/SEO value.

**Files:** `src/components/features/docs/docs-client.tsx`

---

## 2026-03-02: CSS ring-1 Clips with overflow-hidden

**Context:** Document cards used `ring-1 ring-foreground/10` for borders. Ring renders as `box-shadow`, which gets clipped by `overflow-hidden` on the card container, causing a visible outline on only one side.

**Decision:** Use `border border-foreground/10` instead of `ring-1` when the element has `overflow-hidden`.

**Files:** `src/components/features/docs/document-card.tsx`

---

## 2026-03-02: Vercel AI SDK v6 tool() uses inputSchema

**Context:** The `tool()` helper in AI SDK v6 uses `inputSchema` (not `parameters`). Using `parameters` silently fails — the tool gets no schema and the model doesn't know what arguments to pass.

**Decision:** Always use `inputSchema` with `tool()`. The helper is an identity function, so wrong property names just pass through silently.

**Files:** `src/lib/intelligence/features/ideation/tools.ts`

---

## 2026-03-02: Nested Button Hydration Error

**Context:** Document list items had a delete `<button>` inside a parent `<button>`, causing React hydration errors.

**Decision:** Use `<div role="button" tabIndex={0}>` with keyboard handlers for the outer clickable element. Only the inner delete action uses a real `<button>`.

**Files:** `src/components/features/docs/document-list.tsx`

---

## 2026-03-02: TipTap Extension-Image is Separate

**Context:** TipTap v3 consolidated many extensions into `@tiptap/extensions`, but `Image` is NOT included there.

**Decision:** Install `@tiptap/extension-image` separately and import as `import Image from "@tiptap/extension-image"`.

**Files:** `src/components/features/docs/tiptap-setup.ts`

---

## 2026-03-02: Documents are User-Scoped, Not Project-Scoped

**Context:** Documents could be scoped to projects or be independent.

**Decision:** Documents belong to a user with an optional `project_id` (nullable FK). This allows cross-project documents like general lore or style guides. The `project_id` FK uses `ON DELETE SET NULL` so deleting a project doesn't delete documents.

**Files:** `supabase/migrations/20260302100000_add_documents.sql`
