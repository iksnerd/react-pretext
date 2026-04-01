# react-pretext

React primitives for [`@chenglou/pretext`](https://github.com/chenglou/pretext) — a DOM-free text measurement library that uses the Canvas font engine to compute precise text layout without touching the DOM.

**~0.09ms per layout call. No reflow. No layout thrashing.**

## Live Demos

- `/` — Interactive playground: adjust font, container width, line height, and max lines in real time
- `/landing` — Creative showcase of 8 text effects only possible with synchronous, DOM-free measurement

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the playground, or [http://localhost:3000/landing](http://localhost:3000/landing) for the effects showcase.

## API

### Hooks

All hooks are in `lib/pretext/` and exported from `lib/pretext/index.ts`.

#### `useTextLines(text, font, maxWidth, lineHeight, options?)`

The main all-in-one hook. Prepares and lays out text, returning per-line data.

```tsx
const { lines, height, lineCount } = useTextLines(
  "Hello world",
  "16px sans-serif",
  containerWidth,
  24
);
```

Returns `{ lines: Array<{ text, width }>, height, lineCount, prepared }`.

#### `usePreparedText(text, font, options?)`

Memoized preparation step — use when you want to share a `PreparedTextWithSegments` across multiple layout calls (e.g. `useTextLayout` + `layoutNextLine`).

```tsx
const prepared = usePreparedText("Hello world", "16px sans-serif");
```

#### `useTextLayout(prepared, maxWidth, lineHeight)`

Layout only — takes an already-prepared text object. Returns `{ height, lineCount }`.

#### `useContainerWidth(ref)`

ResizeObserver-based container width tracking. Returns `0` on initial render (before the observer fires).

```tsx
const containerRef = useRef<HTMLDivElement>(null);
const width = useContainerWidth(containerRef);
```

### Components

#### `<MeasuredText>`

Render prop component. Measures text at the given width and exposes layout info to children.

```tsx
<MeasuredText text="Hello" font="16px sans-serif" maxWidth={400} lineHeight={24}>
  {({ height, lineCount, measuredWidth }) => (
    <div style={{ height }}>measured: {lineCount} lines</div>
  )}
</MeasuredText>
```

Props: `text`, `font`, `maxWidth`, `lineHeight`, `style?`, `options?`, `children: (info: MeasuredTextInfo) => ReactNode`

#### `<TextLines>`

Renders each line of text, optionally with a custom `renderLine` callback.

```tsx
<TextLines
  text="Hello world"
  font="16px sans-serif"
  maxWidth={400}
  lineHeight={24}
  renderLine={({ text, width, index, isFirst, isLast }) => (
    <div key={index} style={{ opacity: isLast ? 0.5 : 1 }}>{text}</div>
  )}
/>
```

Props: `text`, `font`, `maxWidth`, `lineHeight`, `options?`, `renderLine?: (line: LineInfo) => ReactNode`

#### `<VirtualText>`

Virtualized rendering for long text — only renders lines in the visible viewport.

```tsx
<VirtualText
  text={longText}
  font="16px sans-serif"
  maxWidth={600}
  lineHeight={24}
  containerHeight={400}
  onVisibleRangeChange={({ start, end }) => console.log(start, end)}
/>
```

Props: `text`, `font`, `maxWidth`, `lineHeight`, `containerHeight`, `options?`, `onVisibleRangeChange?`

#### `<BalancedText>`

Finds the narrowest container width that doesn't add extra lines vs. the natural layout — producing visually balanced line breaks.

```tsx
<BalancedText
  text="A headline that should break evenly"
  font="32px Georgia"
  maxWidth={800}
  lineHeight={44}
/>
```

Props: `text`, `font`, `maxWidth`, `lineHeight`, `options?`, `className?`, `style?`

#### `<TruncatedText>`

Truncates to N lines with an ellipsis, with an optional expand/collapse toggle.

```tsx
<TruncatedText
  text={longText}
  font="16px sans-serif"
  maxWidth={400}
  lineHeight={24}
  maxLines={3}
  expandable
/>
```

Props: `text`, `font`, `maxWidth`, `lineHeight`, `maxLines`, `options?`, `expandable?`, `className?`

#### `<PretextProvider>`

Context provider for default `font` and `lineHeight` values.

```tsx
<PretextProvider value={{ font: "16px Inter", lineHeight: 26 }}>
  {/* components read defaults from context */}
</PretextProvider>
```

## Landing Page Effects

Eight text effects at `/landing` — all built without external animation libraries (CSS transitions, `requestAnimationFrame`, and `IntersectionObserver` only):

| # | Effect | Technique |
|---|--------|-----------|
| 1 | **Kinetic Line Reveal** | IntersectionObserver triggers staggered fade + slide with `cubic-bezier` spring easing |
| 2 | **Mouse-Reactive Text** | Imperative rAF loop — no React re-renders on mousemove; translateX/scale/glow by proximity |
| 3 | **Fluid Reflow** | CSS width transition + ResizeObserver continuously re-layouts text during animation |
| 4 | **Canvas Glow Effects** | Canvas 2D with dual glow layers, animated hue-shift gradients, DPR scaling |
| 5 | **Balanced Headlines** | Side-by-side `BalancedText` vs unbalanced, with pixel-accurate width annotations |
| 6 | **Shaped Text** | `layoutNextLine()` with per-row maxWidth from circle/diamond/wave shape functions |
| 7 | **Scroll Word Reveal** | 280vh sticky section, word-by-word reveal synced to scroll progress |
| 8 | **Split-Screen Comparison** | Draggable divider, both panels reflow in real time as serif vs monospace widths change |

## Why DOM-Free Measurement?

Traditional text measurement forces browser layout (reflow). `@chenglou/pretext` runs the same Canvas font engine used by browsers — synchronously, in JS, without any DOM interaction. This enables:

- Layout during render without side effects
- Continuous reflow during CSS animations (Section 3)
- Imperative per-frame layout in rAF loops (Section 2)
- Server-side text layout (with `OffscreenCanvas` or Node canvas)
- Virtualization based on exact line counts (Section 7)

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [React 19](https://react.dev) with React Compiler
- TypeScript 5
- Tailwind CSS 4
- [`@chenglou/pretext`](https://github.com/chenglou/pretext)
