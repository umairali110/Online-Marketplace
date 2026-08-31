'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ShoppingBag, Store, Wrench, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/auth-api';

const roleOptions = [
  { value: 'CUSTOMER', label: 'Shop', icon: ShoppingBag },
  { value: 'SELLER', label: 'Sell Products', icon: Store },
  { value: 'PROVIDER', label: 'Offer Services', icon: Wrench },
] as const;

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'CUSTOMER' | 'SELLER' | 'PROVIDER'>('CUSTOMER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.register({ name, email, password, role });
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* ================= BRAND PANEL ================= */}
      <div className="relative hidden overflow-hidden bg-navy px-12 py-16 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-success/20 blur-3xl" />

        <div className="relative">
          <Link href="/" className="text-xl font-bold text-white">
            MarketHub
          </Link>
        </div>

        <div className="relative max-w-md">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
            <Sparkles size={12} /> AI-powered marketplace
          </span>
          <h2 className="mt-4 text-3xl font-bold leading-tight text-white">
            Join millions of smart shoppers.
          </h2>
          <p className="mt-3 text-white/70">
            Shop trusted stores, sell your products, or offer your services —
            all from one account.
          </p>
        </div>

        <div className="relative text-xs text-white/40">
          © {new Date().getFullYear()} MarketHub. All rights reserved.
        </div>
      </div>

      {/* ================= FORM PANEL ================= */}
      <div className="flex items-center justify-center bg-bg px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center lg:hidden">
            <Link href="/" className="text-xl font-bold text-text-primary">
              MarketHub
            </Link>
          </div>

          <div className="rounded-card border border-border bg-surface p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-text-primary">Create your account</h1>
            <p className="mt-1 text-sm text-text-muted">Join millions of smart shoppers</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Input
                label="Full Name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Email or Phone"
                type="email"
                placeholder="Enter your email or phone"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-[34px] text-text-muted hover:text-text-primary"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">
                  I want to
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {roleOptions.map((opt) => {
                    const Icon = opt.icon;
                    const active = role === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setRole(opt.value)}
                        className={`flex h-16 flex-col items-center justify-center gap-1 rounded-btn border text-xs font-medium transition-colors ${
                          active
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border text-text-muted hover:border-primary/40'
                        }`}
                      >
                        <Icon size={16} />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <p className="rounded-btn bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
              )}

              <Button type="submit" className="w-full" loading={loading}>
                Sign up
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-text-muted">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}