'use client';

import Link from 'next/link';
import {
  ArrowRight,
  UserCircle,
  ShoppingCart,
  Search,
  ChevronDown,
} from 'lucide-react';

import { useAuth } from '@/providers/auth-provider';

const accountRouteByRole: Record<string, string> = {
  CUSTOMER: '/account',
  SELLER: '/seller/account',
  PROVIDER: '/provider/account',
  ADMIN: '/admin/profile',
};

export function HomeTopBar() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white shadow-sm">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-4 sm:px-8 lg:px-10">

        {/* LOGO */}
        <Link
          href="/"
          className="shrink-0 text-lg font-black tracking-tight text-slate-950 sm:text-xl"
        >
          Online
          <span className="text-blue-600">.</span>
          Marketplace
        </Link>

        {/* SEARCH */}
        <div className="hidden flex-1 md:block">
          <div className="mx-auto flex h-11 max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition focus-within:border-blue-400 focus-within:bg-white">
            <div className="hidden items-center gap-1 border-r border-slate-200 px-3 text-xs font-semibold text-slate-600 lg:flex">
              All Categories
              <ChevronDown size={13} />
            </div>

            <div className="flex flex-1 items-center gap-2 px-3">
              <Search
                size={17}
                className="text-slate-400"
              />

              <input
                type="text"
                placeholder="Search products, stores or services..."
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            <button
              type="button"
              className="flex w-12 items-center justify-center bg-blue-600 text-white transition hover:bg-blue-700"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-5 lg:flex">
          <Link
            href="/register"
            className="whitespace-nowrap text-xs font-semibold text-slate-700 transition hover:text-blue-600"
          >
            Become a Seller
          </Link>

          <Link
            href="/orders"
            className="whitespace-nowrap text-xs font-semibold text-slate-700 transition hover:text-blue-600"
          >
            Track Order
          </Link>
        </nav>

        {/* AUTH */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {loading ? (
            <div className="h-10 w-24 animate-pulse rounded-xl bg-slate-100" />
          ) : user ? (
            <>
              <Link
                href={accountRouteByRole[user.role] ?? '/account'}
                className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 transition hover:border-blue-300 hover:text-blue-600 sm:flex"
              >
                <UserCircle size={17} />
                {user.name?.split(' ')[0] ?? 'Profile'}
              </Link>

              <Link
                href="/cart"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
                aria-label="Shopping cart"
              >
                <ShoppingCart size={18} />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition hover:text-blue-600 sm:block"
              >
                Sign In
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 sm:px-5"
              >
                Sign Up
                <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      </div>

      {/* MOBILE SEARCH */}
      <div className="border-t border-slate-100 px-4 py-3 md:hidden">
        <div className="flex h-11 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <div className="flex flex-1 items-center gap-2 px-3">
            <Search
              size={17}
              className="text-slate-400"
            />

            <input
              type="text"
              placeholder="Search products, stores or services..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          <button
            type="button"
            className="flex w-12 items-center justify-center bg-blue-600 text-white"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}