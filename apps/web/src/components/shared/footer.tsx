import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
const columns = [
  {
    title: 'Shop',
    links: [
      { label: 'All Categories', href: '/category/electronics' },
      { label: 'Best Deals', href: '/' },
      { label: 'Local Stores', href: '/stores/local' },
      { label: 'Track Order', href: '/orders' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Browse Services', href: '/services' },
      { label: 'Find Providers Near You', href: '/providers/nearby' },
      { label: 'Post a Job', href: '/jobs/new' },
      { label: 'Become a Provider', href: '/register' },
    ],
  },
  {
    title: 'Sell',
    links: [
      { label: 'Start Selling', href: '/register' },
      { label: 'Seller Dashboard', href: '/seller/dashboard' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Refund & Return Policy', href: '/refund-policy' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      {/* thin accent line ties back to the hero gradient */}
      <div className="h-1 bg-gradient-to-r from-primary to-success" />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-text-primary">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm text-white">
                OM
              </span>
              Online Marketplace
            </div>
            <p className="mt-3 max-w-[22ch] text-sm leading-relaxed text-text-muted">
              Shop, compare, and trust. Products and local services, all in one place.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-primary">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-muted transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 border-t border-border pt-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} Online Marketplace. All rights reserved.
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck size={13} /> Cash on Delivery only — no online payment required
          </span>
        </div>
      </div>
    </footer>
  );
}