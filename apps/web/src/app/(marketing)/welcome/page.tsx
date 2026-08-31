import Link from 'next/link';
import { Button } from '@/components/ui/button';

const features = [
  'AI-Powered Shopping Assistant',
  'Best Deal Guarantee',
  'Verified Sellers & Reviews',
  'Secure Payments & Buyer Protection',
  'Multi-store Comparison',
];

export default function SplashPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-white">
        OM
      </div>
      <h1 className="text-2xl font-bold text-text-primary">Online Marketplace</h1>
      <p className="mt-2 text-text-muted">Shop. Compare. Trust. Get the Best.</p>
      <ul className="mt-6 space-y-2 text-left text-sm text-text-muted">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {f}
          </li>
        ))}
      </ul>
      <Link href="/onboarding" className="mt-10 w-full max-w-xs">
        <Button className="w-full">Get Started</Button>
      </Link>
    </div>
  );
}