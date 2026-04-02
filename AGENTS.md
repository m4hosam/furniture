# AGENTS.md — AI Coding Guide for Floor Planner

This file tells any AI coding agent how this project is structured, what patterns to follow, and what to avoid. Read this before making any changes.

---

## Project Overview

**Floor Planner** is a browser-only, client-side apartment layout editor. Users drag and drop rooms, furniture, doors, and windows onto an SVG canvas, then export the layout as JSON.

- No backend, no database, no authentication.
- All state is in React hooks, persisted to `localStorage`.
- Rendering is done via SVG (not a canvas element, not a third-party diagram library).
- Styling uses **Tailwind CSS v4** (`@import "tailwindcss"` syntax — not v3).

---

## Tech Stack

| Tool | Version | Notes |
|---|---|---|
| React | 19 | Use functional components + hooks only. No class components. |
| Vite | 8 | Dev server on port 5173 (or next available) |
| Tailwind CSS | 4 | Uses `@import "tailwindcss"` in `index.css`. **Not** the v3 `@tailwind` directives. |
| JavaScript | ESM | `.jsx` extension for all React files. No TypeScript. |

---

## File Structure & Responsibilities

```
src/
├── App.jsx                    — Thin orchestrator only. No business logic here.
├── index.css                  — @import tailwindcss, Inter font, scrollbar styles
│
├── utils/geometry.js          — Pure functions. No React. No side effects.
│
├── hooks/
│   ├── useApartment.js        — Apartment dimensions state + localStorage
│   ├── useElements.js         — ALL element CRUD, layers, selection
│   ├── useDrag.js             — SVG pointer/drag engine
│   └── useFileIO.js           — JSON export/import + layout reset
│
└── components/
    ├── Canvas/
    │   ├── CanvasGrid.jsx     — SVG grid patterns only (no logic)
    │   ├── CanvasElement.jsx  — Renders one element (rect or polygon)
    │   └── index.jsx          — SVG canvas, mounts useDrag internally
    └── Sidebar/
        ├── FileSync.jsx
        ├── ApartmentSettings.jsx
        ├── BuildTools.jsx
        ├── PropertiesPanel.jsx
        ├── LayersPanel.jsx
        └── index.jsx          — Sidebar container + branded header
```

Full API documentation for every hook and component is in [`DEVELOPMENT.md`](./DEVELOPMENT.md).

---

## Data Model

### `apartment`
```js
{ width: number, depth: number }  // cm, stored in localStorage["apartmentConfig"]
```

### `Element` (rect)
```js
{
  id: string,          // generateId() from utils/geometry.js
  type: 'room' | 'furniture' | 'door' | 'window',
  shape: 'rect',
  name: string,
  x: number, y: number,   // top-left corner in SVG user units (cm)
  w: number, h: number,   // dimensions in cm
  parentId: string | null
}
```

### `Element` (polygon)
```js
{
  id, type: 'room', shape: 'polygon',
  name: string,
  x: number, y: number,        // group offset
  points: Array<{ x, y }>,    // relative to group offset
  parentId: null
}
```

**Z-order = array order.** Last element in the array renders on top.  
`bringToFront` → move to end. `sendToBack` → move to start.

---

## Coding Conventions

### DO follow these patterns

1. **All state lives in hooks.** Components are stateless display layers.
   - ✅ `const { elements } = useElements()` in `App.jsx`
   - ❌ `const [elements, setElements] = useState()` inside a component

2. **App.jsx is a wiring file only.** Do not add JSX logic, conditionals, or inline handlers there.

3. **Visual styles belong in `utils/geometry.js → getElementStyle()`.** Never hardcode colours directly in `CanvasElement.jsx`.

4. **Element IDs must be generated with `generateId()`** from `utils/geometry.js`. Never use `Date.now()` or array index as an ID.

5. **All Sidebar panels are stateless.** They receive props + fire callbacks. No internal state.

6. **Tailwind v4 only.** Use utility classes. Do not write custom CSS except in `index.css` for global concerns (scrollbar, base styles).

7. **localStorage sync is automatic.** `useApartment` and `useElements` sync to storage via `useEffect` on every state change. Do not add extra `localStorage.setItem` calls anywhere else.

8. **React functional updates** — always use the functional form `setElements(prev => ...)` inside hooks to avoid stale closure bugs.

9. **`setElements` is exposed but treat it as an escape hatch.** For normal operations, use the named functions (`addRectElement`, `updateSelected`, etc.). Only use `setElements` directly for bulk operations like JSON import.

### DO NOT

- ❌ Add a state management library (Redux, Zustand, Jotai, etc.). The hook model is intentional.
- ❌ Add a React Context. Prop drilling is deliberate at this scale.
- ❌ Use `Math.random()` or `Date.now()` for element IDs — always use `generateId()`.
- ❌ Use `useRef` to store element state — refs are only for `svgRef` and `fileInputRef`.
- ❌ Use Tailwind v3 syntax like `@tailwind base` — this project uses v4.
- ❌ Import from `react-dom` directly unless adding a Portal.
- ❌ Add `console.log` to production code paths.

---

## How to Add a New Element Type

1. **`src/utils/geometry.js`** — add a `case` to `getElementStyle()`.
2. **`src/hooks/useElements.js`** — add default dimensions to `addRectElement()`'s `defaults` object.
3. **`src/components/Sidebar/BuildTools.jsx`** — add a button calling `onAddRect('newtype')`.
4. **`src/components/Sidebar/LayersPanel.jsx`** — add entries to `TYPE_DOT` and `TYPE_LABEL` maps.

Everything else (canvas render, drag, properties panel, export/import) works automatically.

---

## Key Behaviours to Preserve

| Behaviour | Where it lives | Risk |
|---|---|---|
| Children move with parent rooms | `useDrag.js` — `dragInfo.children` snapshot | High — easy to break |
| Deleting a room un-parents children (does not delete them) | `useElements.deleteElement` | High |
| Polygon vertex editing | `useDrag.js` dragType `'vertex'` + `CanvasElement.jsx` | Medium |
| SVG coordinate conversion | `useDrag.getMouseCoords` via `getScreenCTM().inverse()` | High — do not simplify |
| Pointer capture for smooth drag | `e.target.setPointerCapture(e.pointerId)` in `useDrag` | Medium |
| Z-order = array order | Throughout `useElements` layer functions | Medium |
| localStorage auto-save | `useEffect` in `useApartment` + `useElements` | Low |

---

## Running the Project

```bash
npm install          # first time only
npm run dev          # start dev server (http://localhost:5173)
npm run lint         # ESLint
npm run build        # production build
```

No environment variables needed. The app is entirely client-side.

---

## Full Documentation

See [`DEVELOPMENT.md`](./DEVELOPMENT.md) for:
- Full hook API reference tables
- Component prop tables
- Data flow step-by-step traces
- Extension recipes (new shapes, snapping, new panels)
- Design system token reference
