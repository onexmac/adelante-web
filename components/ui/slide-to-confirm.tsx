'use client';

/**
 * SlideToConfirm — ALWAYS rendered at full width. `isArmed` controls whether
 * it looks like the compact pill (knob at right, track hidden) or the full
 * slider (knob at left, track visible).
 *
 * Why this shape:
 *  Previously the parent animated the CONTAINER's width from 160 to 100%.
 *  Width is a layout property — every frame re-flowed the flex parent,
 *  causing visible jank on the arm/disarm transition. This version keeps the
 *  DOM layout stable: only transforms animate.
 *
 * Architecture:
 *  - Black track — full-width sibling, `scaleX` bound to an `armedProgress`
 *    motion value. `transformOrigin: right` so it opens leftward from the pill.
 *  - Green knob — fixed 160px, translated via motion `x`. When collapsed,
 *    `x = maxDrag` (knob sits at the right). When armed, `x = 0` (knob at
 *    left) unless the user is dragging it.
 *  - Green trail — same motion value drives its width via `useTransform`,
 *    fades with `armedProgress` so it only shows in the armed state.
 *
 * Interaction:
 *  - Tap the knob while collapsed → `onArm()` fires.
 *  - Tap the knob while armed → nudge (bounce right + back).
 *  - Drag while armed → standard slide-to-confirm semantics.
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
  /** Collapsed (compact pill at right) vs armed (full slider). */
  isArmed: boolean;
  /** Tap while collapsed → arm the bar. */
  onArm?: () => void;
  /** Successful slide. */
  onConfirm: () => void;
  /** Fires after the success hold completes — parent uses this to disarm. */
  onReset?: () => void;
  /** ms to hold the success checkmark before auto-resetting. */
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
  // 0 = collapsed, 1 = armed. Drives track scaleX and trail opacity.
  const armedProgress = useMotionValue(0);

  const [isConfirmed, setConfirmed] = useState(false);
  const isDraggingRef = useRef(false);
  const lastTickRef = useRef(0);

  // Measure once per resize — no per-frame cost.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setContainerWidth(e.contentRect.width));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Sync knob + track to isArmed whenever it flips (and user isn't dragging).
  useEffect(() => {
    if (isDraggingRef.current) return;
    if (isArmed) {
      animate(x, 0, springs.expanding);
      animate(armedProgress, 1, springs.expanding);
    } else {
      animate(x, maxDrag, springs.shrinking);
      animate(armedProgress, 0, springs.shrinking);
    }
  }, [isArmed, maxDrag, x, armedProgress]);

  // Green trail grows from KNOB_WIDTH as the knob slides right.
  const trailWidth = useTransform(x, (v) => KNOB_WIDTH + v);

  // Haptic ticks during drag — side effect only, no React state.
  useMotionValueEvent(x, 'change', (latest) => {
    if (!isArmed || isConfirmed || maxDrag <= 0) return;
    const p = Math.max(0, Math.min(1, latest / maxDrag));
    const tick = Math.floor(p * 4);
    if (tick !== lastTickRef.current && tick > 0 && tick < 4) {
      haptic.drag();
      lastTickRef.current = tick;
    }
  });

  const nudge = () => {
    haptic.select();
    animate(x, 52, { type: 'spring', stiffness: 520, damping: 18 });
    window.setTimeout(() => {
      animate(x, 0, { type: 'spring', stiffness: 260, damping: 28 });
    }, 180);
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
      {/* Black track — always present; scaleX makes it grow leftward from the pill. */}
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-black"
        style={{
          scaleX: armedProgress,
          transformOrigin: 'right center',
          borderRadius: CORNER,
          willChange: 'transform',
          translateZ: 0,
        }}
      />

      {/* Hint chevron — visible only in armed state, fades out as drag progresses. */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute top-1/2 -translate-y-1/2 select-none text-white font-bold"
        style={{
          right: 28,
          fontSize: 28,
          opacity: useTransform([armedProgress, x], ([p, xv]: number[]) => {
            const dragProgress = maxDrag > 0 ? Math.max(0, Math.min(1, xv / maxDrag)) : 0;
            return p * 0.22 * (1 - dragProgress);
          }),
        }}
      >
        ›
      </motion.span>

      {/* Green trail — fades with armedProgress so it's invisible when collapsed. */}
      <motion.div
        aria-hidden
        className="absolute left-0 top-0 h-full bg-brand"
        style={{
          width: trailWidth,
          opacity: armedProgress,
          borderRadius: CORNER,
          willChange: 'width, opacity',
          transform: 'translateZ(0)',
        }}
      />

      {/* Knob — fixed size, translates via GPU. Promoted to a compositor layer. */}
      <motion.div
        className="draggable-x absolute left-0 top-0 flex items-center justify-center font-bold tracking-wider text-black"
        drag={isArmed && !isConfirmed ? 'x' : false}
        dragConstraints={{ left: 0, right: maxDrag }}
        dragElastic={{ left: 0.2, right: 0.15 }}
        dragMomentum={false}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 30 }}
        style={{
          x,
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
        onDragStart={() => {
          isDraggingRef.current = true;
        }}
        onDragEnd={(_, info) => {
          isDraggingRef.current = false;
          if (isConfirmed || !isArmed) return;
          if (Math.abs(info.offset.x) < 4) return; // handled by onTap

          const progress = maxDrag > 0 ? x.get() / maxDrag : 0;
          if (progress >= THRESHOLD) commit();
          else animate(x, 0, springs.snappy);
        }}
        onTap={() => {
          if (isConfirmed) return;
          if (!isArmed) onArm?.();
          else nudge();
        }}
        whileTap={{ scale: 1.015 }}
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
