'use client';

import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

export function Showcase({
  title,
  description,
  children,
  surface = 'card',
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  surface?: 'card' | 'plain' | 'app';
  className?: string;
}) {
  return (
    <section className="space-y-3">
      {(title || description) && (
        <header className="space-y-1">
          {title && <h3 className="text-base font-semibold">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </header>
      )}
      <div
        className={cn(
          'rounded-2xl p-6 ring-1 ring-black/5 dark:ring-white/5',
          surface === 'card' && 'bg-card-muted',
          surface === 'plain' && 'bg-background',
          surface === 'app' && 'bg-background',
          className
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="space-y-2 pb-8">
      {eyebrow && (
        <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {eyebrow}
        </div>
      )}
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
      {description && <p className="max-w-2xl text-base text-muted-foreground">{description}</p>}
    </header>
  );
}
