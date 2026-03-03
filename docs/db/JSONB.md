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

Defines the visual blueprint for rendering a card. Used by the layout editor (`src/components/features/layouts/`) and the card preview/export pipeline.

Types defined in `src/lib/types/canvas-elements.ts`. Elements created via `src/lib/utils/canvas-element-factory.ts`.

### Structure

An array of element objects. Three element types: `text`, `image`, `shape`. All share base fields, with type-specific fields on top.

### Base fields (all elements)

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | UUID |
| `type` | `"text" \| "image" \| "shape"` | Element kind |
| `x`, `y` | `number` | Position in pixels |
| `width`, `height` | `number` | Dimensions |
| `z_index` | `number` | Stacking order |
| `bind_to` | `string?` | Property slug — data-binds element to a card property |
| `opacity` | `number?` | 0–1, default 1 |
| `rotation` | `number?` | Degrees |
| `locked`, `hidden` | `boolean?` | UI state flags |
| `box_shadow` | `object?` | `{ color, offset_x, offset_y, blur, spread }` |

### Type-specific fields

**Text:** `static_text`, `font_size`, `font_weight` (`normal`/`bold`), `text_align`, `vertical_align`, `color`, `overflow` (`wrap`/`truncate`/`visible`), `font_family`, `line_height`, `letter_spacing`, `text_shadow`, `rich_text` (TipTap JSON)

**Image:** `static_src`, `object_fit` (`cover`/`contain`/`fill`), `border_radius`

**Shape:** `shape_type` (`rectangle`/`ellipse`/`line`), `fill`, `fill_type` (`solid`/`linear`/`radial`), `gradient` (`{ type, angle?, stops: [{ color, position }] }`), `stroke`, `stroke_width`, `border_radius`

### Example

```json
[
  {
    "id": "elem-1",
    "type": "shape",
    "x": 0, "y": 0, "width": 825, "height": 1125,
    "z_index": 0,
    "shape_type": "rectangle",
    "fill_type": "linear",
    "gradient": {
      "type": "linear", "angle": 180,
      "stops": [{ "color": "#1e3c72", "position": 0 }, { "color": "#2a5298", "position": 100 }]
    },
    "border_radius": 24
  },
  {
    "id": "elem-2",
    "type": "image",
    "x": 50, "y": 50, "width": 725, "height": 400,
    "z_index": 1,
    "bind_to": "artwork",
    "object_fit": "cover",
    "border_radius": 12
  },
  {
    "id": "elem-3",
    "type": "text",
    "x": 50, "y": 480, "width": 725, "height": 60,
    "z_index": 2,
    "bind_to": "name",
    "font_size": 36, "font_weight": "bold",
    "text_align": "center", "vertical_align": "middle",
    "color": "#ffffff", "overflow": "wrap"
  }
]
```

### Default

Empty array: `'[]'::jsonb`

---

## 4. `layouts.condition`

Conditional logic for selecting which layout applies to a card. The condition engine (`src/lib/utils/condition-engine.ts`) evaluates conditions against card data. First matching layout wins; layouts with `null` condition serve as the default fallback.

Types defined in `src/lib/types/conditions.ts`.

### Structure

```typescript
interface LayoutCondition {
  field: string;           // property slug
  operator: ComparisonOperator;
  value?: string | number | boolean | null;
}

type ComparisonOperator =
  | "eq" | "neq" | "gt" | "gte" | "lt" | "lte"
  | "is_empty" | "is_not_empty";
```

### Examples

```json
{ "field": "hp", "operator": "gte", "value": 100 }
```

```json
{ "field": "rarity", "operator": "eq", "value": "legendary" }
```

```json
{ "field": "flavor_text", "operator": "is_not_empty" }
```

### Operator support by property type

| Property type | Supported operators |
|---------------|-------------------|
| `text`, `select`, `color` | eq, neq, is_empty, is_not_empty |
| `number` | eq, neq, gt, gte, lt, lte, is_empty, is_not_empty |
| `boolean` | eq, neq |
| `image` | is_empty, is_not_empty |

### Default

`null` — layout applies to all cards (default/fallback).

---

## 5. `ai_chat_messages.tool_calls`

Stores completed AI tool invocations from the Vercel AI SDK. Persisted on `onFinish` in the ideator client, reconstructed on chat reload.

### Structure

An array of tool result objects:

```json
[
  {
    "toolName": "create_document",
    "toolCallId": "call-abc123",
    "output": {
      "success": true,
      "documentId": "doc-789",
      "title": "Spell Mechanics",
      "type": "rules"
    }
  }
]
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `toolName` | `string` | Name of the tool (e.g. `create_document`, `google_search`) |
| `toolCallId` | `string` | Unique call identifier from the AI SDK |
| `output` | `object` | The tool's return value |

### How it's saved (onFinish)

```typescript
const toolResults = message.parts
  .filter(isToolUIPart)
  .filter((p) => p.state === "output-available" && p.output)
  .map((p) => ({ toolName: getToolName(p), toolCallId: p.toolCallId, output: p.output }));
```

### How it's reconstructed (chat reload)

```typescript
for (const call of msg.tool_calls) {
  parts.push({
    type: `tool-${call.toolName}`,   // e.g. "tool-create_document"
    toolCallId: call.toolCallId,
    state: "output-available",
    input: {},
    output: call.output,
  });
}
```

The `type: "tool-{name}"` format is required by the AI SDK's `isToolUIPart()` / `getToolName()` helpers.

### Default

`null` — most messages have no tool calls.

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
