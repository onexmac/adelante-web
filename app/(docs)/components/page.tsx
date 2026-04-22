import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { PageHeader } from '@/components/ds/showcase';

const COMPONENTS = [
  { href: '/components/pressable-button', name: 'PressableButton', summary: 'Halo press state in a contextual color, no scale, no layout push.' },
  { href: '/components/checkbox-mark',    name: 'CheckboxMark',    summary: 'Custom dark-square + white-checkmark checkbox visual.' },
  { href: '/components/quantity-slider',  name: 'QuantitySlider',  summary: 'Drag thumb to set received qty. Red track on excess.' },
  { href: '/components/slide-to-confirm', name: 'SlideToConfirm',  summary: 'Slide-to-commit knob with rubber-band, ticks, and tap-nudge.' },
  { href: '/components/pedir-bar',        name: 'PedirBar',        summary: 'Bottom-bar state machine: collapsed / armed / menu-open.' },
  { href: '/components/package-card',     name: 'PackageCard',     summary: 'Supplier package card with expandable items + qty sliders.' },
];

export default function ComponentsIndex() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        eyebrow="Components"
        title="The building blocks."
        description="Each component is independently usable, has its own playground, and ports a specific piece of the SwiftUI prototype. Tap one to see it in isolation."
      />
      <div className="grid gap-3 md:grid-cols-2">
        {COMPONENTS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group flex items-start gap-4 rounded-2xl border border-black/10 dark:border-white/10 bg-card p-5 transition-colors hover:border-foreground/40"
          >
            <div className="flex-1">
              <div className="font-mono text-sm font-semibold">{c.name}</div>
              <div className="mt-1 text-sm text-muted-foreground">{c.summary}</div>
            </div>
            <ArrowRight size={16} className="mt-1 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </main>
  );
}
