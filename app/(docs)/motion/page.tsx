'use client';

import { motion } from 'motion/react';
import { useState } from 'react';
import { springs, type SpringName } from '@/lib/springs';
import { PageHeader, Showcase } from '@/components/ds/showcase';

const ENTRIES: { name: SpringName; use: string }[] = [
  { name: 'snappy',     use: 'Press feedback, small toggles. Fast, near-critical.' },
  { name: 'completing', use: 'Check-off, confirm. Slight overshoot for satisfaction.' },
  { name: 'deleting',   use: 'Removal, warning. Slightly under-damped.' },
  { name: 'expanding',  use: 'Card expand, menu open, slider arm.' },
  { name: 'settling',   use: 'Relaxed return-to-rest after a transient.' },
  { name: 'shrinking',  use: 'Width / size shrinks where overshoot would overflow.' },
];

export default function MotionPage() {
  const [tick, setTick] = useState(0);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 space-y-10">
      <PageHeader
        eyebrow="Motion"
        title="Springs are a vocabulary, not values."
        description="Six semantic names. Pick the one that matches the meaning of the interaction. The numbers can be tuned later — the names cannot, because the rest of the codebase reads them."
      />

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setTick((t) => t + 1)}
          className="rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background hover:opacity-90"
        >
          Replay all
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {ENTRIES.map(({ name, use }) => (
          <Showcase key={name} title={name} description={use}>
            <SpringDemo name={name} replay={tick} />
          </Showcase>
        ))}
      </div>

      <Showcase title="How to use" description="Inside a motion component, pass the spring as the transition.">
        <pre className="overflow-x-auto rounded-lg bg-foreground/5 p-4 text-[12px] leading-relaxed">
{`import { motion } from 'motion/react';
import { springs } from '@/lib/springs';

<motion.div
  animate={{ scale: isOn ? 1 : 0.5 }}
  transition={springs.completing}
/>`}
        </pre>
      </Showcase>
    </main>
  );
}

function SpringDemo({ name, replay }: { name: SpringName; replay: number }) {
  // Toggle each replay so the spring re-runs from 0 → 1.
  const flip = replay % 2 === 0;
  return (
    <div className="relative h-12 w-full overflow-hidden rounded-full bg-foreground/5">
      <motion.div
        key={`${name}-${replay}`}
        className="absolute top-1.5 h-9 w-9 rounded-full bg-brand"
        initial={{ x: 0 }}
        animate={{ x: flip ? 'calc(100% - 36px - 6px)' : 6 }}
        transition={springs[name]}
      />
    </div>
  );
}
