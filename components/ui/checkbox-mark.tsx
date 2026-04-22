'use client';

/**
 * Custom checkbox visual — dark rounded square + white checkmark when on,
 * outlined rounded square when off. Matches Figma node 866:3514 checkboxes.
 *
 * Pure visual component; the Button that wraps it owns the tap target and
 * press-state halo.
 */

import { AnimatePresence, motion } from 'motion/react';
import { springs } from '@/lib/springs';

export function CheckboxMark({ isOn, size = 32 }: { isOn: boolean; size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Fill (visible only when on) */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-[6px]"
        initial={false}
        animate={{
          backgroundColor: isOn ? 'rgb(46, 46, 46)' : 'rgba(0,0,0,0)',
          borderColor:      isOn ? 'rgba(0,0,0,0)' : 'rgb(190, 190, 190)',
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
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={springs.completing}
            aria-hidden
          >
            <path
              d="M5 12l5 5L20 7"
              fill="none"
              stroke="white"
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </div>
  );
}
