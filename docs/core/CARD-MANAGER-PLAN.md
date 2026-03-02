# Card Manager Implementation Plan

This document outlines the roadmap for building the core "Card Manager" interface, where the **Data (Excel view)** meets the **Design (Illustrator view)**.

## Goals & Objectives

1.  **Frictionless Data Entry:** Spreadsheet-like experience for rapid card creation and editing.
2.  **Dynamic Schema Flexibility:** Instant UI updates when adding/modifying card properties (columns).
3.  **Live Visual Feedback:** Real-time card preview updates as data is entered.
4.  **Separation of Concerns:** Decouple content (Data) from presentation (Layout) for multi-format flexibility.

## Phase 1: The Dynamic Data Engine
*Objective: Build the infrastructure to handle user-defined schemas.*

*   **State Management:** Implement robust local store (Zustand + TanStack Query) to handle dynamic data shapes.
*   **Data Fetching:** Create efficient API to fetch `Game + Properties + Cards` in a single request.
*   **Property Manager UI:** Build interface to manage the `properties` table (Add/Rename/Reorder columns, Change types).
*   **Type Handling:** Ensure the frontend gracefully handles dynamic property types (text, number, image, select).

## Phase 2: The "Excel" Grid (Data View)
*Objective: Create the high-performance spreadsheet interface.*

*   **Grid Component:** Implement **TanStack Table** (React Table) for headless data logic.
*   **Dynamic Columns:** Map `properties` to table columns with appropriate cell renderers (e.g., Image upload for 'image' type).
*   **Inline Editing:** Enable "Click to Edit" functionality with optimistic UI updates.
*   **Bulk Actions:** Add support for multi-row selection, deletion, and card duplication.

## Phase 3: The "Illustrator" Canvas (Design View)
*Objective: Build the vector-based layout editor.*

*   **Canvas Engine:** Integrate **Fabric.js** for vector manipulation and layer management.
*   **Visual Structure:** Render card dimensions (`width`, `height`) with "Bleed Line" and "Safe Zone" indicators.
*   **Element Types:** Support both Static Elements (frames, copyright) and Dynamic Elements (data placeholders).
*   **Data Binding:** Implement "Connect to Data" context menu to link visual elements to `property.slug`.

## Phase 4: Integration (Split View)
*Objective: Connect the Grid to the Canvas.*

*   **Layout Integration:** Combine Grid (Data) and Canvas (Preview) into a unified workspace.
*   **Sync Logic:** Link Grid row selection to the Canvas preview state.
*   **Real-Time Rendering:** Ensure Canvas updates instantly as data is typed into the Grid.

## Phase 5: Export & Production
*Objective: Turn digital data into printable assets.*

*   **PDF Generation:** Render high-resolution PDFs from Canvas state.
*   **Imposition:** Implement 3x3 grid layout (9 cards/page) for standard printing.
*   **Image Export:** Batch export functionality for digital platforms (e.g., Tabletop Simulator).
