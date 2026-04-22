import { PageHeader, Showcase } from '@/components/ds/showcase';

const TOKENS = [
  { name: 'background',         token: 'bg-background',       value: 'rgb(var(--surface-bg))',          desc: 'Screen background. Light gray in light, near-black in dark.' },
  { name: 'card',               token: 'bg-card',             value: 'rgb(var(--surface-card))',        desc: 'Card surface. White in light, dark gray in dark — never pure black.' },
  { name: 'card-muted',         token: 'bg-card-muted',       value: 'rgb(var(--surface-card-muted))',  desc: 'Slightly elevated surface. Used for showcase frames and inline blocks.' },
  { name: 'foreground',         token: 'text-foreground',     value: 'rgb(var(--fg-primary))',          desc: 'Primary text.' },
  { name: 'muted-foreground',   token: 'text-muted-foreground', value: 'rgb(var(--fg-secondary))',      desc: 'Secondary text. Labels, meta info.' },
  { name: 'brand',              token: 'bg-brand',            value: 'rgb(189, 222, 59)',               desc: 'Adelante green. PEDIR pill, CTAs.' },
  { name: 'brand-halo',         token: 'border-brand-halo',   value: 'rgb(133, 166, 41)',               desc: 'Pressed-state ring around green buttons.' },
  { name: 'halo-black',         token: 'border-halo-black',   value: 'rgb(140, 140, 140)',              desc: 'Pressed-state ring around black buttons.' },
  { name: 'halo-white',         token: 'border-halo-white',   value: 'rgb(210, 210, 210)',              desc: 'Pressed-state ring around white buttons (dark mode dropdown).' },
  { name: 'excess',             token: 'bg-excess',           value: 'rgb(234, 158, 158)',              desc: 'Over-delivered quantity background.' },
  { name: 'excess-dark',        token: 'bg-excess-dark',      value: 'rgb(217, 115, 115)',              desc: 'Over-delivered quantity thumb.' },
];

const RADII = [
  { name: 'pill',  token: 'rounded-pill',  value: '20px', desc: 'Pills, slider knob, menu pills, dropdowns, close X.' },
  { name: 'card',  token: 'rounded-card',  value: '16px', desc: 'PackageCard outer container.' },
  { name: 'check', token: 'rounded-check', value: '6px',  desc: 'Custom checkbox.' },
];

export default function ColorsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10 space-y-10">
      <PageHeader
        eyebrow="Tokens"
        title="Color and shape vocabulary."
        description="All values live in CSS variables under @theme so they participate in dark mode automatically. Components reference Tailwind tokens, not raw hex."
      />

      <Showcase title="Surfaces & text">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOKENS.map((t) => (
            <div key={t.name} className="overflow-hidden rounded-xl ring-1 ring-black/5 dark:ring-white/5">
              <div className={`h-20 ${t.token.startsWith('bg-') ? t.token : 'bg-card'} ${t.token.startsWith('text-') ? `flex items-center px-4 ${t.token}` : ''} ${t.token.startsWith('border-') ? `border-4 ${t.token}` : ''}`}>
                {t.token.startsWith('text-') && <span className="text-base">Aa</span>}
              </div>
              <div className="bg-card p-3">
                <div className="font-mono text-[12px]">{t.token}</div>
                <div className="mt-1 text-[12px] text-muted-foreground">{t.desc}</div>
                <div className="mt-1 font-mono text-[11px] text-muted-foreground">{t.value}</div>
              </div>
            </div>
          ))}
        </div>
      </Showcase>

      <Showcase title="Radii">
        <div className="grid gap-3 sm:grid-cols-3">
          {RADII.map((r) => (
            <div key={r.name} className="rounded-xl bg-card p-4">
              <div className={`mb-3 h-20 w-full bg-foreground/80 ${r.token}`} />
              <div className="font-mono text-[12px]">{r.token}</div>
              <div className="text-[12px] text-muted-foreground">{r.desc}</div>
              <div className="font-mono text-[11px] text-muted-foreground">{r.value}</div>
            </div>
          ))}
        </div>
      </Showcase>
    </main>
  );
}
