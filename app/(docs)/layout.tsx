import { SiteHeader } from '@/components/ds/site-header';

/**
 * Layout for the design-system docs routes. The /app route lives outside
 * this group so it renders without the site chrome.
 */
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  );
}
