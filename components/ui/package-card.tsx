'use client';

/**
 * PackageCard — supplier package row. Collapsed (header only) or expanded
 * (header + items + close button).
 *
 * Dropdown inverts with color scheme: black pill in light, white in dark
 * (so it doesn't disappear into a dark card). Halo color matches.
 * Card fill is a clearly-visible surface in both modes (not pure black).
 *
 * The card's "tap to expand" lives on the header's text column only — so
 * the Buttons to its right own their own press states.
 */

import { AnimatePresence, motion } from 'motion/react';
import { ChevronsUpDown, X, Info } from 'lucide-react';
import type { MockPackage, MockPackageItem } from '@/lib/types';
import { haptic } from '@/lib/haptic';
import { springs } from '@/lib/springs';
import { cn } from '@/lib/utils';
import { CheckboxMark } from './checkbox-mark';
import { PressableButton, halo } from './pressable-button';
import { QuantitySlider } from './quantity-slider';

export interface PackageCardProps {
  pkg: MockPackage;
  isExpanded: boolean;
  onToggle: () => void;
  onConfirm: () => void;
  onClose: () => void;
  onItemReceivedChange: (itemId: string, received: number) => void;
}

export function PackageCard({
  pkg,
  isExpanded,
  onToggle,
  onConfirm,
  onClose,
  onItemReceivedChange,
}: PackageCardProps) {
  return (
    <div
      className={cn(
        'rounded-card bg-card p-5',
        'transition-colors'
      )}
    >
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
            <div className="flex items-center gap-2.5 pt-2.5 text-[15px] text-muted-foreground">
              <Info size={16} />
              <span>{pkg.date}</span>
              <span className="font-semibold text-foreground">{pkg.reference}</span>
            </div>
          </div>
        </button>

        {/* Header actions */}
        <div className="flex items-start gap-2 pt-1.5">
          {/* Checkbox — halo is proportionally thinner (button is small) */}
          <PressableButton
            haloColor={halo.black}
            haloWidth={3}
            cornerRadius={6}
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
            style={{ width: 60, height: 72, borderRadius: 20 }}
            className={cn(
              'flex items-center justify-center',
              'bg-black text-white dark:bg-white dark:text-black'
            )}
            aria-label={isExpanded ? 'Colapsar' : 'Expandir'}
          >
            {isExpanded
              ? <X size={14} strokeWidth={3} />
              : <ChevronsUpDown size={14} strokeWidth={3} />}
          </PressableButton>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={springs.expanding}
            style={{ transformOrigin: 'top center' }}
          >
            <div className="mt-4 h-px bg-black/10 dark:bg-white/10" />

            <div className="mt-5 space-y-5">
              {pkg.items.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onReceivedChange={(v) => onItemReceivedChange(item.id, v)}
                />
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <PressableButton
                haloColor={halo.black}
                cornerRadius={20}
                onClick={onClose}
                style={{ backgroundColor: 'black', width: 60, height: 40, borderRadius: 20 }}
                className="flex items-center justify-center text-white"
                aria-label="Cerrar"
              >
                <X size={13} strokeWidth={3} />
              </PressableButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ItemRow({
  item,
  onReceivedChange,
}: {
  item: MockPackageItem;
  onReceivedChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <div className="flex-1 text-[12px] font-bold leading-snug tracking-wide">
          {item.name}
        </div>
        <div className="text-[13px] font-semibold tabular-nums text-muted-foreground">
          / {item.requested}
        </div>
      </div>
      <QuantitySlider
        received={item.received}
        requested={item.requested}
        onChange={onReceivedChange}
      />
    </div>
  );
}
