'use client';

import { useState } from 'react';
import { PageHeader, Showcase } from '@/components/ds/showcase';
import { SlideToConfirm } from '@/components/ui/slide-to-confirm';

export default function SlideToConfirmPage() {
  const [count, setCount] = useState(0);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-10" data-prototype>
      <PageHeader
        eyebrow="Component"
        title="SlideToConfirm"
        description="Drag the green knob right past the threshold to commit. Below threshold springs back. A tap (without drag) nudges the knob to hint at slide-ability."
      />

      <Showcase title="Try it" surface="plain">
        <div className="rounded-2xl bg-card p-3">
          <SlideToConfirm
            onConfirm={() => setCount((c) => c + 1)}
            successHoldMs={1200}
          />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Confirmed {count} time{count === 1 ? '' : 's'}.</p>
      </Showcase>

      <Showcase title="Mechanics">
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• <strong className="text-foreground">Knob position</strong> uses motion&apos;s <code className="rounded bg-foreground/10 px-1">x</code> — GPU transform, no per-frame layout.</li>
          <li>• <strong className="text-foreground">Trail</strong> (visible track fill) updates in 4px steps from the motion value, not every frame.</li>
          <li>• <strong className="text-foreground">Haptic ticks</strong> at 25 / 50 / 75% progress.</li>
          <li>• <strong className="text-foreground">Threshold 0.72</strong> → commit, success checkmark, auto-reset after the success hold.</li>
          <li>• <strong className="text-foreground">Tap (|Δx| {'<'} 4)</strong> → nudge: a brief spring-right then back. No commit.</li>
          <li>• <strong className="text-foreground">touch-action: pan-y</strong> on the knob — vertical scroll still works on mobile.</li>
        </ul>
      </Showcase>
    </main>
  );
}
