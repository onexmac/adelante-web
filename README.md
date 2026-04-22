# Adelante — Web Design System

Web reference implementation of the SwiftUI Adelante prototype (Losa Flotante / Confirm flow). One vocabulary for motion, one for haptics, six components, and a full prototype screen, all behind a small docs site.

This repo is a **prototyping environment**, not production code. Goal: communicate the *feel* of an interaction so that engineers (or another Claude session) can build the same thing inside any real app.

> **Read [`docs/GPU_TRANSFORMS.md`](./docs/GPU_TRANSFORMS.md) first** if you're about to touch any animation. It's the checklist we use to avoid the "cold start" wonkiness and jank that's easy to accidentally introduce on the web.

---

## Run it

```bash
cd ~/Documents/claudecode/adelante-web
npm install      # only the first time
npm run dev      # http://localhost:3000
```

`npm run build` then `npm start` for a production build (already verified — all 13 routes statically prerender).

---

## What's here

```
app/
├── page.tsx                      Overview / landing
├── motion/                       6 named springs, replayable
├── haptics/                      Vocabulary playground (silent on iOS Safari)
├── colors/                       Token swatches + radii
├── components/
│   ├── page.tsx                  Index
│   ├── pressable-button/         Halo press style
│   ├── checkbox-mark/            Custom checkbox
│   ├── quantity-slider/          Drag to set qty, supports excess
│   ├── slide-to-confirm/         Drag-to-commit + nudge
│   ├── pedir-bar/                Bottom-bar state machine
│   └── package-card/             Expandable card
└── prototype/                    The full Confirm screen, in a phone-sized frame

components/
├── ui/                           The six components (each one self-contained)
├── ds/                           Docs scaffolding (header, theme toggle, showcase)
├── providers/                    next-themes wrapper
└── package-confirm-screen.tsx    Composition of the prototype

lib/
├── springs.ts                    Motion vocabulary
├── haptic.ts                     Web Vibration vocabulary
├── types.ts                      Mock package types
├── mock-data.ts                  Three sample packages, deterministic IDs
└── utils.ts                      cn() (clsx + tailwind-merge)
```

---

## Stack (and why each piece)

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack) | Static prerender for every showcase route; one repo, no separate Storybook |
| Language | TypeScript | Mirrors SwiftUI's strictness |
| Styling | Tailwind v4 with `@theme` | Tokens live in `app/globals.css`, exposed as Tailwind classes — `bg-brand`, `text-muted-foreground`, `rounded-pill` |
| Motion | `motion` (motion/react) | Drag with rubber-band, `useMotionValue` for GPU transforms, `useMotionValueEvent` for cheap drag-time hooks |
| Icons | [`@phosphor-icons/react`](https://phosphoricons.com) | Consistent shape language, weight variants (`regular` / `bold` / `fill` / etc.), good Figma parity. Swap-out target when Figma-exported SVGs are available. |
| Theming | `next-themes` (class-based) | Manual light/dark toggle + system, no flash on load |
| Class util | `clsx` + `tailwind-merge` via `cn()` | Standard shadcn pattern |

What's intentionally **not** here yet:

- **TanStack Query** — the prototype mutates local state directly; no server to optimistic-update against. Add when you wire to a real backend.
- **@dnd-kit** — no list reordering or kanban in this screen. Reserve for those.
- **shadcn/ui generators** — the buttons we need have a custom press treatment; importing shadcn's Button and overriding its press state is more work than building from scratch. We use shadcn's *patterns* (the `cn()` helper, the variant-style props), not its components.

---

## File map vs. the SwiftUI prototype

| SwiftUI | React |
|---|---|
| `Motion/Springs.swift` | `lib/springs.ts` |
| `Haptics/HapticEngine.swift` | `lib/haptic.ts` |
| `Mocks/MockData.swift` | `lib/mock-data.ts` + `lib/types.ts` |
| `Components/SlideToConfirm.swift` | `components/ui/slide-to-confirm.tsx` |
| `Components/PedirBar.swift` | `components/ui/pedir-bar.tsx` |
| `Components/PackageCard.swift` | `components/ui/package-card.tsx` |
| `Components/QuantitySlider.swift` | `components/ui/quantity-slider.tsx` |
| `PressablePedirStyle` (ButtonStyle) | `components/ui/pressable-button.tsx` |
| Custom `CheckboxMark` | `components/ui/checkbox-mark.tsx` |
| `Screens/PackageConfirmScreen.swift` | `components/package-confirm-screen.tsx` |
| `AdelantePrototypeApp.swift` | `app/prototype/page.tsx` |

---

## Translation notes

### `withAnimation(.x)` ↔ motion's `transition`

Springs are named the same in both projects: `snappy`, `completing`, `deleting`, `expanding`, `settling`, `shrinking`. In SwiftUI you wrap a state change in `withAnimation(.expanding) { … }`. In motion you pass the spring as `transition={springs.expanding}` on the animating element.

### `DragGesture` ↔ `motion.div drag="x"`

motion's drag handles rubber-band (`dragElastic`), bounded movement (`dragConstraints`), and gives you the raw translation in `onDragEnd`. Distinguish a tap from a drag the same way as Swift: check `|info.offset.x|` against a small threshold.

### `matchedGeometryEffect` ↔ `layoutId`

motion's `layoutId` is the equivalent. **Not used in this port** — the slider's collapse-into-the-pill effect is achieved by animating the *container*'s width while the trailing edge stays pinned. Same trick as the SwiftUI version.

### `GeometryReader` ↔ `ResizeObserver` via refs

Used in `SlideToConfirm` and `QuantitySlider` to know the container width. Observed once per resize, not every frame.

### `@Environment(\.colorScheme)` ↔ Tailwind `dark:` + `next-themes`

Adding `class="dark"` to `<html>` flips all `dark:` variants. The dropdown's icon/fill swap (white pill in dark, black in light) is a `dark:bg-white dark:text-black` pair.

### `PressablePedirStyle` ↔ `<PressableButton>`

A wrapper component that renders an outer halo `<motion.span>` with the same fade-in 80ms / hold 120ms / fade-out 180ms timing. Same `halo.green / halo.black / halo.white` palette. Importantly: hard-codes `type="button"` so a stray `<form>` ancestor never triggers a submit.

### `successHoldDuration` lockstep shrink ↔ `onReset` callback

In SwiftUI the parent passes `successHoldDuration` to keep the inner reset and the outer width-shrink in sync. In React, `SlideToConfirm` exposes `onReset` — `PedirBar` passes a callback that flips `isArmed = false` after the success hold. Both spring on `springs.shrinking`, both anchored trailing → the pill never overshoots the screen edge.

---

## Performance notes (from this port's debugging)

- **Don't animate `width`** if you can avoid it. The earlier `useTransform(dragX, x => 160 + x)` on a `style.width` triggered layout every frame.
- **Drive a sibling element's width via `useTransform`** if you must — or step it discretely via `useMotionValueEvent` (the slider trail does this with a 4px snap).
- **Use `motion`'s `x` for drag** — it sets `transform: translate3d(...)` which is GPU-only.
- **Set `touch-action: pan-y`** on horizontally-draggable elements so vertical scroll still works on mobile.
- **`willChange: 'transform'`** is only worth it for elements that animate continuously. Don't sprinkle it everywhere.

---

## Color, shape, motion tokens

All in `app/globals.css` under `@theme`. Reference via Tailwind classes:

```
bg-background  bg-card  bg-card-muted
text-foreground  text-muted-foreground
bg-brand  border-brand-halo
bg-excess  bg-excess-dark
border-halo-black  border-halo-white
rounded-pill (20px)  rounded-card (16px)  rounded-check (6px)
```

Light/dark values are CSS variables; flipping `.dark` on `<html>` is the only switch.

---

## What this port does NOT include (yet)

- The **full Figma menu** (vertical PEDIR pill + white search button between menu and PEDIR when menu is open — Figma node `866:3424`). Current menu is the simpler stack-of-three.
- **Real Figma-exported SVGs**. Icons are Lucide. Drop SVGs into `public/icons/` and swap `<List />` etc. for `<Image />` when you have them.
- **A backend**. `submitOrder()` flips local state. When you have an API, wrap mutations in TanStack Query and use `onMutate` for optimistic UI; the action call sites already exist.
- **Quantity persistence**. `QuantitySlider`'s `onChange` only fires on drag end. If you want to save while dragging, throttle and call from `useMotionValueEvent`.
- **Card-level press state**. The text area uses a plain `<button>` with no halo. Not in scope, but trivial to add.

---

## Constants you'll touch

| Thing | File | Value |
|---|---|---|
| Brand green | `globals.css` | `189 222 59` (rgb triplet) |
| Excess red | `globals.css` | `234 158 158` |
| Slider threshold | `slide-to-confirm.tsx` | `0.72` |
| Slider knob width | `slide-to-confirm.tsx` | `160` |
| Slider success hold | passed by `PedirBar` | `700ms` |
| Press delay (action) | `pressable-button.tsx` | `100ms` |
| Halo fade-in / hold / fade-out | `pressable-button.tsx` | `80 / 120 / 180 ms` |
| Card corner | `tailwind --rounded-card` | `16px` |
| Pill corner | `tailwind --rounded-pill` | `20px` |

---

## For the next Claude

Read [DESIGN_STACK.md](./DESIGN_STACK.md) for the architectural overview. Read this README for the file map and translation rationale. Then explore the routes — every route is a doc page that explains the component it showcases.

Common asks and where to start:

- **"Tune the spring on X"** → `lib/springs.ts`. Add a new name if you're tempted to inline.
- **"Add a haptic to Y"** → `lib/haptic.ts`. Pick by meaning, not by feel.
- **"Make Z work in dark mode"** → check that the color isn't hardcoded (`bg-black` etc.). Use `bg-card`, `text-foreground` so the token does the swap.
- **"The slider feels off on mobile"** → check `touch-action` on the dragging element. Vertical scroll fights horizontal drag without `pan-y`.
- **"Why is something fading instead of growing?"** → motion's `transition` between two conditional branches will crossfade if you don't override. Use `<AnimatePresence>` + `initial`/`animate`/`exit` for explicit motion.
- **"The button submits the form"** → use `<PressableButton>`. Plain `<button>` defaults to `type="submit"`.

Don't:

- Rewrite `SlideToConfirm`'s drag math without good reason. The rubber-band, ticks, threshold, and nudge are tuned to feel right.
- Add `transition: all` globally — it stomps on motion's springs and produces uncanny double-animations.
- Reach for shadcn's Button when `<PressableButton>` does what you need. The halo press treatment isn't a configuration of the default; it's a different behavior.
