'use client';

/**
 * SlideToConfirm — always rendered at full width. `isArmed` toggles whether
 * it looks like the compact pill (knob at right, track hidden behind it) or
 * the full slider (knob at left, track extending right).
 *
 * Hot-path discipline — nothing here triggers layout during drag or during
 * the arm/disarm transition:
 *
 *   • Knob position      → motion `x` (GPU translate3d)
 *   • Track reveal       → clip-path `inset()` (GPU-composited; the track's
 *                          left edge follows the pill exactly, so on disarm
 *                          the black bar flows BACK INTO the pill instead
 *                          of being "pushed right")
 *   • Green trail width  → useTransform(x) (no React renders)
 *   • Trail visibility   → opacity on a short transition (faster fade-out
 *                          so no lingering faded-green while pill is sliding)
 *   • Press feedback     → scale motion value, keeps text intact
 *
 * Tap-to-arm:
 *   drag is disabled when !isArmed. A plain `onClick` fires onArm.
 *   When armed, the drag gesture handles clicks-without-movement as nudges.
 *
 * Nudge:
 *   Tuned to match the SwiftUI spring (response 0.22, damping 0.55 on the
 *   kick-right; 0.36, 0.72 on the return).
 */

import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { haptic } from '@/lib/haptic';
import { springs } from '@/lib/springs';

const KNOB_WIDTH = 160;
const HEIGHT = 80;
const CORNER = 20;
const THRESHOLD = 0.72;

export interface SlideToConfirmProps {
  label?: string;
  isArmed: boolean;
  onArm?: () => void;
  onConfirm: () => void;
  onReset?: () => void;
  successHoldMs?: number;
}

export function SlideToConfirm({
  label = 'PEDIR',
  isArmed,
  onArm,
  onConfirm,
  onReset,
  successHoldMs = 700,
}: SlideToConfirmProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const maxDrag = Math.max(0, containerWidth - KNOB_WIDTH);

  const x = useMotionValue(0);
  const knobScale = useMotionValue(1);

  const [isConfirmed, setConfirmed] = useState(false);
  const isDraggingRef = useRef(false);
  const lastTickRef = useRef(0);
  // Pending nudge-return timer. Cleared on re-tap and on drag start so a
  // stale "go back to 0" can't run after the user has started a new
  // interaction, which was leaving the pill stranded at x > 0.
  const nudgeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setContainerWidth(e.contentRect.width));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Clean up any pending nudge timer on unmount.
  useEffect(() => {
    return () => {
      if (nudgeTimerRef.current != null) window.clearTimeout(nudgeTimerRef.current);
    };
  }, []);

  // Sync knob x to isArmed whenever it flips (and user isn't dragging).
  useEffect(() => {
    if (isDraggingRef.current) return;
    animate(x, isArmed ? 0 : maxDrag, isArmed ? springs.expanding : springs.shrinking);
  }, [isArmed, maxDrag, x]);

  // Trail follows the pill's right edge.
  const trailWidth = useTransform(x, (v) => KNOB_WIDTH + v);

  // Track's visible area: from `x` to container's trailing edge.
  // clip-path: inset(top right bottom left round radius)
  const trackClip = useTransform(x, (v) => `inset(0 0 0 ${v}px round ${CORNER}px)`);

  // Haptic ticks while dragging — side effect only.
  useMotionValueEvent(x, 'change', (latest) => {
    if (!isArmed || isConfirmed || !isDraggingRef.current) return;
    if (maxDrag <= 0) return;
    const p = Math.max(0, Math.min(1, latest / maxDrag));
    const tick = Math.floor(p * 4);
    if (tick !== lastTickRef.current && tick > 0 && tick < 4) {
      haptic.drag();
      lastTickRef.current = tick;
    }
  });

  // Nudge — springs tuned to match SwiftUI's (response 0.22/0.36, damping 0.55/0.72).
  // Stores its timer so repeat taps / drags can cancel the pending return-to-0.
  const nudge = () => {
    haptic.select();
    if (nudgeTimerRef.current != null) window.clearTimeout(nudgeTimerRef.current);
    animate(x, 52, { type: 'spring', stiffness: 800, damping: 15 });
    animate(knobScale, 1.04, { type: 'spring', stiffness: 800, damping: 14 });
    nudgeTimerRef.current = window.setTimeout(() => {
      nudgeTimerRef.current = null;
      animate(x, 0, { type: 'spring', stiffness: 320, damping: 24 });
      animate(knobScale, 1, { type: 'spring', stiffness: 320, damping: 24 });
    }, 180);
  };

  const cancelNudgeTimer = () => {
    if (nudgeTimerRef.current != null) {
      window.clearTimeout(nudgeTimerRef.current);
      nudgeTimerRef.current = null;
    }
  };

  const commit = () => {
    haptic.complete();
    animate(x, maxDrag, springs.completing);
    setConfirmed(true);
    onConfirm();
    window.setTimeout(() => {
      animate(x, 0, springs.settling);
      setConfirmed(false);
      lastTickRef.current = 0;
      onReset?.();
    }, successHoldMs);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: HEIGHT, borderRadius: CORNER }}
    >
      {/* Black track — visible region is from pill.x to the trailing edge.
          pointer-events: none so the menu button below can receive clicks. */}
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-black"
        style={{
          clipPath: trackClip,
          pointerEvents: 'none',
          willChange: 'clip-path',
          transform: 'translateZ(0)',
        }}
      />

      {/* Hint chevron — only meaningful when armed. */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute top-1/2 -translate-y-1/2 select-none text-white font-bold"
        style={{
          right: 28,
          fontSize: 28,
          opacity: useTransform(x, (v) => {
            if (!isArmed || maxDrag <= 0) return 0;
            const dragProgress = Math.max(0, Math.min(1, v / maxDrag));
            return 0.22 * (1 - dragProgress);
          }),
        }}
      >
        ›
      </motion.span>

      {/* Green trail — width follows knob; opacity fades fast on disarm. */}
      <motion.div
        aria-hidden
        className="absolute left-0 top-0 h-full bg-brand"
        animate={{ opacity: isArmed ? 1 : 0 }}
        transition={isArmed ? { duration: 0.22, ease: 'easeOut' } : { duration: 0.12, ease: 'easeIn' }}
        style={{
          width: trailWidth,
          borderRadius: CORNER,
          pointerEvents: 'none',
          willChange: 'width, opacity',
          transform: 'translateZ(0)',
        }}
      />

      {/* Knob — fixed width, translates via GPU. */}
      <motion.div
        className="draggable-x absolute left-0 top-0 flex items-center justify-center font-bold tracking-wider text-black"
        drag={isArmed && !isConfirmed ? 'x' : false}
        dragConstraints={{ left: 0, right: maxDrag }}
        dragElastic={{ left: 0.2, right: 0.15 }}
        dragMomentum={false}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 30 }}
        style={{
          x,
          scale: knobScale,
          width: KNOB_WIDTH,
          height: HEIGHT,
          backgroundColor: 'rgb(189, 222, 59)',
          borderRadius: CORNER,
          boxShadow: '0 6px 14px rgba(0,0,0,0.15)',
          willChange: 'transform',
          translateZ: 0,
        }}
        onPointerDown={() => {
          if (!isConfirmed) haptic.select();
        }}
        // motion's onTap fires for a tap WITHOUT a meaningful drag (below
        // drag threshold). This is the only reliable way to get a nudge
        // when the user taps an armed pill — onDragEnd only fires after a
        // real drag starts.
        onTap={() => {
          if (isConfirmed) return;
          if (isArmed) nudge();
          else onArm?.();
        }}
        onDragStart={() => {
          isDraggingRef.current = true;
          // If a nudge's return-to-0 was still pending, kill it — the drag
          // is the new source of truth for x.
          cancelNudgeTimer();
          // Also knob-scale should reset if we were mid-bounce.
          animate(knobScale, 1, { type: 'spring', stiffness: 400, damping: 30 });
        }}
        onDragEnd={(_, info) => {
          isDraggingRef.current = false;
          if (isConfirmed || !isArmed) return;
          // Any drag that ends below threshold should spring back to 0 —
          // do NOT early-return for small offsets. Stranded-x bug fix.
          const progress = maxDrag > 0 ? x.get() / maxDrag : 0;
          if (Math.abs(info.offset.x) >= 4 && progress >= THRESHOLD) {
            commit();
          } else {
            animate(x, 0, springs.snappy);
            animate(knobScale, 1, { type: 'spring', stiffness: 400, damping: 30 });
          }
        }}
        role="button"
        aria-label={label}
      >
        {isConfirmed ? (
          <motion.svg
            key="check"
            viewBox="0 0 24 24"
            className="w-8 h-8"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={springs.completing}
            aria-hidden
          >
            <path
              d="M5 12l5 5L20 7"
              fill="none"
              stroke="black"
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        ) : (
          <span className="flex items-center gap-2 text-base">
            {label}
            <span className="text-sm">›</span>
          </span>
        )}
      </motion.div>
    </div>
  );
}
