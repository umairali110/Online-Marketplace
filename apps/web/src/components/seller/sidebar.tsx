'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingBag, Store, Users, Megaphone,
  Bot, Workflow, BarChart3, Wallet, UserCircle,RotateCcw
} from 'lucide-react';
import { clsx } from 'clsx';
import { LogoutButton } from '@/components/shared/logout-button';

const navItems = [
  { href: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/seller/products', label: 'Products', icon: Package },
  { href: '/seller/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/seller/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/seller/ai-employee', label: 'AI Employee', icon: Bot },
  { href: '/seller/automation', label: 'Automation', icon: Workflow },
  { href: '/seller/returns', label: 'Returns', icon: RotateCcw },
  { href: '/seller/store-builder', label: 'Store Settings', icon: Store },
  { href: '/seller/account', label: 'Account', icon: UserCircle },
];

const comingSoonItems = [
  { label: 'Customers', icon: Users },
  { label: 'Marketing', icon: Megaphone },
  { label: 'Finance', icon: Wallet },
];

export function SellerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-surface p-4">
      <div className="mb-6 flex items-center gap-2.5 px-2">
        <span className="flex h-7 w-7 items-center justify-center rounded bg-primary text-xs font-semibold text-white">OM</span>
        <span className="text-sm font-medium tracking-wide text-text-primary">Seller Panel</span>
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
        <div className="my-3 border-t border-border" />
        {comingSoonItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              title="Coming soon"
              className="flex cursor-not-allowed items-center gap-2.5 rounded-none border-l-2 border-transparent py-2.5 pl-3 text-sm text-text-muted/50"
            >
              <Icon size={15} />
              {item.label}
            </div>
          );
        })}
      </nav>
      <div className="border-t border-border pt-3">
        <LogoutButton className="w-full" />
      </div>
    </aside>
  );
}