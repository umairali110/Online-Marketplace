'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Store, AlertTriangle, Wallet, ShieldAlert, UserCircle, Users, Tag } from 'lucide-react';
import { clsx } from 'clsx';
import { LogoutButton } from '@/components/shared/logout-button';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/merchants', label: 'Merchants', icon: Store },
  { href: '/admin/providers', label: 'Providers', icon: Users },
  { href: '/admin/service-categories', label: 'Service Categories', icon: Tag },
  { href: '/admin/disputes', label: 'Disputes', icon: AlertTriangle },
  { href: '/admin/commissions', label: 'Payouts & Settlements', icon: Wallet },
  { href: '/admin/audit-log', label: 'Audit Log', icon: History },
  { href: '/admin/fraud-risk', label: 'Fraud & Risk', icon: ShieldAlert },
  { href: '/admin/profile', label: 'Profile', icon: UserCircle },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-navy p-4 text-white">
      <div className="mb-6 flex items-center gap-2.5 px-2">
        <span className="flex h-7 w-7 items-center justify-center rounded bg-primary text-xs font-semibold">OM</span>
        <span className="text-sm font-medium tracking-wide">Admin Panel</span>
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
                  ? 'border-primary font-medium text-white'
                  : 'border-transparent font-normal text-white/50 hover:text-white/80',
              )}
            >
              <Icon size={15} className={active ? 'text-primary' : 'text-white/40'} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 pt-3">
        <LogoutButton className="w-full border-white/20 bg-transparent text-white hover:bg-white/10" />
      </div>
    </aside>
  );
}