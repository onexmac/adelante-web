'use client';

/**
 * PackageCard — supplier package row. Collapsed (header only) or expanded
 * (header + MaterialList items + close button).
 *
 * v0.1.00 layout (Figma node 1153:2979):
 *   NOVARUM         (supplier, small uppercase, muted)
 *   C.01            (code, large bold)
 *   BS000095        (reference, medium bold)
 *   ⓘ Ayer 10:25 am (date row, muted)
 *
 * The dropdown stays black/white with the color scheme. The checkbox is
 * now a circular ring (see CheckboxMark). Items in the expanded state use
 * MaterialListItem (text + circular progress badge), not the qty slider.
 */

import { motion } from 'motion/react';
import { CaretUpDown, X, Info } from '@phosphor-icons/react';
import type { MockPackage } from '@/lib/types';
import { haptic } from '@/lib/haptic';
import { springs } from '@/lib/springs';
import { cn } from '@/lib/utils';
import { CheckboxMark } from './checkbox-mark';
import { MaterialListItem } from './material-list-item';
import { PressableButton, halo } from './pressable-button';

export interface PackageCardProps {
  pkg: MockPackage;
  isExpanded: boolean;
  onToggle: () => void;
  onConfirm: () => void;
  onClose: () => void;
  /** Kept for parent compatibility — MaterialListItem is read-only for now. */
  onItemReceivedChange?: (itemId: string, received: number) => void;
}

export function PackageCard({
  pkg,
  isExpanded,
  onToggle,
  onConfirm,
  onClose,
}: PackageCardProps) {
  return (
    <div className={cn('rounded-card bg-card p-5 transition-colors')}>
      <div className="flex items-start gap-3">
        {/* Text column — tappable, but doesn't steal from right-hand Buttons */}
        <button
          type="button"
          className="flex-1 text-left outline-none"
          onClick={() => {
            if (isExpanded) return;
            haptic.select();
            window.setTimeout(onToggle, 100);
          }}
          aria-label={isExpanded ? pkg.code : `Expand ${pkg.code}`}
        >
          <div className="space-y-0.5">
            <div className="text-[13px] font-semibold tracking-wider text-muted-foreground">
              {pkg.supplier}
            </div>
            <div className="text-[28px] font-bold leading-none">
              {pkg.code}
            </div>
            <div className="pt-1 text-[18px] font-bold leading-tight tabular-nums">
              {pkg.reference}
            </div>
            <div className="flex items-center gap-2 pt-2.5 text-[14px] text-muted-foreground">
              <Info size={16} weight="regular" />
              <span>{pkg.date}</span>
            </div>
          </div>
        </button>

        {/* Header actions */}
        <div className="flex items-start gap-3 pt-1.5">
          {/* Circular checkbox */}
          <PressableButton
            haloColor={halo.black}
            haloWidth={3}
            cornerRadius={999}
            onClick={() => {
              haptic.select();
              onConfirm();
            }}
            className="inline-block"
            aria-label={pkg.isConfirmed ? 'Desmarcar' : 'Marcar'}
          >
            <CheckboxMark isOn={pkg.isConfirmed} />
          </PressableButton>

          {/* Dropdown — inverts with color scheme */}
          <PressableButton
            cornerRadius={20}
            haloColor={halo.black}
            onClick={onToggle}
            style={{ width: 60, height: 88, borderRadius: 20 }}
            className={cn(
              'flex items-center justify-center',
              'bg-black text-white dark:bg-white dark:text-black'
            )}
            aria-label={isExpanded ? 'Colapsar' : 'Expandir'}
          >
            {isExpanded
              ? <X size={14} weight="bold" />
              : <CaretUpDown size={18} weight="bold" />}
          </PressableButton>
        </div>
      </div>

      {/* Expanded content. Outer animates height; inner does scale+opacity
          from top-center so the reveal reads as growing downward. */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0 }}
        transition={springs.expanding}
        style={{ overflow: 'hidden' }}
      >
        <motion.div
          initial={false}
          animate={{
            opacity: isExpanded ? 1 : 0,
            scale: isExpanded ? 1 : 0.94,
          }}
          transition={springs.expanding}
          style={{ transformOrigin: 'top center' }}
        >
          <div className="mt-4 h-px bg-black/10 dark:bg-white/10" />

          <div className="mt-3 divide-y divide-black/5 dark:divide-white/5">
            {pkg.items.map((item) => (
              <MaterialListItem key={item.id} item={item} />
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <PressableButton
              haloColor={halo.black}
              cornerRadius={20}
              onClick={onClose}
              style={{ backgroundColor: 'black', width: 60, height: 40, borderRadius: 20 }}
              className="flex items-center justify-center text-white"
              aria-label="Cerrar"
            >
              <X size={13} weight="bold" />
            </PressableButton>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
