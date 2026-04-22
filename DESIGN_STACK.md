# Adelante Web — Design Stack

> Reference for whoever picks this up next. Companion to the SwiftUI prototype's `DESIGN_STACK.md`. Read both when porting a new screen.

---

## Quality target

**Things 3 for iOS.** Every interaction should feel that snappy and considered. Spring physics, semantic motion, haptic feedback on meaningful actions, optimistic feel.

The web port can't do iOS-grade impact haptics (Safari doesn't expose them), and pointer drag won't feel as native as a real touch driver. Everything else — spring physics, transitions, shapes, motion choreography — should be indistinguishable.

---

## What this project is not

- Not connected to Business Central, Azure SQL, or any backend.
- Not deployable to production (yet).
- Not a place to debug data layers, auth, or APIs.
- Not navigating anywhere on submit. The slider, all buttons, and the menu pills update local state only.

If something needs data, hardcoded mock structs in `lib/mock-data.ts`. Keep it simple.

---

## Stack

| Layer | Choice |
|---|---|
| Platform | Web — modern evergreen browsers + iOS Safari 17+ |
| Framework | Next.js 16 + TypeScript (App Router, Turbopack) |
| Styling | Tailwind v4 with `@theme` tokens in `app/globals.css` |
| Motion | `motion` (motion/react) — drag, springs, layout |
| Theming | `next-themes` (class-based) |
| Icons | `lucide-react` (placeholder; swap to Figma SVGs when available) |
| Class util | `cn()` from `clsx` + `tailwind-merge` |

---

## Project location & layout

`~/Documents/claudecode/adelante-web/`

```
adelante-web/
├── app/                                   Next.js App Router routes
│   ├── layout.tsx                         Root layout, theme provider, site header
│   ├── globals.css                        Token definitions (@theme)
│   ├── page.tsx                           DS landing
│   ├── motion/page.tsx                    Spring vocabulary
│   ├── haptics/page.tsx                   Haptic vocabulary
│   ├── colors/page.tsx                    Tokens + radii
│   ├── components/                        Per-component playgrounds
│   └── prototype/page.tsx                 The full Confirm screen
├── components/
│   ├── ui/                                The six prototype components
│   ├── ds/                                Docs-site scaffolding
│   ├── providers/                         next-themes wrapper
│   └── package-confirm-screen.tsx         The screen composition
├── lib/                                   springs, haptic, types, mock-data, utils
├── README.md
├── DESIGN_STACK.md                        ← you are here
└── package.json
```

---

## Motion vocabulary (`lib/springs.ts`)

```ts
export const springs = {
  snappy:     { type: 'spring', stiffness: 450, damping: 32 },
  completing: { type: 'spring', stiffness: 320, damping: 26 },
  deleting:   { type: 'spring', stiffness: 520, damping: 24 },
  expanding:  { type: 'spring', stiffness: 220, damping: 24 },
  settling:   { type: 'spring', stiffness: 170, damping: 28 },
  shrinking:  { type: 'spring', stiffness: 280, damping: 36 },
};
```

Six names, mirroring `Springs.swift`. Pick by the *semantic* of the interaction. Never inline.

| Name | Use |
|---|---|
| `snappy` | Press feedback, small toggles |
| `completing` | Confirm, check-off — slight overshoot for satisfaction |
| `deleting` | Removal, warning — slightly under-damped |
| `expanding` | Reveal, grow — card expand, menu open, slider arm |
| `settling` | Relaxed return-to-rest |
| `shrinking` | Width / size shrink where overshoot would visually overflow |

**Usage:**
```tsx
<motion.div animate={{ scale: open ? 1 : 0.5 }} transition={springs.completing} />
```

---

## Haptic vocabulary (`lib/haptic.ts`)

```ts
haptic.complete()   // success — three-pulse
haptic.delete()     // removal/warning — two-pulse
haptic.error()      // validation failure — five-pulse
haptic.select()     // tap — single short
haptic.drag()       // drag milestone — single medium
```

Web Vibration API. **Silent on iOS Safari** (Apple doesn't expose the equivalent of `UIImpactFeedbackGenerator`). Calls are safe — they no-op when unsupported. Pick by meaning, not by feel.

---

## Color & shape tokens (`app/globals.css`)

CSS variables under `@theme`, surfaced as Tailwind classes. Light + dark values both defined; flipping `class="dark"` on `<html>` is the only switch.

| Tailwind class | What |
|---|---|
| `bg-background` | Screen backdrop |
| `bg-card` | Card surface (white in light, dark gray in dark — never pure black) |
| `bg-card-muted` | Slightly elevated surface, used for showcase frames |
| `text-foreground` / `text-muted-foreground` | Primary / secondary text |
| `bg-brand` | Adelante green `rgb(189 222 59)` |
| `border-brand-halo` | Pressed-state ring on green buttons |
| `border-halo-black` / `border-halo-white` | Press-state rings on dark / light buttons |
| `bg-excess` / `bg-excess-dark` | Over-delivered quantity colors |
| `rounded-pill` (20px), `rounded-card` (16px), `rounded-check` (6px) | Shape vocabulary |

---

## Components

### `PressableButton` (`components/ui/pressable-button.tsx`)

Universal press wrapper. Renders a thick stroke halo OUTSIDE the button's bounds in a contextual color. No scale, no layout push. Hard-coded `type="button"` so it never submits a form. 100ms action delay so the halo registers on fast taps.

Props worth knowing: `haloColor` (use `halo.green` / `halo.black` / `halo.white`), `haloWidth` (default 8, use 3 for tiny buttons like the checkbox), `cornerRadius`, `pressDelayMs`.

### `CheckboxMark` (`components/ui/checkbox-mark.tsx`)

Pure visual component — outlined rounded square (off) or filled dark square + white checkmark (on). Wrap in a `<PressableButton>` for tap target + halo.

### `QuantitySlider` (`components/ui/quantity-slider.tsx`)

Drag the thumb to set `received`. Track shows requested marker, fills gray below requested and red above (over-delivery). Supports overshoot up to 2× requested.

Perf: thumb position is a motion value (GPU translate); fill width is a `useTransform` of the same motion value (no per-frame React renders).

### `SlideToConfirm` (`components/ui/slide-to-confirm.tsx`)

The slide-to-commit pattern. Drag the green knob right. Below threshold (0.72) springs back. At/above threshold commits, shows a checkmark, holds the success state for `successHoldMs` (default 1600), then resets and calls `onReset`.

Tap without dragging (`|Δx| < 4`) → nudge: a quick spring-right + back. Hints at slide-ability without committing.

Perf: knob position uses motion's `x` (GPU translate). Trail width is updated discretely from the motion value (4px snap) to avoid per-frame React renders.

### `PedirBar` (`components/ui/pedir-bar.tsx`)

State machine for the bottom bar. Two bindings (`isArmed`, `isMenuOpen`) the parent owns so a tap-outside-catcher can dismiss.

Collapsed: menu button (left) + compact PEDIR pill (right).
Armed: `SlideToConfirm` expanded, with a close-X above it.
Menu: three pills cascade upward from BEHIND the menu button. Pills are always rendered; their scale + offset are bound to `isMenuOpen` with per-pill delays. On open, bottom pill (`TRASLADO`) animates first; on close, top pill (`PEDIDOS`) first.

Disarm syncs with `SlideToConfirm`'s reset via the `onReset` callback. Same spring (`springs.shrinking`), trailing-anchored width — pill never overshoots.

### `PackageCard` (`components/ui/package-card.tsx`)

Supplier package row, expandable. Header has a checkbox + dropdown button on the right. Tap the text column to expand. Dropdown inverts black ↔ white with color scheme.

Expanded content (`divider + items + close X`) lives in one container with a `scale(0.94, anchor: top) + opacity` transition so the whole reveal reads as growing downward.

---

## The screen (`components/package-confirm-screen.tsx`)

Composition: cards + bottom bar + dim overlay.

The dim overlay (`fixed inset-0 bg-black opacity-0.28`) appears when the slider is armed OR the menu is open. Tap-anywhere-on-dim dismisses whichever overlay is active. The bar is always above the dim in z-order so the slider/menu stay tappable.

`submitOrder()` flips every `isConfirmed = true` and clears expansion. No network. No navigation.

---

## Conventions

- **Never inline spring values.** Add a name to `lib/springs.ts`.
- **Don't `transition: all`.** Stomps on motion's springs.
- **Use `<PressableButton>`** for every tappable surface that needs a press halo. Plain `<button>` only for invisible tap targets (like the card's text-area expand trigger).
- **Wrap state with `<AnimatePresence>` + `initial`/`animate`/`exit`** when conditionally rendering — bare `if`/`else` produces hard cuts.
- **Reach for `useMotionValueEvent`** to react to drag values without re-rendering on every frame.
- **`touch-action: pan-y`** on horizontally-draggable surfaces. Without it, vertical scroll on mobile fights the drag and feels broken.
- **Component callbacks own no animation context.** Wrap state changes in a `transition` prop or use the parent's animation.

---

## Build & verify

```bash
npm run dev      # http://localhost:3000
npm run build    # static prerender all 13 routes
npm start        # serve the build
npm run lint     # ESLint
```

The `npm run build` output should list all 13 routes as `○ (Static)`.

---

## What's intentionally not done yet

| Item | Where to start |
|---|---|
| Full Figma menu (vertical PEDIR pill + search button + true X menu button morph) | Figma node `866:3424`. Update `PedirBar`'s armed-and-menu-open state. |
| Real Figma SVGs | Drop into `public/icons/`. Replace `lucide-react` imports with `<Image>` in `pedir-bar.tsx` and `package-card.tsx`. |
| Optimistic UI with TanStack Query | Wrap `submitOrder()` in `useMutation` with `onMutate`. Currently flips local state synchronously. |
| Drag-to-reorder cards | Add `@dnd-kit/sortable` around the cards' `<div className="space-y-3">`. |
| Per-quantity persistence on drag | Currently `QuantitySlider.onChange` only fires on drag end. Throttle inside `useMotionValueEvent` if you want streaming updates. |
| Card-level press halo | Text-area expand uses a plain `<button>`. Wrap in `<PressableButton>` to add. |

---

## Collaboration notes (from the porting session)

- The user (Marcos) is a product designer, not a developer. Frame explanations around *feel*, not internals.
- **Baby steps.** Make one focused change at a time, build-verify, then show. Don't batch ambitious refactors.
- The SwiftUI prototype's slide-to-confirm drag is load-bearing for trust. Don't rewrite the math without good reason. Add parameters; don't restructure.
- This is a *prototype* surface. No forms, no backend, no nav. Anything that triggers a submit, navigation, or network call is a bug.
- When the user says "feels laggy," the answer is almost always: switch from a layout property (width / height / left / top) to a transform (`x`, `scaleX`, `translate3d`).
- When the user says "feels wonky during a transition," the answer is often: two animations on different timers running on the same element. Sync them by calling them at the same moment with the same spring.

---

## Figma source

- File: **Losa Flotante** — `oRDLRL9OUNcTQ0k6G5MBPS`
- Confirm screen (slider + cards): node `866:3514`
- Menu open state: node `866:3424`
- Standard / Pressed button frames: nodes `236:3409` / `236:3410`

---

## SwiftUI prototype location

`~/Documents/Xcode/AdelantePrototype/`. See its `DESIGN_STACK.md` for the iOS side. The two projects share the same vocabulary deliberately — names match, semantics match, only the runtime differs.
