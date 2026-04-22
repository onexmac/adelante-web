import { PageHeader } from '@/components/ds/showcase';
import { PackageConfirmScreen } from '@/components/package-confirm-screen';

export default function PrototypePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
      <PageHeader
        eyebrow="Prototype"
        title="Confirm flow"
        description="The full screen. Tap the green pill to arm. Drag right to confirm. Tap the chevron-up to open the menu. Tap a card's text area to expand."
      />
      <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-3xl ring-1 ring-black/10 dark:ring-white/10">
        <PackageConfirmScreen />
      </div>
    </main>
  );
}
