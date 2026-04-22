'use client';

/**
 * SlideToConfirm — drag the knob rightward past the threshold to commit.
 *
 * Perf discipline (no React in the drag hot path):
 *  - Knob `x` is a motion value (GPU translate3d). No per-frame React renders.
 *  - Trail width is a useTransform of `x` (motion-driven, updates on the
 *    same animation frame as the knob, no React renders during drag).
 *  - Knob + trail are PROMOTED TO COMPOSITOR LAYERS at mount via translateZ(0)
 *    so the first touch doesn't pay a layer-creation cost.
 *  - Haptic fires on onPointerDown (earlier than onDragStart) for instant feel.
 *  - touch-action: pan-y on the knob so vertical scroll still works on mobile.
 *
 * Semantics (mirrors SlideToConfirm.swift):
 *  - Haptic ticks at 25/50/75% progress.
 *  - ≥ 0.72 threshold → commit, success checkmark, auto-reset after hold.
 *  - Below threshold → spring back.
 *  - Tap without drag (|Δx| < 4) → nudge the knob right + back.
 *  - Successful commit calls onConfirm; onReset fires after successHoldMs.
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
  onConfirm: () => void;
  /** Fired after the success hold completes. Parent can use this to disarm. */
  onReset?: () => void;
  /** ms the success state holds before the internal reset starts (default 1600). */
  successHoldMs?: number;
}

export function SlideToConfirm({
  label = 'PEDIR',
  onConfirm,
  onReset,
  successHoldMs = 1600,
}: SlideToConfirmProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const maxDrag = Math.max(0, containerWidth - KNOB_WIDTH);

  const x = useMotionValue(0);
  const [isConfirmed, setConfirmed] = useState(false);
  const [isDragging, setDragging] = useState(false);
  const lastTickRef = useRef(0);
  // Trail width, driven directly from `x` — no React state during drag.
  const trailWidth = useTransform(x, (v) => KNOB_WIDTH + v);

  // Observe container — measured only on resize, not per-frame.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setContainerWidth(e.contentRect.width));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Drag-time side effects only — no setState here, trail width is a
  // useTransform so it updates without React.
  useMotionValueEvent(x, 'change', (latest) => {
    if (maxDrag <= 0 || isConfirmed) return;
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

  const springBack = () => {
    animate(x, 0, springs.snappy);
    lastTickRef.current = 0;
  };

  const progressOpacity = useTransform(x, [0, maxDrag || 1], [0.22, 0]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-visible"
      style={{ height: HEIGHT, borderRadius: CORNER }}
    >
      {/* Black track */}
      <div
        aria-hidden
        className="absolute inset-0 bg-black"
        style={{ borderRadius: CORNER }}
      />

      {/* Hint chevron — right side, fades as drag progresses */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute top-1/2 -translate-y-1/2 select-none text-white font-bold"
        style={{ right: 28, opacity: progressOpacity, fontSize: 28 }}
        animate={isDragging || isConfirmed ? { x: 0 } : { x: [-4, 0, -4] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
      >
        ›
      </motion.span>

      {/* Green trail — width driven by `x` via useTransform. No React renders
          during drag. Promoted to its own compositor layer preemptively. */}
      <motion.div
        aria-hidden
        className="absolute left-0 top-0 h-full bg-brand"
        style={{
          width: trailWidth,
          borderRadius: CORNER,
          willChange: 'width',
          transform: 'translateZ(0)',
        }}
      />

      {/* Knob — fixed width, translates via GPU transform. Promoted to its
          own compositor layer at mount via translateZ(0) — the first touch
          doesn't pay a layer-creation cost. */}
      <motion.div
        className="draggable-x absolute left-0 top-0 flex items-center justify-center font-bold tracking-wider text-black"
        drag="x"
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
          // Fires earlier than onDragStart — haptic feels instant.
          if (!isConfirmed) haptic.select();
        }}
        onDragStart={() => {
          if (isConfirmed) return;
          setDragging(true);
        }}
        onDragEnd={(_, info) => {
          if (isConfirmed) return;
          setDragging(false);

          const translated = Math.abs(info.offset.x);
          if (translated < 4) {
            nudge();
            return;
          }
          const progress = maxDrag > 0 ? x.get() / maxDrag : 0;
          if (progress >= THRESHOLD) commit();
          else springBack();
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
            <path d="M5 12l5 5L20 7" fill="none" stroke="black" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
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
