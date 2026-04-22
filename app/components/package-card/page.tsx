'use client';

import { useState } from 'react';
import { PageHeader, Showcase } from '@/components/ds/showcase';
import { PackageCard } from '@/components/ui/package-card';
import { sampleList } from '@/lib/mock-data';
import type { MockPackage } from '@/lib/types';

export default function PackageCardPage() {
  const [pkgs, setPkgs] = useState<MockPackage[]>(sampleList);
  const [expandedId, setExpandedId] = useState<string | null>('mock-3');

  const update = (id: string, patch: Partial<MockPackage>) =>
    setPkgs((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-10" data-prototype>
      <PageHeader
        eyebrow="Component"
        title="PackageCard"
        description="Supplier package row. Tap the text area to expand. Checkbox confirms; dropdown toggles expansion (and inverts black/white in dark mode); X closes."
      />
      <Showcase title="Three cards" surface="app">
        <div className="space-y-3">
          {pkgs.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              isExpanded={expandedId === pkg.id}
              onToggle={() => setExpandedId((cur) => (cur === pkg.id ? null : pkg.id))}
              onConfirm={() => update(pkg.id, { isConfirmed: !pkg.isConfirmed })}
              onClose={() => setExpandedId(null)}
              onItemReceivedChange={(itemId, received) =>
                setPkgs((p) =>
                  p.map((x) =>
                    x.id === pkg.id
                      ? { ...x, items: x.items.map((i) => (i.id === itemId ? { ...i, received } : i)) }
                      : x
                  )
                )
              }
            />
          ))}
        </div>
      </Showcase>
    </main>
  );
}
