'use client';

/**
 * PressableButton — port of SwiftUI's PressablePedirStyle.
 *
 * Renders a THIN STROKE HALO outside the button's bounds on press, in a
 * contextual color (muted shade of the button's own fill). No scale, no
 * layout push, no form submission.
 *
 * Why type="button" by default: inside a <form>, a <button> without type
 * defaults to "submit" and triggers navigation / reload. We're a prototype
 * with no forms — `type="button"` avoids surprise submits.
 */

import { motion } from 'motion/react';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export const halo = {
  green: 'rgb(133, 166, 41)',
  black: 'rgb(140, 140, 140)',
  white: 'rgb(210, 210, 210)',
} as const;

export type HaloColor = (typeof halo)[keyof typeof halo] | string;

export interface PressableButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  children: ReactNode;
  haloColor?: HaloColor;
  haloWidth?: number;
  cornerRadius?: number;
  /** Delay firing onClick so the press halo can register visually (default 100ms). */
  pressDelayMs?: number;
  onClick?: () => void;
}

export const PressableButton = forwardRef<HTMLButtonElement, PressableButtonProps>(
  function PressableButton(
    {
      children,
      haloColor = halo.black,
      haloWidth = 8,
      cornerRadius = 20,
      pressDelayMs = 100,
      onClick,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const [isPressed, setPressed] = useState(false);

    const handleClick = () => {
      if (!onClick) return;
      if (pressDelayMs <= 0) {
        onClick();
        return;
      }
      window.setTimeout(() => onClick(), pressDelayMs);
    };

    return (
      <button
        {...rest}
        ref={ref}
        // Always non-submitting — prototype surface, no forms.
        type="button"
        onClick={handleClick}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        onPointerCancel={() => setPressed(false)}
        className={cn('relative inline-block select-none outline-none', className)}
        style={{ borderRadius: cornerRadius, ...style }}
      >
        {children}

        {/* Halo — ring drawn OUTSIDE bounds, doesn't affect layout. */}
        <motion.span
          aria-hidden
          initial={false}
          animate={{ opacity: isPressed ? 1 : 0 }}
          transition={
            isPressed
              ? { duration: 0.08, ease: 'easeOut' }
              : { duration: 0.18, ease: 'easeOut', delay: 0.12 }
          }
          style={{
            position: 'absolute',
            inset: -haloWidth / 2,
            borderRadius: cornerRadius + haloWidth / 2,
            border: `${haloWidth}px solid ${haloColor}`,
            pointerEvents: 'none',
            willChange: 'opacity',
          }}
        />
      </button>
    );
  }
);
