'use client';

/**
 * OrderScreen — single-card order flow. Tap the dropdown to expand the card,
 * pick one of three options, then slide "Pedir" to confirm.
 *
 * Mirrors Figma "Lab" file (RcRhbG69pqHbtzUeBi9vLx, node 254:1280):
 *   • Collapsed → small green back button on the right
 *   • Expanded  → full-width slide-to-confirm Pedir bar
 *
 * Self-contained — does not share state with the /app prototype.
 */

import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { CaretLeft } from '@phosphor-icons/react';
import { haptic } from '@/lib/haptic';
import { springs } from '@/lib/springs';
import { PressableButton, halo } from '@/components/ui/pressable-button';
import { SlideToConfirm } from '@/components/ui/slide-to-confirm';
import { OrderCard, type OrderOption } from './order-card';

const PACKAGE = {
  supplier: 'NOVARUM',
  code: 'C.01',
  reference: 'BS000095',
  date: 'Ayer 10:25 am',
};

const OPTIONS: OrderOption[] = [
  { id: 'standard', label: 'Entrega estándar' },
  { id: 'express',  label: 'Entrega express'  },
  { id: 'pickup',   label: 'Recoger en almacén' },
];

export function OrderScreen({ className }: { className?: string }) {
  const [isExpanded, setExpanded] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [confirmedCount, setConfirmedCount] = useState(0);

  const onConfirm = () => {
    setConfirmedCount((n) => n + 1);
  };

  const onSliderReset = () => {
    setSelectedOptionId(null);
    setExpanded(false);
  };

  return (
    <div
      data-prototype
      className={`relative isolate h-full w-full overflow-hidden bg-background ${className ?? ''}`}
    >
      {/* Card */}
      <div className="absolute inset-x-0 top-[calc(env(safe-area-inset-top)+10vh)] px-4">
        <div className="mx-auto max-w-md">
          <OrderCard
            {...PACKAGE}
            options={OPTIONS}
            isExpanded={isExpanded}
            selectedOptionId={selectedOptionId}
            onToggle={() => setExpanded((e) => !e)}
            onSelectOption={(id) => setSelectedOptionId(id)}
          />
        </div>
      </div>

      {/* Bottom bar — back button (collapsed) or full Pedir slider (expanded) */}
      <div className="absolute inset-x-0 bottom-0 px-4 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        <div className="mx-auto max-w-md">
          <AnimatePresence mode="wait" initial={false}>
            {isExpanded ? (
              <motion.div
                key="slider"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={springs.expanding}
              >
                <SlideToConfirm
                  isArmed
                  label="Pedir"
                  onConfirm={onConfirm}
                  onReset={onSliderReset}
                  successHoldMs={900}
                />
              </motion.div>
            ) : (
              <motion.div
                key="back"
                className="flex justify-end"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={springs.expanding}
              >
                <PressableButton
                  cornerRadius={20}
                  haloColor={halo.green}
                  onClick={() => haptic.select()}
                  style={{
                    width: 70,
                    height: 80,
                    borderRadius: 20,
                    backgroundColor: 'rgb(189, 222, 59)',
                    boxShadow: '0 3px 6px rgba(0,0,0,0.08)',
                  }}
                  className="flex items-center justify-center text-black"
                  aria-label="Atrás"
                >
                  <CaretLeft size={22} weight="bold" />
                </PressableButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Subtle "you confirmed N times" hint, doesn't affect the design */}
      {confirmedCount > 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-2 text-center text-[11px] text-muted-foreground">
          Pedido confirmado {confirmedCount}× ✓
        </div>
      )}
    </div>
  );
}
