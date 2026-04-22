import Link from 'next/link';
import { ArrowRight, Cpu, Palette, Sparkles, Vibrate, Component, Layers } from 'lucide-react';
import { PageHeader } from '@/components/ds/showcase';

const SECTIONS = [
  { href: '/motion',     title: 'Motion',     icon: Sparkles, body: 'Six semantic springs. Pick by the meaning of the interaction, not its visual speed.' },
  { href: '/haptics',    title: 'Haptics',    icon: Vibrate,  body: 'Web Vibration API vocabulary mirroring the SwiftUI HapticEngine. Silent on iOS Safari.' },
  { href: '/colors',     title: 'Colors',     icon: Palette,  body: 'Brand green, halo tones, surfaces. Light + dark, all CSS-token-driven.' },
  { href: '/components', title: 'Components', icon: Component, body: 'PressableButton, CheckboxMark, QuantitySlider, SlideToConfirm, PedirBar, PackageCard.' },
  { href: '/prototype',  title: 'Prototype',  icon: Layers,   body: 'The full Confirm screen, end-to-end. Same interactions as the SwiftUI app.' },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader
        eyebrow="Adelante"
        title="A design system for shipping native-feel interactions on the web."
        description="One vocabulary for motion. One for haptics. Components that mirror the SwiftUI prototype, ported with attention to every spring, transition, and tap-state. The source of truth when building new screens."
      />

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map(({ href, title, icon: Icon, body }) => (
          <Link
            key={href}
            href={href}
            className="group relative flex flex-col gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-card p-6 transition-colors hover:border-foreground/40"
          >
            <Icon size={20} className="text-muted-foreground" />
            <div>
              <div className="text-base font-semibold">{title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
            <div className="mt-auto flex items-center text-sm font-medium text-muted-foreground group-hover:text-foreground">
              Open <ArrowRight size={14} className="ml-1 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-card-muted p-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Cpu size={16} /> The contract
          </div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>• Springs are vocabulary. Never inline values — add a name to <code className="rounded bg-foreground/10 px-1 text-[12px]">lib/springs.ts</code>.</li>
            <li>• Haptics are semantic. <code className="rounded bg-foreground/10 px-1 text-[12px]">.complete</code> ≠ <code className="rounded bg-foreground/10 px-1 text-[12px]">.delete</code> ≠ <code className="rounded bg-foreground/10 px-1 text-[12px]">.select</code>. Pick by meaning.</li>
            <li>• Components own their interaction; screens compose them. Bindings flow up only when overlays need to dismiss from outside.</li>
            <li>• The prototype is a <em>feeling</em>. No backend, no auth, no navigation.</li>
          </ul>
        </div>
        <div className="rounded-2xl bg-card-muted p-6">
          <div className="text-sm font-semibold">Stack at a glance</div>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Framework</dt><dd>Next.js + TypeScript (App Router)</dd>
            <dt className="text-muted-foreground">Styling</dt><dd>Tailwind v4, CSS tokens via <code className="text-[12px]">@theme</code></dd>
            <dt className="text-muted-foreground">Motion</dt><dd>motion/react (Framer Motion)</dd>
            <dt className="text-muted-foreground">Icons</dt><dd>lucide-react</dd>
            <dt className="text-muted-foreground">Theming</dt><dd>next-themes (class-based)</dd>
          </dl>
        </div>
      </section>
    </main>
  );
}
