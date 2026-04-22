'use client';

import { useState } from 'react';
import { PageHeader, Showcase } from '@/components/ds/showcase';
import { QuantitySlider } from '@/components/ui/quantity-slider';

export default function QuantitySliderPage() {
  const [a, setA] = useState(10);
  const [b, setB] = useState(40);
  const [c, setC] = useState(0);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-10" data-prototype>
      <PageHeader
        eyebrow="Component"
        title="QuantitySlider"
        description="Drag the thumb to adjust the received quantity. Track shows requested marker, fills gray below requested and red above (over-delivery). Supports overshoot up to 2× requested."
      />
      <Showcase title="Below requested" description="received=10 of requested=20">
        <QuantitySlider received={a} requested={20} onChange={setA} />
      </Showcase>
      <Showcase title="Over requested" description="received=40 of requested=20 — track turns red, label shows the actual count.">
        <QuantitySlider received={b} requested={20} onChange={setB} />
      </Showcase>
      <Showcase title="Zero requested" description="No requested target; max overshoot is 10.">
        <QuantitySlider received={c} requested={0} onChange={setC} />
      </Showcase>
    </main>
  );
}
