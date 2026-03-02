# AI Intelligence System

How the AI features work in Cardlab. For architecture context see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Stack

- **Vercel AI SDK v6** (`ai` package) — agent loop, streaming, tool definitions
- **Google Gemini** (`@ai-sdk/google`) — LLM provider
- **Models:** `gemini-2.5-flash` (default, fast), `gemini-2.5-pro` (higher quality)
- **Image models:** `gemini-2.5-flash-image`, `gemini-3-pro-image-preview`

## File Structure

```
src/lib/intelligence/
├── core/
│   ├── agent.ts          # ToolLoopAgent factory (shared by all features)
│   ├── providers.ts      # Style presets, aspect ratios, image model configs
│   └── types.ts          # Shared types (AspectRatio, ImageModel, StylePreset)
└── features/
    ├── ideation/
    │   ├── logic.ts      # Creates ideation agent with system prompt
    │   ├── tools.ts      # create_document tool + HTML→TipTap converter
    │   ├── types.ts      # IdeationStreamParams
    │   └── index.ts      # Public exports
    └── image-generation/
        ├── logic.ts      # generateImages() with parallel generation
        ├── types.ts      # GenerateParams, GeneratedImage, GenerationResult
        └── index.ts      # Public exports

src/app/api/chat/route.ts  # Streaming endpoint for ideation chat
```

## Core Agent Factory

`createAgent()` in `core/agent.ts` builds a `ToolLoopAgent` from the Vercel AI SDK.

```
createAgent({ instructions, model?, maxSteps?, tools? })
  → ToolLoopAgent with Gemini model + configured tools
```

Each feature wraps this with its own system prompt and tools. The factory handles a critical constraint (see Known Issues below).

## Ideation Chat

### Flow

```
Client (useChat hook)
  → POST /api/chat  { messages, model }
  → Auth check (Supabase)
  → createIdeationAgent({ model, supabase, userId })
  → ToolLoopAgent runs reasoning loop (up to 10 steps)
  → createAgentUIStreamResponse() streams back to client
  → onFinish: persist messages to ai_chat_messages table
```

### System Prompt

The ideation agent is a card game design assistant. It can brainstorm mechanics, suggest card designs, and create design documents. Key instruction: when the user asks to "create/write/draft" a document, the agent MUST call the `create_document` tool instead of writing content in the chat.

### Tools

**`create_document`** — Creates a rich text document in the docs system.

Input:
- `title` (string) — document title
- `type` (optional enum) — theme, lore, rules, card_types, sets, distribution, art_style_guide, keywords, resource_system, balance_rules
- `content` (string) — HTML content with `<h2>`, `<p>`, `<ul>`, `<strong>`, etc.

Execution:
1. Receives HTML from the AI agent
2. Converts to TipTap JSON via `htmlToTiptapJson()` (regex-based parser handling headings, paragraphs, lists, blockquotes, bold/italic marks)
3. Persists via `docRepo.createDocument()` with the user's ID
4. Returns `{ success, documentId, title }` to the agent

### Client Integration

`IdeatorClient` uses `useChat()` from `@ai-sdk/react` with `DefaultChatTransport`. Messages are stored in component state during the session. On `onFinish`, user and assistant text are persisted to the `ai_chat_messages` table for history.

The chat UI renders tool call states (streaming/available/done) inline with message text. A dev-only debug panel shows the raw JSON of all messages including tool calls.

## Image Generation

Separate from the chat system — not agent-based, just direct `generateImage()` calls.

```
generateImages({ prompt, mode, model, aspectRatio, numberOfImages, ... })
  → Appends style preset suffix to prompt
  → Parallel generateImage() calls (Gemini doesn't support n > 1)
  → Returns GeneratedImage[] with base64 data + metadata
```

Supports two modes:
- **generate** — text-to-image
- **edit** — inpainting with a source image

8 style presets (None, Photorealistic, Digital Art, Oil Painting, Watercolor, Anime, Pixel Art, Fantasy, Card Game Art) each append a suffix to the prompt.

## Known Issues

### Google Provider Tool Limitation

**`@ai-sdk/google` cannot mix provider-defined tools with custom function tools.**

When `hasProviderTools` is true (e.g., `google.tools.googleSearch()`), the provider's tool serializer returns early, **dropping all custom `functionDeclarations`**. This means custom tools like `create_document` are silently ignored.

**Workaround in `agent.ts`:** When custom tools are provided, Google Search is excluded. When no custom tools exist, Google Search is included.

```typescript
tools: hasCustomTools
  ? tools
  : { google_search: google.tools.googleSearch({}) },
```

This is a limitation in `@ai-sdk/google`, not the Vercel AI SDK core. If Google fixes the early return in their provider, both tool types could coexist.

### TipTap Content & SSR

- `generateHTML()` from `@tiptap/react` produces different output server vs client → use `useEffect` for client-only rendering
- TipTap's `@tiptap/extension-image` is a separate package from `@tiptap/extensions`
- Document content is stored as JSONB (TipTap JSON format), images use Supabase storage paths that are resolved to signed URLs on load

### Radix UI Hydration

Radix primitives use `useId()` which generates different IDs on server vs client. Interactive-only components (dropdowns, menus) should be deferred to client rendering with a `mounted` state guard.
