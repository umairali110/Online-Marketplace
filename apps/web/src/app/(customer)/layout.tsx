'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/shared/header';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  // Home page has its own top bar (HomeTopBar) and manages its own
  // full-width sections + Footer — don't double-wrap it.
  if (isHome) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </>
  );
}