# GPU Transforms — the rules this project lives by

> Why this doc exists: "it feels laggy on my phone" is almost always one of
> a small handful of bugs, and the fix is almost always the same. This doc
> names the bugs and the fixes so the next engineer can spot them in seconds.

---

## TL;DR

- Animate with **transforms** and **opacity**. That's it.
- If you find yourself animating `width`, `height`, `top`, `left`, `margin`, or
  anything else that affects **layout**, stop — find a transform-based pattern.
- Promote interactive surfaces to their own **compositor layer** *before* the
  user touches them.
- `motion`'s drag gives you `x` as a motion value — **use it**. Don't mirror it
  into React state on every frame.

---

## The two-bucket model

Every CSS property falls into one of three buckets, in order of cost:

| Bucket | Properties | What the browser does per frame |
|---|---|---|
| **Composite** | `transform`, `opacity`, `filter` (mostly), `clip-path` (mostly), `will-change: transform` | Runs on the GPU. The browser doesn't even look at layout. Cheapest. |
| **Paint** | `color`, `background-color`, `border-color`, `box-shadow` | Re-paints the element's pixels. No layout math, but CPU work. |
| **Layout** | `width`, `height`, `top`, `left`, `margin`, `padding`, `border-width`, `font-size`, and any flex/grid-affecting property | The browser re-computes position and size for the element AND its descendants AND siblings in the same formatting context. Most expensive. Dropping 60fps on mid-tier phones is *normal* when you animate layout. |

**Write code like every animation is running on a $200 Android phone.** Animate composite properties. Animate paint properties only when necessary. Never animate layout properties in the hot path.

---

## Concrete rules we follow

### 1. Drag is a transform, never a position

```tsx
// ✅ Do
<motion.div drag="x" style={{ x: someMotionValue }} />

// ❌ Don't
<motion.div drag="x" style={{ left: leftPxState }} />
```

`motion.div`'s `drag` already writes to `transform: translate3d(...)` under the
hood — the motion value `x` is just the API for reading / writing it.

### 2. Driven sibling effects use `useTransform`, not React state

The green trail in `SlideToConfirm` grows as the knob slides. Wrong way:

```tsx
// ❌ Re-renders React every frame of the drag
useMotionValueEvent(x, 'change', (v) => setTrailWidth(v));
<div style={{ width: trailWidth }} />
```

Right way:

```tsx
// ✅ Motion pipes the value straight to the style object; zero React renders
const trailWidth = useTransform(x, (v) => KNOB_WIDTH + v);
<motion.div style={{ width: trailWidth }} />
```

> Yes this animates `width`. For a single absolutely-positioned rect with no
> siblings depending on its size, modern browsers handle this fine. When in
> doubt, swap to `clip-path` or `scaleX` (see §6).

### 3. Haptics on `pointerdown`, not `dragStart`

```tsx
// ✅ fires ~30–50ms earlier, makes the press feel instant
onPointerDown={() => haptic.select()}

// ❌ delayed until motion's drag recognizer commits
onDragStart={() => haptic.select()}
```

### 4. Promote interactive surfaces to compositor layers at mount

Without this, the first touch pays the "create a new layer" cost — that's the
"cold start" wonkiness users feel when they tap a button for the first time.

```tsx
style={{
  willChange: 'transform',   // hint to the compositor
  transform: 'translateZ(0)', // force a layer to exist NOW
}}
```

Every draggable pill, every halo, every card has this. The cost is ~a few KB
of GPU memory per promoted element — trivial compared to dropping frames.

> Don't sprinkle `will-change` on everything. Use it on elements that
> animate continuously (drag handles, trail fills, hover effects). Random
> `will-change` on static content wastes memory.

### 5. `touch-action` on horizontally-draggable elements

```tsx
className="draggable-x"  // touch-action: pan-y  (set in globals.css)
```

Without this, on mobile the browser hesitates on the first drag frame while
it decides whether the gesture is a horizontal drag or a vertical scroll.
That hesitation *reads as lag*. Telling the browser "horizontal drag wins
here, let vertical scroll pass through" removes it.

### 6. When you need a bar to "grow into place," use `clip-path` or `scaleX`

**The SlideToConfirm track's left edge has to follow the pill's left edge**
as it moves. Three ways to do that, in order of preference:

**Best — `clip-path: inset()`** (what we use):

```tsx
const clip = useTransform(x, (v) => `inset(0 0 0 ${v}px round 20px)`);
<motion.div style={{ clipPath: clip, ... }} />
```

Compositor-accelerated in Chrome / Safari. Left edge of the visible region
exactly tracks the pill's x. `round 20px` preserves the corner radius.

**Good — `transform: scaleX()` with `transform-origin: left`**:

```tsx
<motion.div style={{ scaleX: pct, transformOrigin: 'left center', ... }} />
```

Also GPU. Downside: if the element has children with text or content, they
get stretched horizontally. Fine for a plain colored rect.

**Last-resort — animated `width`**: only if the element is absolutely
positioned, has no children whose layout matters, and no siblings next to
it in a flex or grid layout. Costs a re-paint every frame but not a re-flow.

### 7. Avoid `layout` + `AnimatePresence` scale together

We learned this painfully with the card. `motion`'s `layout` prop uses FLIP
(measure, invert, animate to identity). When the same subtree also has an
`AnimatePresence` child entering with `initial={{ scale: 0.94 }}`, the two
size-animations run in parallel and fight.

Pick one:

- **Just layout**: for sibling reflow when positions change. Skip
  AnimatePresence's scale.
- **Just height + opacity**: animate `{ height: isOpen ? 'auto' : 0 }` on
  a wrapper with `overflow: hidden`. Inside that wrapper, scale + opacity
  the content. The natural document flow handles siblings.

The card uses the second pattern. It's the same pattern as
`Details` disclosure in most design systems.

### 8. One animation on a state change, not two

The slider's disarm needs the outer-frame shrink and the inner-knob reset
to be **visually locked**. Driving both off the same motion value makes
that trivial:

```tsx
// x animates 0 → maxDrag on disarm
useEffect(() => {
  animate(x, isArmed ? 0 : maxDrag, isArmed ? springs.expanding : springs.shrinking);
}, [isArmed, maxDrag]);

// Trail width + track clip both read from x — they can't desync
const trailWidth = useTransform(x, (v) => KNOB_WIDTH + v);
const trackClip  = useTransform(x, (v) => `inset(0 0 0 ${v}px round 20px)`);
```

Two separate `animate(...)` calls with the same spring CAN desync subtly
if they're triggered on different ticks. One motion value, many derivations,
is bulletproof.

### 9. Spring tuning — stiffness first, damping second

- Higher `stiffness` → snappier, faster to target
- Higher `damping` → less overshoot, more critically-damped feel
- `damping < 20` with moderate `stiffness` → visible bounce (good for a nudge)
- `damping >= 30` → settles cleanly, no visible ringing (good for a shrink
  that shouldn't overshoot and overflow)

Mapping from SwiftUI `spring(response:dampingFraction:)`:

```
stiffness ≈ (2π / response)²
damping   ≈ 2 · √stiffness · dampingFraction
```

Example: SwiftUI `spring(response: 0.22, dampingFraction: 0.55)` →
motion `{ stiffness: 815, damping: 31 }`. We tuned ours to
`{ stiffness: 800, damping: 15 }` for extra bounce on the nudge —
the feel mattered more than a literal conversion.

---

## Debugging checklist when something feels laggy

1. **Chrome DevTools → Performance → Record → Reproduce.** Look for long
   purple (layout) or green (paint) bars. Both should be absent during an
   animation. Long yellow (scripting) usually means you have React
   re-rendering inside a motion animation.
2. **Rendering panel → Paint flashing.** Any element that flashes green on
   every animation frame is being repainted. Fine for small elements, not
   fine for anything 200px+.
3. **Look at `will-change` and `transform: translateZ(0)`** on the elements
   involved. If they're missing, add them — compositor layer promotion is
   the difference between "smooth on my laptop" and "smooth on a cheap
   phone."
4. **Check `touch-action`** on draggable elements. `none` or `pan-y` on
   horizontal drags, `pan-x` on vertical drags.
5. **Is width or height animating?** Audit the `animate={{ ... }}` object
   and the style prop. If you see `width`, `height`, `top`, `left` — that's
   your lag.
6. **Is React re-rendering inside the animation?** Look at `useState` calls
   inside `useMotionValueEvent` handlers, `onDrag`, or `onAnimationComplete`.
   Move them outside or debounce.

---

## Why SwiftUI feels this "free" and the web doesn't

SwiftUI's animation system composes on the GPU by default. `withAnimation`
wraps a state change, and the framework figures out which views changed and
animates their final properties via CoreAnimation primitives — most of
which are GPU-composited (transform, opacity, cornerRadius).

The web's default CSS animations also go through the compositor — *but only
for transform and opacity*. Every other animated property takes the slow
path. motion/react is built to lean into the fast path, but it can't stop
you from writing `animate={{ width: 400 }}`. This doc is the checklist we
use so we never do that by accident.

---

## Where this doc lives in practice

Every change to `components/ui/*.tsx` should be justifiable against §1–§9.
If you're reviewing a PR and the animation feels off, start from §10 and
work down.
