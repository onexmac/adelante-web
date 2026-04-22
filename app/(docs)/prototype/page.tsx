import Link from 'next/link';
import { ArrowSquareOut } from '@phosphor-icons/react/dist/ssr';
import { PageHeader } from '@/components/ds/showcase';
import { PackageConfirmScreen } from '@/components/package-confirm-screen';

export default function PrototypePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
      <PageHeader
        eyebrow="Prototype"
        title="Confirm flow"
        description="The full screen in a phone frame. Tap the green pill to arm. Drag right to confirm. Tap the chevron-up to open the menu. Tap a card's text area to expand."
      />

      <div className="flex items-center justify-center">
        <Link
          href="/app"
          className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-card px-4 py-2 text-sm font-medium hover:border-foreground/40"
        >
          Open full-screen <ArrowSquareOut size={14} weight="bold" />
        </Link>
      </div>

      <div className="mx-auto h-[844px] w-full max-w-[420px] overflow-hidden rounded-3xl ring-1 ring-black/10 dark:ring-white/10">
        <PackageConfirmScreen />
      </div>
    </main>
  );
}
