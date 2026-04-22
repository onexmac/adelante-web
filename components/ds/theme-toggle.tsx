'use client';

import { Moon, Sun, Monitor } from '@phosphor-icons/react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className={cn('h-9 w-28', className)} />;

  const opts: { value: 'light' | 'dark' | 'system'; icon: typeof Sun }[] = [
    { value: 'light',  icon: Sun },
    { value: 'system', icon: Monitor },
    { value: 'dark',   icon: Moon },
  ];

  return (
    <div className={cn('inline-flex rounded-full bg-card p-1 ring-1 ring-black/10 dark:ring-white/10', className)}>
      {opts.map(({ value, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          aria-label={value}
          className={cn(
            'flex h-7 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors',
            theme === value && 'bg-foreground text-background'
          )}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}
