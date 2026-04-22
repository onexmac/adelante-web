'use client';

/**
 * QuantitySlider — draggable thumb that adjusts a `received` quantity.
 * Track color shifts red when received exceeds requested.
 * Supports overshoot up to 2× requested (min 10 for zero-requested items).
 *
 * Uses motion `x` (GPU transform) for the thumb; fill is a sibling div whose
 * width is driven by React state so there's no per-frame layout during drag.
 */

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  animate,
} from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { haptic } from '@/lib/haptic';
import { springs } from '@/lib/springs';
import { cn } from '@/lib/utils';

const TRACK_HEIGHT = 40;
const THUMB_WIDTH = 54;

export interface QuantitySliderProps {
  received: number;
  requested: number;
  onChange: (value: number) => void;
  className?: string;
}

export function QuantitySlider({ received, requested, onChange, className }: QuantitySliderProps) {
  const maxValue = Math.max(requested * 2, 10);
  const isExcess = received > requested;

  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  const thumbX = useMotionValue(0);
  // Local display value tracks the motion value during drag. Updated only
  // when the rounded integer changes (so no per-frame React renders).
  const [displayValue, setDisplayValue] = useState(received);
  const lastHapticRef = useRef(received);
  const isDraggingRef = useRef(false);

  // Observe container size once (cheap, no per-frame cost).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const usable = Math.max(0, width - THUMB_WIDTH);

  // Sync external `received` → thumb position when not dragging.
  // Only animates the motion value (no setState here).
  useEffect(() => {
    if (isDraggingRef.current) return;
    animate(thumbX, (usable * received) / maxValue, springs.completing);
  }, [received, usable, maxValue, thumbX]);

  // Sync external `received` → display value (separate effect, no animation).
  // eslint-disable-next-line
  useEffect(() => { setDisplayValue(received); }, [received]);

  // Drag → integer value. Updates display + fires haptic on integer transitions.
  useMotionValueEvent(thumbX, 'change', (latest) => {
    if (usable <= 0) return;
    const ratio = Math.max(0, Math.min(1, latest / usable));
    const v = Math.round(ratio * maxValue);
    if (v !== displayValue) setDisplayValue(v);
    if (v !== lastHapticRef.current) {
      if (isDraggingRef.current) haptic.drag();
      lastHapticRef.current = v;
    }
  });

  // Fill width is a motion value — updates on every frame via GPU, no React.
  const fillWidth = useTransform(thumbX, (x) => x + THUMB_WIDTH);

  const handleDragStart = () => {
    isDraggingRef.current = true;
  };
  const handleDragEnd = () => {
    isDraggingRef.current = false;
    haptic.select();
    if (displayValue !== received) onChange(displayValue);
  };

  const requestedMarkerPct = maxValue > 0 ? (requested / maxValue) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full select-none', className)}
      style={{ height: TRACK_HEIGHT }}
    >
      {/* Background track */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-[20px]"
        style={{ backgroundColor: 'rgb(235, 235, 235)' }}
      />

      {/* Requested marker (small tick) */}
      {requested > 0 && (
        <div
          aria-hidden
          className="absolute top-1 bottom-1 w-[2px]"
          style={{
            left: `calc(${requestedMarkerPct}% + ${THUMB_WIDTH / 2}px)`,
            backgroundColor: 'rgb(184, 184, 184)',
          }}
        />
      )}

      {/* Fill — width is a motion value, updates on the same animation
          frame as the thumb. No React renders during drag. */}
      <motion.div
        aria-hidden
        className="absolute inset-y-0 left-0 rounded-[20px]"
        style={{
          width: fillWidth,
          backgroundColor: isExcess ? 'rgb(234, 158, 158)' : 'rgb(71, 71, 71)',
          willChange: 'width',
        }}
      />

      {/* Thumb — translates via GPU transform. */}
      <motion.div
        className="draggable-x absolute left-0 top-0 flex items-center justify-center rounded-[16px] text-white font-bold"
        drag="x"
        dragConstraints={{ left: 0, right: usable }}
        dragElastic={0.1}
        dragMomentum={false}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 30 }}
        style={{
          x: thumbX,
          width: THUMB_WIDTH,
          height: TRACK_HEIGHT,
          backgroundColor: isExcess ? 'rgb(217, 115, 115)' : 'rgb(46, 46, 46)',
          willChange: 'transform',
        }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        role="slider"
        aria-valuenow={displayValue}
        aria-valuemin={0}
        aria-valuemax={maxValue}
      >
        <span className="tabular-nums text-base">{displayValue}</span>
      </motion.div>
    </div>
  );
}
