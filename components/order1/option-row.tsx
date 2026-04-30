'use client';

/**
 * OptionRow — single radio-button row used inside OrderCard.
 * Hollow circle when off; filled black inner circle when selected.
 * Tap target spans the full row, not just the circle.
 */

import { motion } from 'motion/react';
import { springs } from '@/lib/springs';
import { haptic } from '@/lib/haptic';

export interface OptionRowProps {
  label: string;
  isSelected: boolean;
  onSelect: () => void;
}

export function OptionRow({ label, isSelected, onSelect }: OptionRowProps) {
  return (
    <button
      type="button"
      onClick={() => {
        haptic.select();
        onSelect();
      }}
      className="
        flex w-full items-center gap-4 rounded-xl py-2 text-left
        outline-none focus-visible:ring-2 focus-visible:ring-foreground/30
      "
      aria-pressed={isSelected}
    >
      <div className="relative h-7 w-7 shrink-0">
        <motion.div
          aria-hidden
          className="absolute inset-0 rounded-full"
          initial={false}
          animate={{ borderColor: isSelected ? 'rgb(20,20,20)' : 'rgb(180,180,180)' }}
          transition={springs.completing}
          style={{ borderWidth: 2.5, borderStyle: 'solid' }}
        />
        <motion.div
          aria-hidden
          className="absolute inset-1.5 rounded-full bg-foreground"
          initial={false}
          animate={{ scale: isSelected ? 1 : 0, opacity: isSelected ? 1 : 0 }}
          transition={springs.completing}
        />
      </div>
      <span className="text-[15px] font-medium leading-tight">{label}</span>
    </button>
  );
}
