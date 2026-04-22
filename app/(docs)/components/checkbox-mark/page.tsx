'use client';

import { useState } from 'react';
import { PageHeader, Showcase } from '@/components/ds/showcase';
import { CheckboxMark } from '@/components/ui/checkbox-mark';
import { PressableButton, halo } from '@/components/ui/pressable-button';

export default function CheckboxMarkPage() {
  const [a, setA] = useState(false);
  const [b, setB] = useState(true);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-10">
      <PageHeader
        eyebrow="Component"
        title="CheckboxMark"
        description="Custom checkbox visual: outlined rounded square when off, filled dark square with white checkmark when on. The check enters with a scale + opacity transition on the .completing spring."
      />
      <Showcase title="Interactive">
        <div className="flex items-center gap-8">
          <PressableButton haloColor={halo.black} haloWidth={3} cornerRadius={6} onClick={() => setA(!a)}>
            <CheckboxMark isOn={a} />
          </PressableButton>
          <PressableButton haloColor={halo.black} haloWidth={3} cornerRadius={6} onClick={() => setB(!b)}>
            <CheckboxMark isOn={b} />
          </PressableButton>
          <div className="text-sm text-muted-foreground">Tap to toggle. Animation uses springs.completing.</div>
        </div>
      </Showcase>
      <Showcase title="Sizes">
        <div className="flex items-center gap-8">
          <CheckboxMark isOn size={20} />
          <CheckboxMark isOn size={32} />
          <CheckboxMark isOn size={48} />
        </div>
      </Showcase>
    </main>
  );
}
