import type { Metadata, Viewport } from 'next';
import { OrderScreen } from '@/components/order1/order-screen';

export const metadata: Metadata = {
  title: 'Adelante — Order',
  description: 'Order prototype (Lab v1)',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Adelante',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

/**
 * Order prototype — separate from /app. Mirrors the Figma "Lab" file
 * (RcRhbG69pqHbtzUeBi9vLx, node 254:1280): a single supplier card that
 * expands to reveal three radio options, with a slide-to-confirm Pedir
 * bar at the bottom.
 */
export default function Order1Page() {
  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-background">
      <OrderScreen />
    </div>
  );
}
