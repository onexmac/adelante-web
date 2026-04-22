'use client';

/**
 * PedirBar — bottom-bar state machine.
 *
 * Collapsed: menu button (left) + compact PEDIR pill (right).
 * Armed:     SlideToConfirm expanded full-width, trailing-anchored, with a
 *            close-X floating above it.
 *
 * Menu state: three pills stack above the menu button; each pill is always
 * in the view tree and uses scale + offset bound to `isMenuOpen`. They grow
 * from BEHIND the menu button (z-order: pills first, mainBar on top).
 *
 * Disarm is synced with SlideToConfirm's internal reset: both fire on the
 * same spring at the same moment so the pill's trailing edge stays pinned
 * while the width shrinks. The parent (screen) lifts `isArmed` via props so
 * tapping the dim overlay can dismiss.
 */

import { AnimatePresence, motion } from 'motion/react';
import { ChevronsUp, Play, ListOrdered, Inbox, X } from 'lucide-react';
import { haptic } from '@/lib/haptic';
import { springs } from '@/lib/springs';
import { PressableButton, halo } from './pressable-button';
import { SlideToConfirm } from './slide-to-confirm';

const HEIGHT = 80;
const KNOB_WIDTH = 160;
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
  const armWithClosedMenu = () => {
    haptic.select();
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
          // Natural y = each pill stacked above the bar with gaps
          const naturalY = -(HEIGHT + PILL_SPACING) - (count - 1 - index) * (PILL_HEIGHT + PILL_SPACING);
          // When closed: collapse toward the menu button's center.
          const closedOffsetX = MENU_WIDTH / 2;
          const closedOffsetY = HEIGHT / 2 + PILL_SPACING + (count - 1 - index) * (PILL_HEIGHT + PILL_SPACING);

          const openDelay = (count - 1 - index) * 0.05;
          const closeDelay = index * 0.04;
          const transition = isMenuOpen
            ? { ...springs.expanding, delay: openDelay }
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

      {/* Main bar row */}
      <div className="absolute inset-0 flex items-end gap-2">
        {/* Menu button — hidden when armed */}
        <AnimatePresence initial={false}>
          {!isArmed && (
            <motion.div
              key="menu-btn"
              initial={{ scale: 0.01, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.01, opacity: 0 }}
              transition={springs.expanding}
              style={{ transformOrigin: 'left center' }}
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
                  : <ChevronsUp size={22} strokeWidth={3} />
                }
              </PressableButton>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slider / compact pill — grows to fill remaining space when armed */}
        <motion.div
          className="relative"
          animate={{
            width: isArmed ? '100%' : KNOB_WIDTH,
          }}
          transition={isArmed ? springs.expanding : springs.shrinking}
          style={{ height: HEIGHT, flexShrink: 0, marginLeft: 'auto' }}
        >
          {isArmed ? (
            <SlideToConfirm
              onConfirm={onConfirm}
              onReset={() => onArmChange(false)}
              successHoldMs={700}
            />
          ) : (
            <PressableButton
              haloColor={halo.green}
              cornerRadius={CORNER}
              onClick={armWithClosedMenu}
              style={{
                backgroundColor: 'rgb(189, 222, 59)',
                width: KNOB_WIDTH,
                height: HEIGHT,
                borderRadius: CORNER,
                boxShadow: '0 3px 6px rgba(0,0,0,0.08)',
              }}
              className="flex items-center justify-center gap-2 font-bold tracking-wider text-black"
            >
              PEDIR
              <span className="text-sm">›</span>
            </PressableButton>
          )}
        </motion.div>
      </div>
    </div>
  );
}
