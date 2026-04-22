import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

const NAV = [
  { href: '/',           label: 'Overview' },
  { href: '/motion',     label: 'Motion'   },
  { href: '/haptics',    label: 'Haptics'  },
  { href: '/colors',     label: 'Colors'   },
  { href: '/components', label: 'Components' },
  { href: '/prototype',  label: 'Prototype' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-black/10 dark:border-white/10 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-8 w-8 rounded-lg bg-brand" />
          <div>
            <div className="text-sm font-bold leading-none">Adelante</div>
            <div className="text-[11px] text-muted-foreground leading-tight">Design System</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
