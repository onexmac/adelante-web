'use client';

/**
 * Circular checkbox — outlined ring when off; thin ring + bold checkmark
 * when on. Matches Figma v0.1.00 (node 1153:2979).
 *
 * Pure visual; the Button that wraps it owns the tap target and press halo.
 */

import { AnimatePresence, motion } from 'motion/react';
import { springs } from '@/lib/springs';

export function CheckboxMark({ isOn, size = 36 }: { isOn: boolean; size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outline ring — present in both states; only color animates */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full"
        initial={false}
        animate={{
          borderColor: isOn ? 'rgb(20, 20, 20)' : 'rgb(190, 190, 190)',
        }}
        transition={springs.completing}
        style={{ borderWidth: 2, borderStyle: 'solid' }}
      />
      <AnimatePresence initial={false}>
        {isOn && (
          <motion.svg
            key="check"
            viewBox="0 0 24 24"
            className="absolute inset-0 m-auto"
            style={{ width: size * 0.5, height: size * 0.5 }}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={springs.completing}
            aria-hidden
          >
            <path
              d="M5 12l5 5L20 7"
              fill="none"
              stroke="rgb(20, 20, 20)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </div>
  );
}
