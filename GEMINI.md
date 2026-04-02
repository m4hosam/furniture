# GEMINI.md — Antigravity / Gemini Configuration for Floor Planner

This file configures the AI assistant (Antigravity / Gemini) for this specific project.
It complements `AGENTS.md` (general coding rules) with tool-use preferences, workflow hints,
and project-specific conventions.

---

## Project Identity

- **Name:** Floor Planner
- **Type:** Browser-only React SPA (Vite)
- **Domain:** `http://localhost:5173` (dev) or next available port
- **Entry point:** `src/main.jsx` → `src/App.jsx`
- **Style system:** Tailwind CSS **v4** (`@import "tailwindcss"`)
- **Full docs:** [`DEVELOPMENT.md`](./DEVELOPMENT.md)
- **Coding rules:** [`AGENTS.md`](./AGENTS.md)

---

## Architecture at a Glance

```
App.jsx (orchestrator, ~50 lines)
 ├── useApartment()   → floor dimensions + localStorage
 ├── useElements()    → all element CRUD, layers, selection
 ├── useFileIO()      → JSON export/import + reset
 ├── <Sidebar>        → all left-panel UI (stateless)
 └── <Canvas>         → SVG rendering + drag via useDrag()
```

All state lives in `src/hooks/`. All UI components in `src/components/`. Pure utilities in `src/utils/geometry.js`.

---

## Tool-Use Preferences

### Editing files

- Prefer `multi_replace_file_content` for non-contiguous edits.
- Always read the file with `view_file` before editing if you don't have its current content.
- For new hook or component files, use `write_to_file`.
- Hooks go in `src/hooks/`. Components go in `src/components/{Canvas,Sidebar}/`. Utilities go in `src/utils/`.

### Running commands

- Dev server: `npm run dev` in `e:\m4hosam\furniture-app`
- Lint check: `npm run lint`
- **Never** run `npm run build` unless explicitly asked — the dev server is always preferred for verification.

### Browser verification

- After making visual changes, use `browser_subagent` to open `http://localhost:5173` (or `5174` if that port is taken) and take a screenshot.
- Always verify the screenshot with `view_file` after the subagent returns — do not trust the subagent's text description alone.

---

## Important Patterns — Follow These Exactly

### 1. Adding element types
```
geometry.js (getElementStyle) → useElements.js (defaults) → BuildTools.jsx → LayersPanel.jsx
```

### 2. Adding a sidebar section
```
Create Sidebar/MyPanel.jsx (stateless) → import in Sidebar/index.jsx → pass props from App.jsx
```

### 3. Updating element state
```js
// ✅ correct — always use the named updater
updateSelected('name', newValue)

// ❌ wrong — never bypass the hook
setElements(prev => prev.map(el => el.id === selectedId ? { ...el, name: newValue } : el))
// (this pattern is fine inside the hook itself, not from components)
```

### 4. Generating IDs
```js
import { generateId } from '../utils/geometry';
const id = generateId(); // ✅

const id = Date.now();   // ❌
const id = Math.random(); // ❌
```

---

## Key Files — Quick Reference

| File | What to touch it for |
|---|---|
| `src/App.jsx` | Wiring only — new hook calls, new top-level props |
| `src/index.css` | Global CSS, custom scrollbar, font imports |
| `src/utils/geometry.js` | New element colours, new utility functions |
| `src/hooks/useElements.js` | New element types, new CRUD operations, layer logic |
| `src/hooks/useDrag.js` | Drag behaviour changes, snapping, new drag types |
| `src/hooks/useApartment.js` | Apartment config fields (e.g. adding a name or scale) |
| `src/hooks/useFileIO.js` | Export/import format changes |
| `src/components/Canvas/CanvasElement.jsx` | Visual appearance of elements, new shapes |
| `src/components/Canvas/CanvasGrid.jsx` | Grid density, grid colour |
| `src/components/Sidebar/BuildTools.jsx` | New "Add X" buttons |
| `src/components/Sidebar/PropertiesPanel.jsx` | New per-element properties |
| `src/components/Sidebar/LayersPanel.jsx` | Layer list appearance, type badges |

---

## localStorage Keys

| Key | Owner | Content |
|---|---|---|
| `"apartmentConfig"` | `useApartment` | `{ width, depth }` |
| `"apartmentElements"` | `useElements` | `Element[]` |

Do not add new keys without updating the `resetLayout` function in `useFileIO.js` to clear them on reset.

---

## Tailwind CSS v4 Notes

This project uses **Tailwind v4**, which differs from v3:

| Feature | v3 syntax | v4 syntax |
|---|---|---|
| Import | `@tailwind base; @tailwind components; @tailwind utilities;` | `@import "tailwindcss";` |
| Config | `tailwind.config.js` with `content` array | Auto-detected by `@tailwindcss/vite` plugin |
| Arbitrary values | `bg-[#abc]` | Same ✅ |
| Utility classes | Standard | Same ✅ |

**Do not add a `tailwind.config.js`** — the `@tailwindcss/vite` plugin handles config automatically.

---

## SVG Coordinate System

The canvas is an SVG with `viewBox="0 0 {apartment.width} {apartment.depth}"`.
- 1 user unit = 1 cm
- Elements use `x`, `y`, `w`, `h` in these units
- Pointer events deliver **pixel** coordinates — `useDrag.getMouseCoords()` converts them to SVG space via `getScreenCTM().inverse()`. Do not bypass this conversion.

---

## Drag Engine — Critical Detail

`useDrag` uses **pointer capture** (`e.target.setPointerCapture`) so that dragging continues even when the mouse moves off the element. If you modify drag event wiring, ensure:

1. `handlePointerDown` is called with `e.stopPropagation()` to prevent parent deselect
2. `handlePointerUp` calls `e.target.releasePointerCapture(e.pointerId)`
3. `onPointerLeave` on the SVG also triggers `handlePointerUp` (emergency stop)

---

## What NOT to Do

- ❌ Do not add `useState` for business logic inside any component — put it in a hook.
- ❌ Do not add React Context — prop drilling is intentional at this scale.
- ❌ Do not install new dependencies without asking the user first.
- ❌ Do not use `document.getElementById` or direct DOM manipulation — always use React state.
- ❌ Do not add Tailwind v3 config files or `@tailwind` directives.
- ❌ Do not break the `children-move-with-parent` behaviour in `useDrag`.

---

## Planning Mode

For non-trivial changes, create an `implementation_plan.md` and wait for user approval before editing source files. Examples that **require a plan**:

- Adding a new canvas feature (e.g. rotate handle, resize handles, multi-select)
- Changing the data model (e.g. adding a new field to Element)
- Adding a new dependency
- Refactoring multiple files

Examples that **do not require a plan** (just do it):

- Adding a new element type (follow the 4-step recipe in AGENTS.md)
- Fixing a visual bug (wrong colour, wrong spacing)
- Adding a new sidebar panel with no new state
- Updating text / labels
