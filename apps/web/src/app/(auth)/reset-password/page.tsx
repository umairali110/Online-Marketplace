'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OtpInput } from '@/components/ui/otp-input';
import { authApi } from '@/lib/auth-api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email') ?? '';

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.resetPassword({ email, code, newPassword });
      router.push('/login');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold text-text-primary">Reset Password</h1>
      <p className="mt-1 text-text-muted">
        Enter the code sent to <span className="font-medium text-text-primary">{email}</span>
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
        <div className="flex justify-center">
          <OtpInput value={code} onChange={setCode} />
        </div>
        <Input
          label="New Password"
          type="password"
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" className="w-full" loading={loading} disabled={code.length !== 6}>
          Reset Password
        </Button>
      </form>
    </div>
  );
}