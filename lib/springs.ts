// Motion vocabulary — mirrors SwiftUI's Springs.swift.
// Never inline spring values elsewhere; add a semantic name here and use it
// as a transition everywhere that interaction lives.

import type { Transition } from 'motion/react';

export const springs = {
  // Fast response — for small widget state changes (press, toggle).
  snappy:     { type: 'spring', stiffness: 450, damping: 32 },
  // Check-off, confirm. Slight overshoot for satisfaction.
  completing: { type: 'spring', stiffness: 320, damping: 26 },
  // Removals, warnings — slightly under-damped.
  deleting:   { type: 'spring', stiffness: 520, damping: 24 },
  // Reveal and grow animations — card expand, menu open, slider arm.
  expanding:  { type: 'spring', stiffness: 220, damping: 24 },
  // Relaxed return to rest.
  settling:   { type: 'spring', stiffness: 170, damping: 28 },
  // Near-critically-damped. For shrinking where overshoot would cause overflow.
  shrinking:  { type: 'spring', stiffness: 280, damping: 36 },
  // Bouncy, fast — for small widgets popping into view (menu pills cascade).
  // Visible overshoot gives the "natural spring" feel.
  popping:    { type: 'spring', stiffness: 450, damping: 20 },
} as const satisfies Record<string, Transition>;

export type SpringName = keyof typeof springs;
