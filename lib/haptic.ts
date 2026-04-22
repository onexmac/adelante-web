// Haptic vocabulary. Web Vibration API — works on Android Chrome, silent on
// iOS Safari. Vocabulary preserved for parity with the SwiftUI prototype; on
// iOS the pattern just becomes a no-op.
//
// Pick by the interaction's MEANING, not its visual feel. .complete is for
// success confirmations, .delete for removal, .select for taps, .drag for
// drag-milestones.

const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Swallow — not every surface supports it.
    }
  }
};

export const haptic = {
  complete: () => vibrate([10, 30, 10]),
  select:   () => vibrate(5),
  drag:     () => vibrate(8),
  delete:   () => vibrate([15, 10, 15]),
  error:    () => vibrate([20, 40, 20, 40, 20]),
} as const;

export type HapticEvent = keyof typeof haptic;
