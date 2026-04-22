'use client';

/**
 * PedirBar — bottom-bar state machine.
 *
 * DOM layout never changes: SlideToConfirm is always rendered at FULL WIDTH
 * and drives its own visual state from `isArmed`. The menu button sits on
 * top at the leading edge and fades/scales in place when armed — it
 * doesn't resize siblings.
 *
 * Previous version animated the slider container's `width` from 160 to 100%,
 * which re-flowed the flex parent every frame. This version is all-transform
 * on the hot path, so the arm/disarm transition runs on the GPU.
 *
 * Menu state: three pills stack above the menu button and cascade in/out
 * from behind it. `AnimatePresence` is avoided for the menu button itself
 * — we just animate its opacity and scale inline (no mount/unmount).
 */

import { motion } from 'motion/react';
import { AnimatePresence } from 'motion/react';
import { ChevronsUp, Play, ListOrdered, Inbox, X } from 'lucide-react';
import { haptic } from '@/lib/haptic';
import { springs } from '@/lib/springs';
import { PressableButton, halo } from './pressable-button';
import { SlideToConfirm } from './slide-to-confirm';

const HEIGHT = 80;
const MENU_WIDTH = 70;
const CORNER = 20;

const PILL_WIDTH = 280;
const PILL_HEIGHT = 80;
const PILL_SPACING = 8;

const MENU_ITEMS = [
  { icon: ListOrdered, label: 'PEDIDOS' },
  { icon: Inbox,       label: 'ENTREGADO' },
  { icon: Play,        label: 'TRASLADO' },
] as const;

export interface PedirBarProps {
  isArmed: boolean;
  onArmChange: (armed: boolean) => void;
  isMenuOpen: boolean;
  onMenuChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function PedirBar({
  isArmed,
  onArmChange,
  isMenuOpen,
  onMenuChange,
  onConfirm,
}: PedirBarProps) {
  const arm = () => {
    if (isMenuOpen) onMenuChange(false);
    onArmChange(true);
  };

  const toggleMenu = () => {
    haptic.select();
    onMenuChange(!isMenuOpen);
  };

  return (
    <div className="relative w-full" style={{ height: HEIGHT }}>
      {/* Menu stack — BEHIND the main bar so pills emerge from the menu button */}
      <div className="pointer-events-none absolute inset-0">
        {MENU_ITEMS.map((item, index) => {
          const count = MENU_ITEMS.length;
          const naturalY = -(HEIGHT + PILL_SPACING) - (count - 1 - index) * (PILL_HEIGHT + PILL_SPACING);
          const closedOffsetX = MENU_WIDTH / 2;
          const closedOffsetY = HEIGHT / 2 + PILL_SPACING + (count - 1 - index) * (PILL_HEIGHT + PILL_SPACING);

          const openDelay = (count - 1 - index) * 0.05;
          const closeDelay = index * 0.04;
          const transition = isMenuOpen
            ? { ...springs.popping, delay: openDelay }   // bouncy, fast
            : { ...springs.shrinking, delay: closeDelay };

          const Icon = item.icon;

          return (
            <motion.div
              key={item.label}
              className="absolute bottom-0 left-0"
              style={{
                width: PILL_WIDTH,
                height: PILL_HEIGHT,
                transformOrigin: 'bottom left',
                pointerEvents: isMenuOpen ? 'auto' : 'none',
                willChange: 'transform',
                translateZ: 0,
              }}
              animate={{
                scale: isMenuOpen ? 1 : 0.01,
                x: isMenuOpen ? 0 : closedOffsetX,
                y: isMenuOpen ? naturalY : naturalY + closedOffsetY,
              }}
              initial={{ scale: 0.01, x: closedOffsetX, y: naturalY + closedOffsetY }}
              transition={transition}
            >
              <PressableButton
                haloColor={halo.black}
                cornerRadius={CORNER}
                onClick={() => {
                  haptic.select();
                  onMenuChange(false);
                }}
                style={{
                  backgroundColor: 'black',
                  borderRadius: CORNER,
                  width: PILL_WIDTH,
                  height: PILL_HEIGHT,
                }}
                className="flex items-center gap-4 px-6 text-left text-white"
              >
                <Icon size={22} strokeWidth={2.5} />
                <span className="text-base font-bold tracking-wider">{item.label}</span>
              </PressableButton>
            </motion.div>
          );
        })}
      </div>

      {/* Close X above the armed slider */}
      <AnimatePresence>
        {isArmed && (
          <motion.div
            key="slider-close"
            className="absolute right-6"
            initial={{ scale: 0.01, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.01, opacity: 0 }}
            transition={springs.expanding}
            style={{
              transformOrigin: 'bottom right',
              bottom: HEIGHT + 16,
            }}
          >
            <PressableButton
              haloColor={halo.black}
              cornerRadius={CORNER}
              onClick={() => onArmChange(false)}
              style={{ backgroundColor: 'black', width: 60, height: 40, borderRadius: CORNER }}
              className="flex items-center justify-center text-white"
              aria-label="Cancelar"
            >
              <X size={14} strokeWidth={3} />
            </PressableButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SlideToConfirm — ALWAYS full width. Visual state driven by `isArmed`. */}
      <SlideToConfirm
        isArmed={isArmed}
        onArm={arm}
        onConfirm={onConfirm}
        onReset={() => onArmChange(false)}
        successHoldMs={700}
      />

      {/* Menu button — rendered AFTER SlideToConfirm so it sits ON TOP in z.
          The slider container defaults to pointer-events:auto, so without
          this ordering, clicks at the menu button's position hit the slider
          container (no handler → nothing happens). On arm, the button fades
          out with opacity+scale while the black track expands visually
          "through" it. */}
      <motion.div
        className="absolute left-0 bottom-0"
        style={{
          transformOrigin: 'left center',
          pointerEvents: isArmed ? 'none' : 'auto',
          willChange: 'transform, opacity',
          translateZ: 0,
        }}
        animate={{
          opacity: isArmed ? 0 : 1,
          scale: isArmed ? 0.01 : 1,
        }}
        transition={isArmed ? springs.shrinking : springs.completing}
      >
        <PressableButton
          haloColor={halo.black}
          cornerRadius={CORNER}
          onClick={toggleMenu}
          style={{
            backgroundColor: 'black',
            width: MENU_WIDTH,
            height: HEIGHT,
            borderRadius: CORNER,
          }}
          className="flex items-center justify-center text-white"
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isMenuOpen
            ? <X size={22} strokeWidth={3} />
            : <ChevronsUp size={22} strokeWidth={3} />}
        </PressableButton>
      </motion.div>
    </div>
  );
}
