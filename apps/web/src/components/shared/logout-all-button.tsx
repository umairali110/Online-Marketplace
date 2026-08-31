'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/auth-api';
import { useAuth } from '@/providers/auth-provider';

export function LogoutAllButton() {
  const router = useRouter();
  const { refetch } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!confirm('This will sign you out on every device. Continue?')) return;
    setLoading(true);
    try {
      await authApi.logoutAll();
      await refetch();
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleClick} disabled={loading} className="text-xs font-medium text-danger disabled:opacity-50">
      {loading ? 'Logging out...' : 'Log out of all devices'}
    </button>
  );
}