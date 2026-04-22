/**
 * Haptic vocabulary. Semantic — pick by the MEANING of the interaction,
 * not by which pattern feels nice. The same name in SwiftUI triggers the
 * analogous physical feedback; on the web, support varies by platform.
 *
 * Support matrix (as of 2026):
 *   Android Chrome / Firefox / Edge    ✅ Web Vibration API, works
 *   Desktop Chrome / Firefox / Edge    ⚠️ Usually no hardware, no-ops
 *   iOS Safari (any version)           ❌ Not implemented. Apple has not
 *                                          exposed the Taptic Engine to the
 *                                          web. PWAs added to home screen
 *                                          still can't vibrate. There is
 *                                          no known workaround that is both
 *                                          reliable and non-intrusive.
 *
 * For real haptics on iOS, wrap the app in Capacitor + @capacitor/haptics,
 * or ship native. The vocabulary here is forward-compatible — if iOS ever
 * exposes navigator.vibrate, these calls will start working unchanged.
 */

function supportsVibrate(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.vibrate === 'function'
  );
}

function vibrate(pattern: number | number[]) {
  if (!supportsVibrate()) return false;
  try {
    // Older Android Chrome requires a preceding user gesture; we always
    // call from event handlers so this is safe.
    return navigator.vibrate(pattern);
  } catch {
    return false;
  }
}

// Durations: Android hardware varies wildly. Sub-10ms is often imperceptible
// on mid-tier devices. These values are a bit long for taste on a high-end
// phone but land reliably across the Android fleet.
export const haptic = {
  /** Success confirmation. Three-pulse pattern. */
  complete: () => vibrate([15, 40, 15]),
  /** Tap / selection. Short but perceptible. */
  select:   () => vibrate(15),
  /** Drag milestone (e.g. quarter-progress crossing). */
  drag:     () => vibrate(18),
  /** Removal or warning. Two-pulse. */
  delete:   () => vibrate([20, 15, 20]),
  /** Validation failure. Five-pulse alarm. */
  error:    () => vibrate([25, 50, 25, 50, 25]),
} as const;

export type HapticEvent = keyof typeof haptic;

/** Runtime check — surfaces on the /haptics page for user-visible feedback. */
export function hapticsSupported(): boolean {
  return supportsVibrate();
}
