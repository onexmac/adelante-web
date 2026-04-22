'use client';

import { useEffect, useState } from 'react';
import { haptic, type HapticEvent } from '@/lib/haptic';
import { PageHeader, Showcase } from '@/components/ds/showcase';
import { PressableButton, halo } from '@/components/ui/pressable-button';

const ENTRIES: { name: HapticEvent; meaning: string }[] = [
  { name: 'select',   meaning: 'Single tap. Confirm a focus / hit. Lightest touch.' },
  { name: 'drag',     meaning: 'Drag passed a discrete milestone (e.g. quarter-progress).' },
  { name: 'complete', meaning: 'Successful confirmation, commit. Three-pulse pattern.' },
  { name: 'delete',   meaning: 'Removal or warning. Heavier, two-pulse.' },
  { name: 'error',    meaning: 'Validation failure. Five-pulse alarm.' },
];

export default function HapticsPage() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [lastFired, setLastFired] = useState<HapticEvent | null>(null);

  useEffect(() => {
    // eslint-disable-next-line
    setSupported(typeof navigator !== 'undefined' && 'vibrate' in navigator);
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-10">
      <PageHeader
        eyebrow="Haptics"
        title="A haptic vocabulary, not decoration."
        description="Five semantic events. Each one means something specific — pick by the meaning of the interaction, not by which pattern feels nice."
      />

      <Showcase
        title="Support"
        description="Web Vibration API. Works on Android Chrome. Silent on iOS Safari (Apple doesn't expose impact / notification feedback to the browser). Patterns are still safe to call — they no-op on unsupported surfaces."
      >
        <div className="text-sm">
          <span className="text-muted-foreground">This browser:</span>{' '}
          {supported === null ? '…' : supported ? <span className="text-brand-halo font-semibold">Vibrate API available</span> : <span className="text-muted-foreground">no support</span>}
        </div>
      </Showcase>

      <Showcase title="Try them" description="Tap to fire. On supporting devices you'll feel the pattern.">
        <div className="grid gap-3 sm:grid-cols-2">
          {ENTRIES.map(({ name, meaning }) => (
            <div key={name} className="flex items-center gap-4 rounded-xl bg-card p-3">
              <PressableButton
                haloColor={halo.black}
                cornerRadius={12}
                pressDelayMs={0}
                onClick={() => {
                  haptic[name]();
                  setLastFired(name);
                }}
                style={{ width: 88, height: 44, borderRadius: 12, backgroundColor: 'black' }}
                className="flex items-center justify-center text-sm font-semibold text-white"
              >
                {name}
              </PressableButton>
              <div className="flex-1 text-sm text-muted-foreground">{meaning}</div>
            </div>
          ))}
        </div>
        {lastFired && (
          <p className="mt-3 text-xs text-muted-foreground">
            Last fired: <code className="rounded bg-foreground/10 px-1">{lastFired}</code>
          </p>
        )}
      </Showcase>
    </main>
  );
}
