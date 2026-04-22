import { PageHeader, Showcase } from '@/components/ds/showcase';
import { PressableButton, halo } from '@/components/ui/pressable-button';

export default function PressableButtonPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-10">
      <PageHeader
        eyebrow="Component"
        title="PressableButton"
        description="On press, a thick stroke ring renders OUTSIDE the button's bounds in a contextual color (muted shade of the button's own fill). Halo holds full opacity for 120ms after release so even a 20ms tap registers."
      />

      <Showcase title="Variants" description="Pass haloColor and the button's own fill. Three Figma variants, three halo tones.">
        <div className="flex flex-wrap items-center gap-6">
          <PressableButton
            haloColor={halo.green}
            cornerRadius={20}
            style={{ backgroundColor: 'rgb(189,222,59)', width: 110, height: 80, borderRadius: 20 }}
            className="flex items-center justify-center font-bold text-black"
          >
            label
          </PressableButton>
          <PressableButton
            haloColor={halo.black}
            cornerRadius={20}
            style={{ backgroundColor: 'black', width: 110, height: 80, borderRadius: 20 }}
            className="flex items-center justify-center font-bold text-white"
          >
            label
          </PressableButton>
          <PressableButton
            haloColor={halo.white}
            cornerRadius={20}
            style={{ backgroundColor: 'white', width: 110, height: 80, borderRadius: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            className="flex items-center justify-center font-bold text-black"
          >
            label
          </PressableButton>
        </div>
      </Showcase>

      <Showcase title="Smaller buttons" description="haloWidth scales down for compact controls — 3pt for the checkbox, 8pt default for pills.">
        <div className="flex items-center gap-6">
          <PressableButton
            haloColor={halo.black}
            haloWidth={3}
            cornerRadius={6}
            style={{ backgroundColor: 'rgb(46,46,46)', width: 32, height: 32, borderRadius: 6 }}
            className="flex items-center justify-center text-white"
          >
            ✓
          </PressableButton>
          <span className="text-sm text-muted-foreground">3pt halo, 6pt radius — checkbox preset.</span>
        </div>
      </Showcase>

      <Showcase title="Press delay" description="By default, onClick fires 100ms after pointerup so the halo can register on fast taps.">
        <pre className="overflow-x-auto rounded-lg bg-foreground/5 p-4 text-[12px] leading-relaxed">
{`<PressableButton
  haloColor={halo.green}
  cornerRadius={20}
  pressDelayMs={100}                      // default
  onClick={() => arm()}
  className="bg-brand text-black ..."
>
  PEDIR
</PressableButton>`}
        </pre>
      </Showcase>

      <Showcase title="Why type='button'?" description="Inside a <form>, an unspecified <button> defaults to type='submit' and triggers navigation. PressableButton hard-codes type='button' so the prototype never accidentally posts.">
        <p className="text-sm text-muted-foreground">No fix needed in app code — the safety lives in the component.</p>
      </Showcase>
    </main>
  );
}
