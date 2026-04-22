'use client';

/**
 * The prototype screen — cards + bottom bar.
 * Self-contained: no navigation, no network. `data-prototype` opts into the
 * touch/selection tweaks defined in globals.css.
 */

import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import type { MockPackage } from '@/lib/types';
import { sampleList } from '@/lib/mock-data';
import { haptic } from '@/lib/haptic';
import { PackageCard } from './ui/package-card';
import { PedirBar } from './ui/pedir-bar';

export function PackageConfirmScreen({ className }: { className?: string }) {
  const [packages, setPackages] = useState<MockPackage[]>(sampleList);
  const [expandedId, setExpandedId] = useState<string | null>('mock-3');
  const [isArmed, setArmed] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggle = (id: string) => {
    haptic.select();
    setExpandedId((cur) => (cur === id ? null : id));
  };

  const confirm = (id: string) => {
    haptic.complete();
    setPackages((p) =>
      p.map((x) => (x.id === id ? { ...x, isConfirmed: !x.isConfirmed } : x))
    );
  };

  const close = () => {
    haptic.delete();
    setExpandedId(null);
  };

  const updateItemReceived = (pkgId: string, itemId: string, received: number) => {
    setPackages((p) =>
      p.map((x) =>
        x.id === pkgId
          ? { ...x, items: x.items.map((i) => (i.id === itemId ? { ...i, received } : i)) }
          : x
      )
    );
  };

  const submitOrder = () => {
    // Prototype behavior: mark everyone confirmed, clear expansion.
    setPackages((p) => p.map((x) => ({ ...x, isConfirmed: true })));
    setExpandedId(null);
  };

  const dimVisible = isArmed || isMenuOpen;

  return (
    <div
      data-prototype
      className={`relative isolate min-h-[844px] w-full overflow-hidden bg-background ${className ?? ''}`}
    >
      {/* Scrollable cards */}
      <div className="h-full max-h-[844px] overflow-y-auto px-3 pt-4 pb-40">
        <div className="space-y-3">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              isExpanded={expandedId === pkg.id}
              onToggle={() => toggle(pkg.id)}
              onConfirm={() => confirm(pkg.id)}
              onClose={close}
              onItemReceivedChange={(itemId, v) => updateItemReceived(pkg.id, itemId, v)}
            />
          ))}
        </div>
      </div>

      {/* Dim + tap-outside catcher */}
      <AnimatePresence>
        {dimVisible && (
          <motion.button
            key="dim"
            type="button"
            aria-label="Dismiss"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.28 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={() => {
              if (isMenuOpen) setMenuOpen(false);
              if (isArmed) setArmed(false);
            }}
            className="absolute inset-0 bg-black"
          />
        )}
      </AnimatePresence>

      {/* Bar */}
      <div className="absolute inset-x-4 bottom-6">
        <PedirBar
          isArmed={isArmed}
          onArmChange={setArmed}
          isMenuOpen={isMenuOpen}
          onMenuChange={setMenuOpen}
          onConfirm={submitOrder}
        />
      </div>
    </div>
  );
}
