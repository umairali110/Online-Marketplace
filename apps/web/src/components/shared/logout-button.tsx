'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/auth-api';
import { useAuth } from '@/providers/auth-provider';

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const { refetch } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authApi.logout();
      await refetch();
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" loading={loading} onClick={handleLogout} className={className}>
      <LogOut size={14} className="mr-1.5 inline" />
      Logout
    </Button>
  );
}