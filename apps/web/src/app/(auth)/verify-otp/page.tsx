'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OtpInput } from '@/components/ui/otp-input';
import { authApi } from '@/lib/auth-api';

const RESEND_SECONDS = 45;

export default function VerifyOtpPage() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get('email') ?? '';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.verifyOtp({ email, code });
      router.push('/login');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.resendOtp(email);
      setCountdown(RESEND_SECONDS);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="text-xl font-bold text-text-primary">
            MarketHub
          </Link>
        </div>

        <div className="rounded-card border border-border bg-surface p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck size={24} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Verify your email</h1>
          <p className="mt-1 text-text-muted">
            We sent a 6-digit code to{' '}
            <span className="font-medium text-text-primary">{email}</span>
          </p>

          <form onSubmit={handleVerify} className="mt-6 space-y-5">
            <OtpInput value={code} onChange={setCode} />
            {error && (
              <p className="rounded-btn bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
            )}
            <Button type="submit" className="w-full" loading={loading} disabled={code.length !== 6}>
              Verify
            </Button>
          </form>

          <div className="mt-4 text-sm text-text-muted">
            {countdown > 0 ? (
              <span>Resend code in 00:{countdown.toString().padStart(2, '0')}</span>
            ) : (
              <button onClick={handleResend} disabled={resending} className="font-medium text-primary">
                {resending ? 'Sending...' : 'Resend code'}
              </button>
            )}
          </div>

          <button
            onClick={() => router.push('/register')}
            className="mt-2 text-sm font-medium text-primary"
          >
            Change email
          </button>
        </div>
      </div>
    </div>
  );
}