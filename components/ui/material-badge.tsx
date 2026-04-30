'use client';

/**
 * MaterialBadge — black circle with a centered count and a yellow progress
 * arc. Matches the v0.1.00 Figma node 677:2515 ("materialList").
 *
 * `progress` (0–1) drives the yellow arc length, swept clockwise from 12
 * o'clock. Excess (received > requested) caps the arc at full and tints
 * the ring red so over-delivered items still read at a glance.
 */

import { motion } from 'motion/react';
import { springs } from '@/lib/springs';

export interface MaterialBadgeProps {
  count: number;
  /** 0–1; values > 1 show as a full red ring (excess delivery). */
  progress?: number;
  size?: number;
  className?: string;
}

const YELLOW = '#FACC15';
const RED = '#EF4444';

export function MaterialBadge({
  count,
  progress = 1,
  size = 48,
  className,
}: MaterialBadgeProps) {
  const isExcess = progress > 1;
  const clamped = Math.max(0, Math.min(1, progress));
  const sweep = clamped * 360;
  const ringColor = isExcess ? RED : YELLOW;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
      }}
      aria-label={`Count ${count}`}
    >
      {/* Progress arc — conic-gradient swept from top, clockwise. */}
      <motion.div
        aria-hidden
        initial={false}
        animate={{
          background: `conic-gradient(from -90deg, ${ringColor} 0deg ${sweep}deg, rgba(0,0,0,0.08) ${sweep}deg 360deg)`,
        }}
        transition={springs.completing}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '9999px',
          willChange: 'background',
        }}
      />
      {/* Black inner circle */}
      <div
        className="absolute rounded-full bg-black flex items-center justify-center text-white font-bold tabular-nums"
        style={{ inset: 3, fontSize: size * 0.34 }}
      >
        {count}
      </div>
    </div>
  );
}
