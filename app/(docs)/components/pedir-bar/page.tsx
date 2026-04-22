'use client';

import { useState } from 'react';
import { PageHeader, Showcase } from '@/components/ds/showcase';
import { PedirBar } from '@/components/ui/pedir-bar';

export default function PedirBarPage() {
  const [isArmed, setArmed] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [confirms, setConfirms] = useState(0);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-10" data-prototype>
      <PageHeader
        eyebrow="Component"
        title="PedirBar"
        description="The full bottom-bar state machine: collapsed (menu + PEDIR) → armed (full slider) → success → back to collapsed. Menu pills cascade out from behind the menu button."
      />

      <Showcase title="Try it" surface="app" className="min-h-[440px] relative">
        <div className="absolute inset-x-6 bottom-6">
          <PedirBar
            isArmed={isArmed}
            onArmChange={setArmed}
            isMenuOpen={isMenuOpen}
            onMenuChange={setMenuOpen}
            onConfirm={() => setConfirms((c) => c + 1)}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Tap the green pill to arm. Drag right to confirm. Tap the chevron-up to open the menu. Confirmed {confirms} time{confirms === 1 ? '' : 's'}.
        </div>
      </Showcase>

      <Showcase title="State summary">
        <pre className="overflow-x-auto rounded-lg bg-foreground/5 p-4 text-[12px] leading-relaxed">
{`isArmed=${isArmed}
isMenuOpen=${isMenuOpen}`}
        </pre>
      </Showcase>
    </main>
  );
}
