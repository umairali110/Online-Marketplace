'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/auth-api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      setTimeout(() => router.push(`/reset-password?email=${encodeURIComponent(email)}`), 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary">Forgot Password</h1>
      <p className="mt-1 text-text-muted">Enter your email and we&apos;ll send you a reset code.</p>

      {sent ? (
        <p className="mt-6 text-sm text-success">
          If that email exists, a reset code has been sent. Redirecting...
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" loading={loading}>
            Send Reset Code
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-text-muted">
        Remembered your password?{' '}
        <Link href="/login" className="font-medium text-primary">Login</Link>
      </p>
    </div>
  );
}