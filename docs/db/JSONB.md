# JSONB Column Schemas

Every JSONB column in the database, what goes in it, what comes out, and how the application code reads/writes it. No ambiguity.

---

## Overview

| Column | Table | Nullable | Purpose |
|--------|-------|----------|---------|
| `data` | cards | No (default `{}`) | All dynamic property values for a card |
| `options` | properties | Yes | Allowed values for select-type properties |
| `canvas_elements` | layouts | No (default `[]`) | Visual elements for card rendering |
| `condition` | layouts | Yes | Conditional logic for layout selection |
| `tool_calls` | ai_chat_messages | Yes | AI tool invocations (OpenAI format) |

---

## 1. `cards.data`

The most important JSONB column. Stores every user-editable value on a card.

### Structure

Keys are **property slugs** (from the `properties` table). Values depend on the property type.

```json
{
  "<property_slug>": <value>,
  "<property_slug>": <value>
}
```

### Value types per property type

| Property Type | Value Type | Example | Notes |
|---------------|-----------|---------|-------|
| `text` | `string` | `"Goblin Scout"` | Empty string is valid |
| `number` | `number \| null` | `5`, `3.5`, `null` | Parsed with `Number()`, `NaN` becomes `null` |
| `boolean` | `boolean` | `true`, `false` | Strict — only `true` counts as checked |
| `select` | `string` | `"Common"` | Must be one of `properties.options` values |
| `color` | `string` | `"#ff6b35"` | Hex color, defaults to `#000000` if missing |
| `image` | `string \| null` | `"a1b2c3d4-..."` | UUID referencing `media.id`. Legacy: `"https://..."` |

### Full examples

**Fantasy Battle card:**
```json
{
  "name": "Phoenix Lord",
  "attack": 7,
  "defense": 3,
  "rarity": "Legendary",
  "is-legendary": true,
  "border-color": "#ff6b35"
}
```

**Space Traders card:**
```json
{
  "name": "Fuel Depot",
  "cost": 3,
  "resource-type": "Fuel",
  "tradeable": true,
  "card-color": "#ff8c00",
  "description": "Produces 2 fuel per turn"
}
```

**Quiz Night card:**
```json
{
  "question": "What planet is known as the Red Planet?",
  "answer": "Mars",
  "category": "Science",
  "difficulty": 1,
  "is-bonus": false
}
```

**Card with image (media reference):**
```json
{
  "name": "Dragon Warrior",
  "artwork": "e7f3a1b2-4c5d-6e7f-8a9b-0c1d2e3f4a5b"
}
```

**Empty new card:**
```json
{}
```

### How `data` is written

Single cell updates use a **merge** pattern — the existing data is spread, then the new key overwrites:

```typescript
// Repository: src/lib/repository/cards.ts
const mergedData = {
  ...(typeof existing.data === "object" && existing.data !== null
    ? existing.data
    : {}),
  ...cellData,
};
```

Setting a value to `null` keeps the key but nulls the value. This is intentional — it distinguishes "never set" from "explicitly cleared".

### How `data` is read

Each cell component casts and reads its specific key:

```typescript
const data = typeof card.data === "object" && card.data !== null
  ? (card.data as Record<string, unknown>)
  : {};
const value = data[property.slug];
```

### Index

GIN index `idx_cards_data` enables efficient JSONB queries:
```sql
SELECT * FROM cards WHERE data @> '{"rarity": "Legendary"}';
```

---

## 2. `properties.options`

Only used when `properties.type = 'select'`. Ignored for all other types.

### Structure

A flat JSON array of strings:

```json
["Option A", "Option B", "Option C"]
```

### Examples

**Rarity options:**
```json
["Common", "Uncommon", "Rare", "Legendary"]
```

**Resource types:**
```json
["Fuel", "Metal", "Crystal", "Food", "Tech"]
```

**Categories:**
```json
["Science", "History", "Geography", "Entertainment", "Sports"]
```

### Rules

- `null` when property type is not `select`
- Must be a non-empty array when type is `select` (enforced by UI, not DB)
- Values are plain strings — no objects, no nested arrays
- The value stored in `cards.data[slug]` must be one of these strings

### How options are stored

```typescript
// Repository: src/lib/repository/properties.ts
{
  options: input.options ?? null
}
```

### How options are read

```typescript
// Cell renderer: src/components/features/cards/cell-renderer.tsx
const options = Array.isArray(property.options)
  ? (property.options as string[])
  : [];
```

---

## 3. `layouts.canvas_elements`

Defines the visual blueprint for rendering a card. **Not yet actively used** — reserved for the future layout editor/renderer.

### Structure

An array of element objects, each describing a visual element bound to a property:

```json
[
  {
    "type": "text",
    "bind_to": "name",
    "x": 10,
    "y": 10
  },
  {
    "type": "image",
    "bind_to": "artwork",
    "x": 0,
    "y": 50,
    "width": 300,
    "height": 200
  }
]
```

### Element fields

| Field | Type | Description |
|-------|------|-------------|
| `type` | `string` | Element kind: `"text"`, `"image"`, `"shape"`, etc. |
| `bind_to` | `string` | Property slug this element displays |
| `x` | `number` | Horizontal position |
| `y` | `number` | Vertical position |
| (varies) | varies | Type-specific fields like `width`, `height`, `font_size` |

### Default

Empty array: `'[]'::jsonb`

---

## 4. `layouts.condition`

Conditional logic for selecting which layout applies to a card. **Not yet implemented** — the schema reserves the column for future use.

### Structure

```json
null
```

Future planned shape (not finalized):
```json
{
  "field": "rarity",
  "operator": "eq",
  "value": "Legendary"
}
```

---

## 5. `ai_chat_messages.tool_calls`

Stores AI assistant tool invocations in OpenAI function-calling format.

### Structure

An array of tool call objects:

```json
[
  {
    "id": "call_abc123",
    "type": "function",
    "function": {
      "name": "search_cards",
      "arguments": "{\"query\": \"legendary creatures\"}"
    }
  }
]
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique call identifier |
| `type` | `string` | Always `"function"` |
| `function.name` | `string` | Name of the called function |
| `function.arguments` | `string` | JSON-encoded arguments (string, not object) |

### Default

`null` — most messages have no tool calls.

### How it's stored

```typescript
// Repository: src/lib/repository/chats.ts
{
  tool_calls: params.toolCalls ?? null
}
```

---

## Quick reference: TypeScript types

All JSONB columns use the Supabase `Json` type:

```typescript
// From src/lib/supabase/database.types.ts
type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]
```

In practice, application code casts to specific shapes:

```typescript
// cards.data → Record<string, unknown>
const data = card.data as Record<string, unknown>;

// properties.options → string[]
const options = property.options as string[];

// Merging data with type safety
const merged = {
  ...(c.data as Record<string, Json>),
  [slug]: value as Json,
};
```
