'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Search, X } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { useCart } from '@/hooks/use-cart';
import { NotificationBell } from './notification-bell';
import { HeaderSearch } from './header-search';

export function Header() {
  const { user } = useAuth();
  const { data: cart } = useCart();
  const totalCount = cart?.items.reduce((sum, i) => sum + i.qty, 0) ?? 0;
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        {!mobileSearchOpen && (
          <Link href="/" className="flex items-center gap-2 font-bold text-text-primary">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm text-white">OM</span>
            <span className="hidden sm:inline">Online Marketplace</span>
          </Link>
        )}

        <HeaderSearch className="hidden flex-1 md:block" />

        {/* Mobile: search toggles into the header bar instead of hiding entirely */}
        <div className="flex flex-1 items-center gap-3 md:hidden">
          {mobileSearchOpen ? (
            <div className="flex flex-1 items-center gap-2">
              <HeaderSearch className="flex-1" autoFocus />
              <button onClick={() => setMobileSearchOpen(false)} className="text-text-muted">
                <X size={20} />
              </button>
            </div>
          ) : (
            <button onClick={() => setMobileSearchOpen(true)} className="ml-auto text-text-primary">
              <Search size={20} />
            </button>
          )}
        </div>

        {!mobileSearchOpen && (
          <div className="ml-auto flex items-center gap-4 md:ml-0">
            <Link href="/cart" className="relative text-text-primary">
              <ShoppingCart size={20} />
              {totalCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {totalCount}
                </span>
              )}
            </Link>
            <NotificationBell />
            <Link href={user ? '/account' : '/login'} className="text-text-primary">
              <User size={20} />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}