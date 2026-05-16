'use client';

/**
 * OrderCard — single package summary that expands to reveal a list of
 * single-select options (OptionRow). Mirrors the Figma "Lab" prototype
 * (file RcRhbG69pqHbtzUeBi9vLx, node 254:1280).
 *
 * Self-contained: doesn't depend on the /app screen's PackageCard so the
 * two prototypes can evolve independently.
 */

import { motion } from 'motion/react';
import { CaretUpDown, X, Info } from '@phosphor-icons/react';
import { haptic } from '@/lib/haptic';
import { cn } from '@/lib/utils';
import { PressableButton, halo } from '@/components/ui/pressable-button';
import { OptionRow } from './option-row';

export interface OrderOption {
  id: string;
  label: string;
}

export interface OrderCardProps {
  supplier: string;
  code: string;
  reference: string;
  date: string;
  options: OrderOption[];
  isExpanded: boolean;
  selectedOptionId: string | null;
  onToggle: () => void;
  onSelectOption: (id: string) => void;
}

export function OrderCard({
  supplier,
  code,
  reference,
  date,
  options,
  isExpanded,
  selectedOptionId,
  onToggle,
  onSelectOption,
}: OrderCardProps) {
  return (
    <div className="rounded-card bg-card p-5 transition-colors">
      <div className="flex items-start gap-3">
        {/* Tappable text column — toggles expand */}
        <button
          type="button"
          className="flex-1 text-left outline-none"
          onClick={() => {
            haptic.select();
            window.setTimeout(onToggle, 80);
          }}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? `Collapse ${code}` : `Expand ${code}`}
        >
          <div className="space-y-0.5">
            <div className="text-[13px] font-semibold tracking-wider text-muted-foreground">
              {supplier}
            </div>
            <div className="text-[28px] font-bold leading-none">{code}</div>
            <div className="pt-1 text-[18px] font-bold leading-tight tabular-nums">
              {reference}
            </div>
            <div className="flex items-center gap-2 pt-2.5 text-[14px] text-muted-foreground">
              <Info size={16} weight="regular" />
              <span>{date}</span>
            </div>
          </div>
        </button>

        {/* Dropdown button — same as /app, inverts in dark mode */}
        <PressableButton
          cornerRadius={20}
          haloColor={halo.black}
          onClick={onToggle}
          style={{ width: 60, height: 88, borderRadius: 20 }}
          className={cn(
            'flex shrink-0 items-center justify-center',
            'bg-black text-white dark:bg-white dark:text-black'
          )}
          aria-label={isExpanded ? 'Colapsar' : 'Expandir'}
        >
          {isExpanded ? <X size={14} weight="bold" /> : <CaretUpDown size={18} weight="bold" />}
        </PressableButton>
      </div>

      {/* Options expansion.
          Browser-native CSS grid trick: interpolate grid-template-rows from
          0fr to 1fr. The browser handles the height as a smooth animation
          without measuring or springing past the target. Inner div clips
          and `min-height: 0` lets the row collapse cleanly to 0.
          Content opacity fades in/out slightly delayed so the reveal reads
          as "card grows, then content appears." */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: isExpanded ? '1fr' : '0fr',
          transition: 'grid-template-rows 420ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div style={{ overflow: 'hidden', minHeight: 0 }}>
          <motion.div
            initial={false}
            animate={{ opacity: isExpanded ? 1 : 0 }}
            transition={{
              duration: isExpanded ? 0.32 : 0.2,
              ease: 'easeOut',
              delay: isExpanded ? 0.1 : 0,
            }}
          >
            <div className="mt-4 h-px bg-black/10 dark:bg-white/10" />
            <div className="mt-3 flex flex-col gap-1">
              {options.map((opt) => (
                <OptionRow
                  key={opt.id}
                  label={opt.label}
                  isSelected={selectedOptionId === opt.id}
                  onSelect={() => onSelectOption(opt.id)}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
