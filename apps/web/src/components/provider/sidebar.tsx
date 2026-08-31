'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, ClipboardList, MessageCircle, UserCircle, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { LogoutButton } from '@/components/shared/logout-button';

const navItems = [
  { href: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/provider/gigs', label: 'My Gigs', icon: Sparkles },
  { href: '/provider/jobs', label: 'Job Feed', icon: Briefcase },
  { href: '/provider/applications', label: 'My Applications', icon: ClipboardList },
  { href: '/provider/messages', label: 'Messages', icon: MessageCircle },
  { href: '/provider/account', label: 'Account', icon: UserCircle },
];

export function ProviderSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-surface p-4">
      <div className="mb-6 flex items-center gap-2.5 px-2">
        <span className="flex h-7 w-7 items-center justify-center rounded bg-primary text-xs font-semibold text-white">OM</span>
        <span className="text-sm font-medium tracking-wide text-text-primary">Provider Panel</span>
      </div>
      <nav className="flex-1 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-2.5 rounded-none border-l-2 py-2.5 pl-3 text-sm transition-colors',
                active
                  ? 'border-primary font-medium text-primary'
                  : 'border-transparent font-normal text-text-muted hover:text-text-primary',
              )}
            >
              <Icon size={15} className={active ? 'text-primary' : 'text-text-muted'} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border pt-3">
        <LogoutButton className="w-full" />
      </div>
    </aside>
  );
}