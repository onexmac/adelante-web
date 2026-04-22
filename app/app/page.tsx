import type { Metadata, Viewport } from 'next';
import { PackageConfirmScreen } from '@/components/package-confirm-screen';

export const metadata: Metadata = {
  title: 'Adelante',
  description: 'Prototype',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Adelante',
  },
};

// Mobile-web-app feel: full-bleed, no pinch-zoom.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

/**
 * Full-viewport prototype. No site chrome — this route lives outside the
 * (docs) layout group. Share this URL when using the prototype as a web app
 * or adding to the iOS home screen.
 */
export default function AppPage() {
  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-background">
      <PackageConfirmScreen />
    </div>
  );
}
