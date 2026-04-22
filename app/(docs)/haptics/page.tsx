'use client';

import { useEffect, useState } from 'react';
import { haptic, hapticsSupported, type HapticEvent } from '@/lib/haptic';
import { PageHeader, Showcase } from '@/components/ds/showcase';
import { PressableButton, halo } from '@/components/ui/pressable-button';

const ENTRIES: { name: HapticEvent; meaning: string }[] = [
  { name: 'select',   meaning: 'Single tap. Confirm a focus / hit. Lightest touch.' },
  { name: 'drag',     meaning: 'Drag passed a discrete milestone (e.g. quarter-progress).' },
  { name: 'complete', meaning: 'Successful confirmation, commit. Three-pulse pattern.' },
  { name: 'delete',   meaning: 'Removal or warning. Two-pulse.' },
  { name: 'error',    meaning: 'Validation failure. Five-pulse alarm.' },
];

export default function HapticsPage() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [userAgent, setUserAgent] = useState<string>('');
  const [lastFired, setLastFired] = useState<HapticEvent | null>(null);

  useEffect(() => {
    // eslint-disable-next-line
    setSupported(hapticsSupported());
    // eslint-disable-next-line
    setUserAgent(typeof navigator !== 'undefined' ? navigator.userAgent : '');
  }, []);

  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !/CriOS|FxiOS/.test(userAgent);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-10">
      <PageHeader
        eyebrow="Haptics"
        title="A haptic vocabulary, not decoration."
        description="Five semantic events. Pick by the meaning of the interaction, not by which pattern feels nice. Calls are safe on every platform — unsupported surfaces no-op silently."
      />

      <Showcase title="Support on this device">
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground">Vibration API:</span>{' '}
            {supported === null ? (
              '…'
            ) : supported ? (
              <span className="font-semibold text-brand-halo">available</span>
            ) : (
              <span className="font-semibold text-muted-foreground">not supported</span>
            )}
          </div>

          {isIOS && (
            <div className="rounded-lg bg-foreground/5 p-4 text-[13px] leading-relaxed">
              <div className="font-semibold text-foreground mb-1">iOS Safari doesn&apos;t support web haptics.</div>
              <p className="text-muted-foreground">
                Apple has never exposed the Taptic Engine to the browser —
                not in regular Safari, not in PWAs added to the Home Screen,
                not in any iOS version through 18. <code className="rounded bg-foreground/10 px-1">navigator.vibrate</code> is
                undefined. For real haptics on iPhone, wrap this app in{' '}
                <a
                  href="https://capacitorjs.com/docs/apis/haptics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 decoration-foreground/40 hover:text-foreground"
                >
                  Capacitor + @capacitor/haptics
                </a>{' '}
                — keeps the same React codebase, adds a native bridge.
              </p>
            </div>
          )}

          {!isIOS && supported === false && (
            <p className="text-[13px] text-muted-foreground">
              This browser / device doesn&apos;t expose a vibration API, or vibration is disabled in system settings.
              Try on Android Chrome to feel the patterns.
            </p>
          )}

          {supported && (
            <p className="text-[13px] text-muted-foreground">
              Patterns should be perceptible here. If they aren&apos;t, check your device&apos;s system haptics / vibration setting.
            </p>
          )}
        </div>
      </Showcase>

      <Showcase title="Try them" description="Tap to fire. On supporting devices you'll feel the pattern.">
        <div className="grid gap-3 sm:grid-cols-2">
          {ENTRIES.map(({ name, meaning }) => (
            <div key={name} className="flex items-center gap-4 rounded-xl bg-card p-3">
              <PressableButton
                haloColor={halo.black}
                cornerRadius={12}
                pressDelayMs={0}
                onClick={() => {
                  haptic[name]();
                  setLastFired(name);
                }}
                style={{ width: 88, height: 44, borderRadius: 12, backgroundColor: 'black' }}
                className="flex items-center justify-center text-sm font-semibold text-white"
              >
                {name}
              </PressableButton>
              <div className="flex-1 text-sm text-muted-foreground">{meaning}</div>
            </div>
          ))}
        </div>
        {lastFired && (
          <p className="mt-3 text-xs text-muted-foreground">
            Last fired: <code className="rounded bg-foreground/10 px-1">{lastFired}</code>
          </p>
        )}
      </Showcase>
    </main>
  );
}
