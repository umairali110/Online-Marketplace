'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/auth-api';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/components/ui/toast';

const roleRedirect: Record<string, string> = {
  CUSTOMER: '/',
  SELLER: '/seller/dashboard',
  PROVIDER: '/provider/dashboard',
  ADMIN: '/admin/dashboard',
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refetch } = useAuth();
  const { show } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await authApi.login({ email, password });
      await refetch();
      show('Welcome back!');
      router.push(roleRedirect[user.role] ?? '/');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Login failed');
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
            Good to see you again.
          </h2>
          <p className="mt-3 text-white/70">
            Compare prices across real sellers and hire verified local service
            providers — all in one place.
          </p>
          <div className="mt-8 flex items-center gap-2 text-sm text-white/60">
            <ShieldCheck size={16} className="text-success" />
            Secure login, protected checkout
          </div>
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
            <h1 className="text-2xl font-bold text-text-primary">Welcome back</h1>
            <p className="mt-1 text-sm text-text-muted">Login to your account</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              {error && (
                <p className="rounded-btn bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
              )}

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-text-muted">
                  <input type="checkbox" className="rounded border-border" />
                  Remember me
                </label>
                <Link href="/forgot-password" className="font-medium text-primary">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" loading={loading}>
                Login
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-text-muted">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-medium text-primary">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}