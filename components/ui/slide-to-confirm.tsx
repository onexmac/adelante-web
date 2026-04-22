'use client';

/**
 * SlideToConfirm — drag the knob rightward past the threshold to commit.
 *
 * Key perf decisions vs. the earlier draft:
 *  - Knob position uses motion's `x` (GPU transform). No width animation.
 *  - Trail behind the knob is a sibling element whose width is driven by
 *    React state updates at drag-milestones only (every quarter), so we
 *    don't touch layout every frame.
 *  - `touch-action: pan-y` on the knob so vertical scroll still works while
 *    the knob captures horizontal drags (fixes "feels laggy" on mobile).
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
  const [fillExtraPx, setFillExtraPx] = useState(0);
  const lastTickRef = useRef(0);

  // Observe container — measured only on resize, not per-frame.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setContainerWidth(e.contentRect.width));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Tap-to-drag threshold: record initial pointer pos to distinguish
  // meaningful drags from taps. We use motion's onDragStart/End which
  // already does this, but we need the translation magnitude on end.
  const dragStartRef = useRef(0);

  // Drive the trail's width reactively from x, but only update state in
  // coarse steps — drag runs at 60fps on GPU, we update React at ~15fps.
  useMotionValueEvent(x, 'change', (latest) => {
    const rounded = Math.round(latest / 4) * 4; // snap to 4px grid for perf
    if (Math.abs(rounded - fillExtraPx) >= 4) setFillExtraPx(rounded);

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
      setFillExtraPx(0);
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

      {/* Green trail — width coarsely stepped from motion value; no per-frame layout */}
      <div
        aria-hidden
        className="absolute left-0 top-0 h-full bg-brand"
        style={{
          width: KNOB_WIDTH + fillExtraPx,
          borderRadius: CORNER,
          willChange: 'width',
        }}
      />

      {/* Knob — fixed width, translates via GPU transform */}
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
        }}
        onDragStart={(_, info) => {
          if (isConfirmed) return;
          setDragging(true);
          dragStartRef.current = info.point.x;
          haptic.select();
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
