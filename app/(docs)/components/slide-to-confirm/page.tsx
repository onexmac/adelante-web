'use client';

import { useState } from 'react';
import { PageHeader, Showcase } from '@/components/ds/showcase';
import { SlideToConfirm } from '@/components/ui/slide-to-confirm';

export default function SlideToConfirmPage() {
  const [count, setCount] = useState(0);
  const [isArmed, setArmed] = useState(true);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-10" data-prototype>
      <PageHeader
        eyebrow="Component"
        title="SlideToConfirm"
        description="Always rendered at full width. `isArmed` controls whether it looks like the compact pill (knob at right, track hidden) or the full slider (knob at left, track visible). The arm/disarm transition is all transforms — no width animation."
      />

      <Showcase title="Try it (armed)" surface="plain">
        <div className="rounded-2xl bg-card p-3">
          <SlideToConfirm
            isArmed={isArmed}
            onArm={() => setArmed(true)}
            onConfirm={() => setCount((c) => c + 1)}
            successHoldMs={1200}
          />
        </div>
        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <button
            type="button"
            onClick={() => setArmed((a) => !a)}
            className="rounded-full bg-foreground px-4 py-1.5 text-xs font-semibold text-background"
          >
            Toggle isArmed
          </button>
          <span>Confirmed {count} time{count === 1 ? '' : 's'}.</span>
        </div>
      </Showcase>

      <Showcase title="Mechanics">
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• <strong className="text-foreground">Knob position</strong> uses motion&apos;s <code className="rounded bg-foreground/10 px-1">x</code> — GPU transform, no per-frame layout.</li>
          <li>• <strong className="text-foreground">Trail</strong> width is <code className="rounded bg-foreground/10 px-1">useTransform(x, v =&gt; KNOB_WIDTH + v)</code>. No React renders during drag.</li>
          <li>• <strong className="text-foreground">Black track</strong> uses scaleX (0 → 1) anchored at trailing edge. GPU transform; zero layout work.</li>
          <li>• <strong className="text-foreground">Haptic ticks</strong> at 25 / 50 / 75% progress.</li>
          <li>• <strong className="text-foreground">Threshold 0.72</strong> → commit, success checkmark, auto-reset after the success hold.</li>
          <li>• <strong className="text-foreground">Tap (|Δx| {'<'} 4)</strong> when armed → nudge (spring-right then back). When collapsed → fires <code className="rounded bg-foreground/10 px-1">onArm</code>.</li>
          <li>• <strong className="text-foreground">touch-action: pan-y</strong> on the knob — vertical scroll still works on mobile.</li>
        </ul>
      </Showcase>
    </main>
  );
}
